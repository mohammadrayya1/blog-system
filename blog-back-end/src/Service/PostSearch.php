<?php
namespace App\Service;

use App\Entity\Post;
use Elastic\Elasticsearch\Client;

class PostSearch
{
    public const INDEX = 'posts_v2';

    public function __construct( private  readonly Client $es) {}

    public function createIndexIfMissing(): void
    {
        if ($this->es->indices()->exists(['index' => self::INDEX])->asBool()) {
            return;
        }

        $this->es->indices()->create([
            'index' => self::INDEX,
            'body'  => [
                'mappings' => [
                    'properties' => [
                        'id'              => ['type' => 'integer'],
                        'account_id'      => ['type' => 'integer'],
                        'content'         => ['type' => 'text', 'analyzer' => 'arabic'],
                        'image'           => ['type' => 'keyword'],
                        'category'        => ['type' => 'keyword'],
                        'created_at'      => ['type' => 'date'],
                        'likes_count'     => ['type' => 'integer'],
                        'comments_count'  => ['type' => 'integer'],
                    ]
                ]
            ]
        ]);
    }


    public function toDoc(Post $post): array
    {

        $categoryKey = '';
        $cat = $post->getCategory();
        if ($cat) {
            if (method_exists($cat, 'getSlug') && $cat->getSlug()) {
                $categoryKey = (string) $cat->getSlug();
            } elseif (method_exists($cat, 'getName') && $cat->getName()) {
                $categoryKey = (string) $cat->getName();
            }
        }

        $accountId = $post->getAccount()?->getId();

        return [
            'id'             => $post->getId(),
            'account_id'     => $accountId ?? 0,
            'content'        => (string) ($post->getContent() ?? ''),
            'image'          => (string) ($post->getImage() ?? ''),
            'category'       => $categoryKey,
            'created_at'     => $post->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'likes_count'    => (int) ($post->getLikes() ?? 0),
            'comments_count' => $post->getComments()->count(),
        ];
    }


    public function index(Post $post): void
    {
        $this->es->index([
            'index'   => self::INDEX,
            'id'      => (string) $post->getId(),
            'body'    => $this->toDoc($post),
            'refresh' => 'false',
        ]);
    }


    public function partialUpdate(int $postId, array $fields): void
    {
        $this->es->update([
            'index'   => self::INDEX,
            'id'      => (string) $postId,
            'body'    => ['doc' => $fields],
            'refresh' => 'false',
        ]);
    }

    public function delete(int $postId): void
    {
        $this->es->delete([
            'index'   => self::INDEX,
            'id'      => (string) $postId,
            'refresh' => 'false',
        ]);
    }


    public function search(array $params): array
    {
        $q         = trim((string)($params['q'] ?? ''));
        $mode      = $params['mode'] ?? 'trending';
        $size      = min((int)($params['size'] ?? 20), 100);
        $from      = max((int)($params['from'] ?? 0), 0);
        $category  = $params['category'] ?? null;
        $accountId = isset($params['account_id']) ? (int)$params['account_id'] : null;

        $filters = [];
        if ($category)  { $filters[] = ['term' => ['category' => $category]]; }
        if ($accountId) { $filters[] = ['term' => ['account_id' => $accountId]]; }

        $baseQuery = $q !== ''
            ? [
                'multi_match' => [
                    'query' => $q,
                    'fields' => ['content^1.5'],
                    'type' => 'best_fields',
                    'minimum_should_match' => '75%'
                ]

            ]
            : ['match_all' => (object)[]];


        $functions = [
            ['field_value_factor' => ['field' => 'likes_count',    'factor' => 2, 'missing' => 0]],
            ['field_value_factor' => ['field' => 'comments_count', 'factor' => 1, 'missing' => 0]],
        ];

        if ($mode === 'trending') {
            $functions[] = ['gauss' => ['created_at' => ['origin' => 'now', 'scale' => '36h', 'decay' => 0.5]]];
        } elseif ($mode === 'weekly') {
            $filters[] = ['range' => ['created_at' => ['gte' => 'now-7d/d']]];
        }

        $body = [
            'from'  => $from,
            'size'  => $size,
            'query' => [
                'function_score' => [
                    'query'      => ['bool' => ['filter' => $filters, 'must' => [$baseQuery]]],
                    'boost_mode' => 'sum',
                    'score_mode' => 'sum',
                    'functions'  => $functions
                ]
            ],
            'highlight' => [
                'pre_tags' => ['<mark>'],
                'post_tags'=> ['</mark>'],
                'fields'   => ['content' => new \stdClass()]
            ]
        ];

        return $this->es->search([
            'index' => self::INDEX,
            'body'  => $body
        ])->asArray();
    }
}
