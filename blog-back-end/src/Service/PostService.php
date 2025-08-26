<?php
namespace App\Service;

use App\DtoEntity\CommentDTO;
use App\DtoEntity\CreatePostDTO;
use App\Entity\AbstructAccount;
use App\Entity\Comment;
use App\Entity\Like;
use App\Entity\Post;
use App\Repository\CategoryRepository;
use App\Repository\LikeRepository;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class PostService
{
    public function __construct(private readonly PostRepository $postRepository,
                                private readonly CategoryRepository $categoryRepository,
                                private readonly LikeRepository $likeRepository,
                                private readonly Security $security,
                                private readonly ValidatorInterface $validator,
                                private EntityManagerInterface $entityManager,
                                private readonly LocalFileUploadService $uploader,
                                private string $uploadPostDir,
                                private string $uploadPostPath,) {}

    // PostService.php
    public function getAllposts(Request $request): array
    {
        $page  = max(1, (int) $request->query->get('page', 1));
        $limit = min(50, max(1, (int) $request->query->get('limit', 10)));

        $catParam = $request->query->get('cat');
        $categoryName = $this->resolveCategoryName($catParam);

        [$posts, $total] = $this->postRepository
            ->findPaginatedPosts($page, $limit, $categoryName);

        $items = array_map(fn($p) => [
            'id'          => $p->getId(),
            'content' => $p->getContent(),
            'owner'       => $p->getAccount()->getFirstName(),
            'image'       => $p->getImage(),
            'category'    => $p->getCategory()?->getName(),
            'createdAt'   => $p->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $posts);

        return [
            'posts'   => $items,
            'page'    => $page,
            'limit'   => $limit,
            'total'   => $total,
            'hasMore' => ($page * $limit) < $total,
        ];
    }



    public  function getPostById(int $id,$http){
        $post =$this->postRepository->find($id);

        $user = $this->security->getUser();
        $likedByMe = false;
        if ($user) {
            $likedByMe = $this->likeRepository->count([
                    'account' => $user,
                    'post'    => $post,
                ]) > 0;
        }
        $comments=[];
        foreach ($post->getComments() as $comment ){
            $user=$comment->getAccount();

            $comments[]=[
                "comment"=>$comment->getCommentText(),
                "userName"=>$user->getFirstName(),
                "createdAt"=>$comment->getCreatedAt()->format('Y-m-d H:i:s'),
                "imageOfUser"=>$comment->getAccount()->getImage()
            ];
        }

        return [
            "id"=>$post->getId(),
            'user'=>$post->getAccount()->getFirstName(),
            "userImage"=>$http."".$post->getAccount()->getImage(),
            "image"=>$http."".$post->getImage(),
            "content"=>$post->getContent(),
            "likes"=>$post->getLikes(),
            "comments"=>$comments,
            'likedByMe'  => $likedByMe,
            "createdAt"=>$post->getCreatedAt()->format('Y-m-d H:i:s'),
        ];

    }



    public function addCommentToPost($data){

    $account=$this->security->getUser();

    $post = $this->postRepository->find($data['postId'] ?? null);
        if (!$post) {
            throw new \RuntimeException('Post not found');
        }
        if (
            !$account

        ) {
            throw new \RuntimeException('Unauthorized');
        }
        $commentDto = new CommentDTO();
        $commentDto->comment_text = (string)($data['comment_text'] ?? '');

        $errors = $this->validator->validate($commentDto);
        if (count($errors) > 0) {

            throw new \InvalidArgumentException((string)$errors);
        }
        $comment = new Comment();
        $comment->setCommentText($commentDto->comment_text);
        $comment->setPost($post);
        $comment->setAccount($account);

        $this->entityManager->persist($comment);
        $this->entityManager->flush();
        return $comment;
    }
    private function resolveCategoryName(?string $cat): ?string
    {
        if (!$cat) return null;


        $map = [
            'web-design' => 'Web Design',
            'seo'        => 'Search Engines',

            'development'=> 'Development',
            'databases'  => 'Databases',
                    'marketing'  => 'Marketing',
        ];


        return $map[$cat] ?? $cat;
    }


    public function addPost(CreatePostDTO $dto): Post
    {
        $content = trim($dto->content);
        if ($content === '') {
            throw new \InvalidArgumentException('Content is required');
        }

        $ids = array_map('intval', $dto->categoryIds);
        $categories = $this->categoryRepository->findBy(['id' => $ids]);
        if (count($categories) !== count(array_unique($ids))) {
            throw new \InvalidArgumentException('Some categories do not exist');
        }

        $post = new Post();
        $post->setContent($content);
        $post->setAccount($dto->user);

        foreach ($categories as $cat) {
            $post->setCategory($cat);
        }



        if ($dto->imageFile instanceof UploadedFile) {

            $extension = $dto->imageFile->guessExtension() ?: $dto->imageFile->getClientOriginalExtension() ?: 'bin';

            $newFilename = uniqid('post_', true) . '.' . $extension;


            $uploadDirAbs = rtrim($this->uploadPostDir, DIRECTORY_SEPARATOR);

            if (!is_dir($uploadDirAbs) && !mkdir($uploadDirAbs, 0777, true) && !is_dir($uploadDirAbs)) {
                throw new \RuntimeException('Failed to prepare upload directory');
            }

            try {

                $dto->imageFile->move($uploadDirAbs, $newFilename);

                $post->setImage(rtrim($this->uploadPostPath, '/') . '/' . $newFilename);
            } catch (\Throwable $e) {
                throw new \RuntimeException('Failed to upload image: ' . $e->getMessage());
            }
        }
        $this->entityManager->persist($post);
        $this->entityManager->flush();

        return $post;
    }



        public function getPostForAccount(int $accountId): array
        {
            $posts = $this->postRepository->findBy(
                ['account' => $accountId],
                ['createdAt' => 'DESC']
            );

            $result = [];
            foreach ($posts as $post) {
                $result[] = [
                    'id'        => $post->getId(),
                    'content'   => $post->getContent(),
                    'image'     => $post->getImage(),
                    'createdAt' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                    'likes'     => $post->getLikes(),
                    'user'      => $post->getAccount()->getFirstName(),
                    'userImage' => $post->getAccount()->getImage(),
                ];
            }

            return $result;
        }


}