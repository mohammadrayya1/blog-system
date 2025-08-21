<?php

namespace App\Service;

use App\Entity\Like;
use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class LikeService
{
    public function __construct(
        private readonly Security $security,
        private readonly EntityManagerInterface $em
    ) {}

    /**
     * إضافة أو إزالة لايك لمستخدم على بوست
     *
     * @return int عدد اللايكات الجديد
     */public function toggleLike(Post $post): array
{
    $user = $this->security->getUser();
    if (!$user) {
        throw new UnauthorizedHttpException('Bearer', 'User not authenticated');
    }

    $likeRepo = $this->em->getRepository(Like::class);
    $existing = $likeRepo->findOneBy(['account' => $user, 'post' => $post]);

    $likedNow = false;
    if ($existing) {
        $this->em->remove($existing);
        $likedNow = false;
    } else {
        $like = new Like();
        $like->setAccount($user);
        $like->setPost($post);
        $this->em->persist($like);
        $likedNow = true;
    }

    $this->em->flush();

    $count = $likeRepo->count(['post' => $post]);
    $post->setLikes($count);
    $this->em->persist($post);
    $this->em->flush();

    return ['count' => $count, 'liked' => $likedNow];
}
}
