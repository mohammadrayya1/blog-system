<?php

namespace App\DataFixtures;

use App\Factory\AccountFactory;
use App\Factory\CommentFactory;
use App\Factory\PostFactory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CommentFixture extends Fixture
{

    public function load(ObjectManager $manager): void
    {
        CommentFactory::new()->many(10)->create(function () {
            return [
                "post" => PostFactory::random(),
                "account" => AccountFactory::random()
            ];
        });
        $manager->flush();
    }


    public function getDependencies()
    {
        return [
            AccountFixtures::class
        ];
    }
}