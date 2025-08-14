<?php

namespace App\DataFixtures;

use App\Factory\AccountFactory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AccountFixtures extends Fixture
{

    public function load(ObjectManager $manager): void
    {
        AccountFactory::createMany(2);
        $manager->flush();
    }
}