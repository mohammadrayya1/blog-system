<?php

namespace App\Entity;

use App\Repository\AdminAccountRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AdminAccountRepository::class)]
class AdminAccount extends AbstructAccount
{

    public const ROLLE_ADMIN = "ROLLE_ADMIN";
    public const ROLLE_SUPER_ADMIN = "ROLLE_SUPER_ADMIN";

    #[ORM\Column(length: 255)]
    private ?string $adminRolle = null;


    public function getAdminRolle(): ?string
    {
        return $this->adminRolle;
    }

    public function setAdminRolle(string $adminRolle): static
    {
        $this->adminRolle = $adminRolle;

        return $this;
    }

    public function getRoles(): array
    {
        return [$this->adminRolle ?? self::ROLLE_ADMIN];
    }
}
