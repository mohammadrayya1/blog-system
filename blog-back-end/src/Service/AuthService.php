<?php

namespace App\Service;

use App\Dto\LoginRequest;
use App\Repository\AbstructAccountRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthService
{
    public function __construct(
        private AbstructAccountRepository   $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface          $validator,
        private JWTTokenManagerInterface    $JWTManager
    )
    {
    }

    public function login(array $data): JsonResponse
    {
        // 📨 نجهّز الـ DTO
        $loginRequest = new LoginRequest();
        $loginRequest->email = $data['email'] ?? '';
        $loginRequest->password = $data['password'] ?? '';

        // ✅ validate input
        $errors = $this->validator->validate($loginRequest);
        if (count($errors) > 0) {
            return new JsonResponse([
                'status' => 'error',
                'errors' => (string)$errors
            ], 400);
        }

        // 🔍 البحث عن المستخدم
        $user = $this->userRepository->findOneBy(['email' => $loginRequest->email]);

        // تأكد أن الكائن يطبّق الواجهتين المطلوبة
        if (
            !$user instanceof UserInterface ||
            !$user instanceof PasswordAuthenticatedUserInterface
        ) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'User not found or invalid type'
            ], 404);
        }

        // 🔑 تحقق من كلمة المرور
        if (!$this->passwordHasher->isPasswordValid($user, $loginRequest->password)) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        // 🪙 إنشاء التوكن
        $token = $this->JWTManager->create($user);

        // 🎉 نجاح
        return new JsonResponse([
            'status' => 'success',
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
            ]
        ]);
    }
}
