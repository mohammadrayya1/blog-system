<?php

namespace App\Controller;

use App\Entity\Account;
use App\Service\AccountDataService;
use App\Service\FollowService;
use App\Service\PostService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;


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

    #[Route('/account/{id}', name: 'app_account')]
    public function getProfile(Account $account)
    {


        $postsArray = [];
        $followersArray = [];
        $notificationsArrray = [];

        $followers = $account->getFollowers();
        $notifications = $account->getNotifications();

        foreach ($notifications as $notification) {
            $notificationsArrray[] = [
                "notifyFrom" => $notification->getAccount()->getFirstName(),
                "notifyOwner" => $notification->getOwner()->getFirstName(),
            ];
        }
        foreach ($followers as $follower) {
            $followedBy = $follower->getFollowedBy();
            $followersArray[] = [
                "followed_since" => $follower->getFollowedSince(),
                "followedBy" => [
                    "name" => $followedBy->getFirstName()
                ]
            ];
        }

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
                'firstname' => $account->getFirstName(),
                "image" => $account->getImage(),
                'phone' => $account->getPhone(),
                'address' => $account->getAddress(),
                'posts' => $postsArray,
                "followers" => $followersArray,
                "notifications" => $notificationsArrray
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
