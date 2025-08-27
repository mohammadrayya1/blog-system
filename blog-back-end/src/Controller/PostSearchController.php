<?php
namespace App\Controller;

use App\Service\PostSearch;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class PostSearchController
{
    public function __construct(private PostSearch $es) {}

    #[Route('/api/posts/search', name: 'api_posts_search', methods: ['GET'])]
    public function search(Request $r): JsonResponse
    {
        $params = [
            'q'         => $r->query->get('q',''),
            'mode'      => $r->query->get('mode','trending'), // trending|weekly|all
            'category'  => $r->query->get('category'),
            'account_id' => $r->query->getInt('account_id', 0) ?: null,
            'from'      => (int)$r->query->get('from', 0),
            'size'      => (int)$r->query->get('size', 20),
        ];

        $raw = $this->es->search($params);

        $hits = array_map(function($h){
            $s = $h['_source'];
            return [
                'id'        => $s['id'],
                'snippet'   => $h['highlight']['content'][0] ?? null,
                'category'  => $s['category'] ?? null,
                'createdAt' => $s['created_at'] ?? null,
                'likes'     => $s['likes_count'] ?? 0,
                'comments'  => $s['comments_count'] ?? 0,
                'score'     => $h['_score'],
                'image'     => $s['image'] ?? null,
            ];
        }, $raw['hits']['hits'] ?? []);

        return new JsonResponse([
            'total' => $raw['hits']['total']['value'] ?? 0,
            'data'  => $hits
        ]);
    }
}
