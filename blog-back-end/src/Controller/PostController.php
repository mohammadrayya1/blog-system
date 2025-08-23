<?php

namespace App\Controller;

use App\Repository\CategoryRepository;
use App\Repository\PostRepository;
use App\Service\LikeService;
use App\Service\PostService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;


final class PostController extends AbstractController
{
    public function __construct(
        private readonly PostService $postService,
        private readonly   LikeService $likeService,
        private readonly CategoryRepository $categoryRepository)
    {
    }

    #[Route('/api/posts', name: 'app_posts',methods: "GET")]
    public function index(Request $request): JsonResponse
    {
        return $this->json(
            $this->postService->getAllposts($request)
        );

    }

    #[Route("/api/post/{id}",name:"app_post_by_id",methods:"GET")]
    public function getPost(int $id,Request $request){
        $post=$this->postService->getPostById($id);
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
            'likes' => (int) $state['likes'],  // ✅ استخدم 'likes'
            'liked' => (bool) $state['liked'], // ✅ استخدم 'liked'
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
}
