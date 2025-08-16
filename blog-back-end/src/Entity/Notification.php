<?php

namespace App\Entity;

use App\Repository\NotificationRepository;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Timestampable\Traits\TimestampableEntity;

#[ORM\Entity(repositoryClass: NotificationRepository::class)]
class Notification
{
    use TimestampableEntity;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'notifications')]
    #[ORM\JoinColumn(nullable: false)]
    private Account $owner;

    #[ORM\ManyToOne(cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private Account $account;

    #[ORM\Column]
    private ?bool $is_seen = null;

    #[ORM\ManyToOne]
    private ?Post $post = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getOwner(): ?Account
    {
        return $this->owner;
    }

    public function setOwner(?Account $owner): static
    {
        $this->owner = $owner;

        return $this;
    }

    public function getAccount(): ?Account
    {
        return $this->account;
    }

    public function setAccount(Account $account): static
    {
        $this->account = $account;

        return $this;
    }

    public function isSeen(): ?bool
    {
        return $this->is_seen;
    }

    public function setIsSeen(bool $is_seen): static
    {
        $this->is_seen = $is_seen;

        return $this;
    }

    public function getPost(): ?Post
    {
        return $this->post;
    }

    public function setPost(?Post $post): static
    {
        $this->post = $post;

        return $this;
    }
}
