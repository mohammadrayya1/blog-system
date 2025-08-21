<?php

namespace App\DataFixtures;

use App\Factory\AccountFactory;
use App\Factory\LikeFactory;
use App\Factory\PostFactory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LikesFixtures extends Fixture implements DependentFixtureInterface
{



    public function load(ObjectManager $manager): void
    {

        LikeFactory::new()->many(500)->create(function () {
            return [
                "post" => PostFactory::random(),
                "account" => AccountFactory::random()
            ];
        });
        $posts = $manager->getRepository(\App\Entity\Post::class)->findAll();

        foreach ($posts as $post) {
            $likeCount = $manager->getRepository(\App\Entity\Like::class)
                ->createQueryBuilder('l')
                ->select('COUNT(l.id)')
                ->where('l.post = :post')
                ->setParameter('post', $post)
                ->getQuery()
                ->getSingleScalarResult();

            $post->setLikes((int) $likeCount);
            $manager->persist($post);
        }


        $manager->flush();
    }


    public function getDependencies(): array
    {
        return [
            AccountFixtures::class
        ];
    }
}