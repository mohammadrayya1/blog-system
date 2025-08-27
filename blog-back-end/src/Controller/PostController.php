<?php

namespace App\Controller;

use App\DtoEntity\CreatePostDTO;
use App\Entity\Account;
use App\Entity\Post;
use App\Repository\CategoryRepository;
use App\Repository\CommentRepository;
use App\Repository\PostRepository;
use App\Service\LikeService;
use App\Service\PostService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;


final class PostController extends AbstractController
{
    public function __construct(
        private readonly PostService $postService,
        private readonly   LikeService $likeService,
        private readonly CategoryRepository $categoryRepository,
         private readonly CommentRepository $commentRepository,
        private readonly EntityManagerInterface $entityManager)
    {
    }

    #[Route('/api/posts', name: 'app_posts',methods: "GET")]
    public function index(Request $request): JsonResponse
    {
        return $this->json(
            $this->postService->getAllposts($request,$http = $request->getSchemeAndHttpHost())
        );

    }

    #[Route("/api/post/{id}",name:"app_post_by_id",methods:"GET")]
    public function getPost(int $id,Request $request){
        $http = $request->getSchemeAndHttpHost();
        $post=$this->postService->getPostById($id,$http);
       // $commetns=$this->postService->getAllComments($id);
        return $this->json([
            "data"=>$post
        ]);
    }

    #[Route('/api/post/{id}/like', name: 'app_post_like', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function likePost(int $id, PostRepository $postRepo): \Symfony\Component\HttpFoundation\JsonResponse
    {
        $post = $postRepo->find($id);
        if (!$post) {
            return $this->json(['error' => 'Post not found'], 404);
        }


        $state = $this->likeService->toggleLike($post);

        return $this->json([
            'id'    => (int) $post->getId(),
            'likes' => (int) $state['likes'],
            'liked' => (bool) $state['liked'],
        ]);
    }


    #[Route("/api/addComment/{postId}",name:"app_post_add_comment",methods:"POST")]
    public function addcommentToPost($postId,Request $request): JsonResponse{

        $data = json_decode($request->getContent(), true) ?? [];

        $data['postId'] = $postId;
        $comment = $this->postService->addCommentToPost($data);
        return $this->json([
            'message' => 'Comment added successfully',
            'commentId' => $comment->getId(),
        ], 201);

    }


    #[Route("/api/categories",name:"app_get_categories",methods:"GET")]
    public function getAllCategories(): JsonResponse{

        $categoreis=$this->categoryRepository->findAll();
        $categoreisArray=[];
        foreach ($categoreis as $category){
            $categoreisArray[]=[
                "id"=>$category->getId(),
                "name"=>$category->getname()
            ];
        }
        return $this->json([
            'message' => 'Comment get successfully',
            'categories' => $categoreisArray,
        ], 201);

    }

    #[Route('/api/addnewpost', name: 'api_post_create', methods: ['POST'])]
    public function addNewPost(
        Request $request,
        Security $security,
        ValidatorInterface $validator,
        PostService $postService
    ): JsonResponse {
        $user = $security->getUser();
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $dto = CreatePostDTO::fromRequest($request, $user);

        $errors = $validator->validate($dto);
        if (count($errors) > 0) {
            $msgs = [];
            foreach ($errors as $e) {
                $msgs[] = $e->getPropertyPath().': '.$e->getMessage();
            }
            return $this->json(['error' => 'Validation failed', 'details' => $msgs], 400);
        }

        $post = $postService->addPost($dto);

        return $this->json([
            'message' => 'Post created successfully',
            'id'      => $post->getId(),
        ], 201);
    }


    #[Route("/api/posts/{accountId}",name:"app_get_post_for_account",methods:"GET")]
    public function getpostsOfdAccount($accountId){

        $posts=$this->postService->getPostForAccount($accountId);
        return $this->json([
            'data' => $posts
        ]);
    }

    #[Route("/api/comment/{accountId}/{postId}/{commentId}",name:"app_delete_comment_of_account",methods:"DELETE")]
    public function deleteComment($accountId,$postId,$commentId): JsonResponse{

        $account = $this->entityManager->find(Account::class,$accountId);
        $post= $this->entityManager->find(Post::class,$postId);
        $comment= $this->commentRepository->findOneBy([
            "id"=>$commentId,
            "post"=>$post,
            "account"=>$account
        ]);
        if (!$comment) {
            return $this->json([
                "error" => "Comment not found"
            ], 404);
        }
        $this->entityManager->remove($comment);
        $this->entityManager->flush();
        return $this->json([
            "message" => "Comment deleted successfully"
        ], 200);


    }


    #[Route(
        "/api/comment/{accountId}/{postId}/{commentId}",
        name: "app_edit_comment_of_account",
        methods: ["PUT"],
        requirements: ["accountId" => "\d+", "postId" => "\d+", "commentId" => "\d+"]
    )]
    #[IsGranted('ROLE_USER')]
    public function editComment(
        Request $request,
        int $accountId,
        int $postId,
        int $commentId,
        ValidatorInterface $validator
    ): JsonResponse {

        $user = $this->getUser();
        if (!$user || !$user instanceof Account) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }
        if ($user->getId() !== $accountId) {
            return $this->json(['error' => 'Forbidden'], 403);
        }
        $account = $user;


        $post = $this->entityManager->find(Post::class, $postId);
        if (!$post) {
            return $this->json(['error' => 'Post not found'], 404);
        }

        $comment = $this->commentRepository->findOneBy([
            'id'      => $commentId,
            'post'    => $post,
            'account' => $account,
        ]);
        if (!$comment) {
            return $this->json(['error' => 'Comment not found'], 404);
        }


        try {
            $data = $request->toArray();
        } catch (\JsonException $e) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }

        $text = trim((string)($data['comment'] ?? ''));
        if ($text === '') {
            return $this->json(['error' => 'Comment text is required'], 422);
        }
        if (mb_strlen($text) > 1000) {
            return $this->json(['error' => 'Comment is too long (max 1000 chars)'], 422);
        }


             $comment->setCommentText(strip_tags($text));

        try {
            $this->entityManager->flush();
        } catch (\Throwable $e) {

            return $this->json(['error' => 'Failed to update comment'], 500);
        }

        return $this->json([
            'message' => 'Comment updated successfully',
            'comment' => [
                'id'        => $comment->getId(),
                'comment'   => $comment->getCommentText(),
                'updatedAt' => $comment->getUpdatedAt()?->format('Y-m-d H:i:s'),
            ]
        ], 200);
    }


}
