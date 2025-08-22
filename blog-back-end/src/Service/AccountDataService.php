<?php

namespace App\Service;

use App\Contract\UploadFileInterface;
use App\Entity\Account;
use App\Repository\AccountRepository;

class AccountDataService
{

    public function __construct(private readonly UploadFileInterface $uploadFile, private readonly AccountRepository $accountRepository)
    {
    }

    public function getUserData(?Account $user = null)
    {

        return $this->accountRepository->find(16);
    }

    public function updateUserData()
    {

    }


}