<?php

namespace App\Service;

use Symfony\Component\Security\Core\User\UserInterface;

class FollowService
{

    public  function getFollowers(UserInterface $user):array{
        return [];
    }

    public function followUser(){

    }
    public function unFollowUser(){

    }
}