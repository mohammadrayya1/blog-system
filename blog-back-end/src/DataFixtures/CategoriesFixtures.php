<?php

namespace App\DataFixtures;

use App\Entity\Category;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CategoriesFixtures extends Fixture
{

    public function load(ObjectManager $manager): void
    {
        $categories = [
            'Web Design',
            'Development',
            'Databases',
            'Search Engines',
            'Marketing',
        ];

        foreach ($categories as $name) {
            $category = new Category();
            $category->setName($name);

            $manager->persist($category);
        }

        $manager->flush();
    }
}