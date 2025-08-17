<?php

namespace App\Controller;

use App\Service\AuthService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class AccountAuthController extends AbstractController
{


    public function __construct(private readonly AuthService $authService)
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

    #[Route('/api/account/login', name: 'app_account_auth', methods: "POST")]
    public function logIn(Request $request, EntityManagerInterface $em): JsonResponse
    {


        $data = json_decode($request->getContent(), true);

        return $this->authService->login($data);

    }


    public function registerAction()
    {

    }

    public function forgetPasswordAction()
    {

    }
}
