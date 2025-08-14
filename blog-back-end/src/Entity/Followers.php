<?php

namespace App\Entity;

use App\Repository\FollowersRepository;
use DateTime;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FollowersRepository::class)]
class Followers
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'no')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Account $account = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Account $followedBy = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private DateTime $followed_since;


    function __construct()
    {
        $this->followed_since = new DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAccount(): ?Account
    {
        return $this->account;
    }

    public function setAccount(?Account $account): static
    {
        $this->account = $account;

        return $this;
    }

    public function getFollowedBy(): ?Account
    {
        return $this->followedBy;
    }

    public function setFollowedBy(?Account $followedBy): static
    {
        $this->followedBy = $followedBy;

        return $this;
    }

    public function getFollowedSince(): ?\DateTime
    {
        return $this->followed_since;
    }

    public function setFollowedSince(\DateTime $followed_since): static
    {
        $this->followed_since = $followed_since;

        return $this;
    }
}
