<?php

namespace App\DataFixtures;

use App\Factory\AccountFactory;
use App\Factory\FollowersFactory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class FollowersFixture extends Fixture
{

    public function load(ObjectManager $manager): void
    {
        FollowersFactory::new()->many(10)->create(function () {
            return [
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