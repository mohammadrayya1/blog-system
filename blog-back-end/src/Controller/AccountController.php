<?php

namespace App\Controller;

use App\Service\AccountDataService;
use App\Service\FollowService;
use App\Service\PostService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class AccountController extends AbstractController
{
    public function __construct(
        private readonly PostService        $postService,
        private readonly AccountDataService $accountDataService,
        private readonly FollowService      $followService)
    {
    }


    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'Welcome to your new controller!',
            'path' => 'src/Controller/AccountController.php',
        ]);
    }

    #[Route('/account', name: 'app_account')]
    public function getProfile()
    {
        $account = $this->accountDataService->getUserData();
        $postsArray = [];
        $followers = $account->getFollowers;


        foreach ($account->getPosts() as $post) {
            $postsArray[] = [
                'id' => $post->getId(),
                'title' => $post->getDescription(),
                'likes' => $post->getLikes(),
            ];
        }
        return $this->json([
            "account" => [
                'id' => $account->getId(),
                'title' => $account->getTitle(),
                'lastname' => $account->getLastName(),
                "image" => $account->getImage(),
                'phone' => $account->getPhone(),
                'address' => $account->getAddress(),
                'posts' => $postsArray
            ]]);

    }

    public function viewProfile(int $id)
    {
        return "viewProfile";
    }

    public function listAction()
    {
        return "listAction";
    }
}
