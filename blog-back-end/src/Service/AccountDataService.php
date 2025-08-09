<?php

namespace App\Service;

use App\Contract\UploadFileInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class AccountDataService
{

    public function __construct(private readonly UploadFileInterface $uploadFile)
    {
    }

    public function getUserData(UserInterface $user){

    }

    public function updateUserData(){

    }
}