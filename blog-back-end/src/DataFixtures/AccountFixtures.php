<?php

namespace App\DataFixtures;

use App\Factory\AccountFactory;
use App\Factory\PostFactory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AccountFixtures extends Fixture
{

    public function load(ObjectManager $manager): void
    {
        AccountFactory::createMany(11, ["posts" => PostFactory::new()->many(10)]);
        $manager->flush();
    }
}