<?php

namespace App\Controller;

use App\Service\AccountService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class AccountAuthController extends AbstractController
{


    public function __construct(private readonly AccountService $accountService)
    {
    }

    #[Route('/account/auth', name: 'app_account_auth')]
    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'Welcome to your new controller!',
            'path' => 'src/Controller/AccountAuthController.php',
        ]);
    }


    public function registerAction()
    {

    }

    public function forgetPasswordAction()
    {

    }
}
