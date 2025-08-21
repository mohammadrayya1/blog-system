<?php

namespace App\Controller;

use App\Repository\PostRepository;
use App\Service\LikeService;
use App\Service\PostService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;


final class PostController extends AbstractController
{
    public function __construct(private readonly PostService $postService,private readonly   LikeService $likeService)
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

        return $this->json([
            "data"=>$post
        ]);
    }


    #[Route('/api/post/{id}/like', name: 'app_post_like', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function likePost(
        int $id,
        PostRepository $postRepo
    ) {
        $post = $postRepo->find($id);
        if (!$post) {
            return $this->json(['error' => 'Post not found'], 404);
        }

          $likeCount = $this->likeService->toggleLike($post);

        return $this->json([
            'id' => $post->getId(),
            'likes' => $likeCount
        ]);
    }

}
