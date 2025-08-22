<?php

namespace App\Controller;

use App\DtoEntity\RegisterAccountDTO;
use App\Entity\Account;
use App\Service\AccountService;
use App\Service\FollowService;
use App\Service\PostService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class AccountController extends AbstractController
{
    public function __construct(
        private readonly PostService   $postService,
        private readonly AccountService $accountService,
        private readonly FollowService $followService
    ) {}

    #[Route('/account/{id}', name: 'app_account', methods: ['GET'])]
    public function getProfile(Account $account): JsonResponse
    {
        $postsArray         = [];
        $followersArray     = [];
        $notificationsArrray = [];

        $followers     = $account->getFollowers();
        $notifications = $account->getNotifications();

        foreach ($notifications as $notification) {
            $notificationsArrray[] = [
                "notifyFrom"  => $notification->getAccount()->getFirstName(),
                "notifyOwner" => $notification->getOwner()->getFirstName(),
            ];
        }

        foreach ($followers as $follower) {
            $followedBy        = $follower->getFollowedBy();
            $followersArray[]  = [
                "followed_since" => $follower->getFollowedSince(),
                "followedBy"     => [
                    "name" => $followedBy->getFirstName()
                ]
            ];
        }

        foreach ($account->getPosts() as $post) {
            $postsArray[] = [
                'id'    => $post->getId(),
                'title' => $post->getDescription(),
                'likes' => $post->getLikes(),
            ];
        }

        return $this->json([
            "account" => [
                'id'            => $account->getId(),
                'title'         => $account->getTitle(),
                'firstname'     => $account->getFirstName(),
                "image"         => $account->getImage(),
                'phone'         => $account->getPhone(),
                'address'       => $account->getAddress(),
                'posts'         => $postsArray,
                "followers"     => $followersArray,
                "notifications" => $notificationsArrray
            ]
        ]);
    }

    #[Route('/api/register', name: 'app_account_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        // يدعم JSON و multipart/form-data
        $data = json_decode($request->getContent(), true);
        if (!is_array($data) || empty($data)) {
            $data = $request->request->all();
        }
        $file = $request->files->get('image');

        if (!$data || !isset($data['email'], $data['password'])) {
            return $this->json(['errors' => ['general' => 'Invalid data']], 400);
        }

        $dto = new RegisterAccountDTO(
            email:     $data['email'],
            password:  $data['password'],
            firstName: $data['firstName'] ?? null,
            lastName:  $data['lastName']  ?? null,
            title:     $data['title']     ?? null,
            phone:     $data['phone']     ?? null,
            address:   $data['address']   ?? null,
            image:     $data['image']     ?? null,
        );

        try {
            $result = $this->accountService->createNewAccount($dto, $file);

            if (!$result['ok']) {
                // يمكن هنا إزالة أي حقل debug قبل الإرجاع في الإنتاج
                return $this->json(['errors' => $result['errors']], 400);
            }

            // نجاح
            return $this->json(array_merge(
                ['message' => 'Account created successfully'],
                $result['data']
            ), 201);

        } catch (\Throwable $e) {
            // في الظروف غير المتوقعة
            return $this->json([
                'errors' => ['general' => 'Something went wrong'],
            ], 500);
        }
    }
}
