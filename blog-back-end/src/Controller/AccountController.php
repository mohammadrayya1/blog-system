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

    #[Route('/account', name: 'app_account')]
    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'Welcome to your new controller!',
            'path' => 'src/Controller/AccountController.php',
        ]);
    }


    public function getProfile()
    {
        return "Profile";
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
