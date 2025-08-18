<?php

namespace App\DataFixtures;

use App\Factory\AccountFactory;
use App\Factory\NotificationFactory;
use App\Factory\PostFactory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class NotificationFixture extends Fixture
{

    public function load(ObjectManager $manager): void
    {
        NotificationFactory::new()->many(20)->create(function () {
            return [
                "owner" => AccountFactory::random()
            ];
        });

        $account = AccountFactory::random();

        NotificationFactory::new()
            ->many(10)
            ->create(function () use ($account) {
                return [
                    'owner' => $account,
                    'post' => PostFactory::random(['account' => $account]),
                    'account' => AccountFactory::random(),
                ];
            });
    }


    public function getDependencies()
    {
        return [
            AccountFixtures::class
        ];
    }
}