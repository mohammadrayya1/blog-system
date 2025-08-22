<?php

namespace App\Entity;

use App\Repository\AccountRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AccountRepository::class)]
class Account extends AbstructAccount
{
    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(length: 255)]
    private ?string $phone = null;

    #[ORM\Column(length: 255)]
    private ?string $address = null;

    /**
     * @var Collection<int, Post>
     */
    #[ORM\OneToMany(targetEntity: Post::class, mappedBy: 'account', orphanRemoval: false)]
    private Collection $posts;

    /**
     * @var Collection<int, Notification>
     */
    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'owner')]
    private Collection $notifications;

    /**
     * @var Collection<int, Followers>
     */
    #[ORM\OneToMany(targetEntity: Followers::class, mappedBy: 'account')]
    private Collection $followers;

    #[ORM\Column(length: 255,nullable: true)]
    private ?string $image = null;

    public function __construct()
    {
        $this->posts = new ArrayCollection();
        $this->notifications = new ArrayCollection();
        $this->followers = new ArrayCollection();
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): static
    {
        $this->phone = $phone;
        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;
        return $this;
    }

    /**
     * @return Collection<int, Post>
     */
    public function getPosts(): Collection
    {
        return $this->posts;
    }

    public function addPost(Post $post): static
    {
        if (!$this->posts->contains($post)) {
            $this->posts->add($post);
            $post->setAccount($this);
        }
        return $this;
    }

    public function removePost(Post $post): static
    {
        if ($this->posts->removeElement($post)) {
            if ($post->getAccount() === $this) {
                $post->setAccount(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Notification>
     */
    public function getNotifications(): Collection
    {
        return $this->notifications;
    }

    public function addNotification(Notification $notification): static
    {
        if (!$this->notifications->contains($notification)) {
            $this->notifications->add($notification);
            $notification->setOwner($this);
        }
        return $this;
    }

    public function removeNotification(Notification $notification): static
    {
        if ($this->notifications->removeElement($notification)) {
            if ($notification->getOwner() === $this) {
                $notification->setOwner(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Followers>
     */
    public function getFollowers(): Collection  // تغيير من getNo إلى getFollowers
    {
        return $this->followers;
    }

    public function addFollower(Followers $follower): static  // تغيير من addNo
    {
        if (!$this->followers->contains($follower)) {
            $this->followers->add($follower);
            $follower->setAccount($this);
        }
        return $this;
    }

    public function removeFollower(Followers $follower): static  // تغيير من removeNo
    {
        if ($this->followers->removeElement($follower)) {
            if ($follower->getAccount() === $this) {
                $follower->setAccount(null);
            }
        }
        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(string $image): static
    {
        $this->image = $image;

        return $this;
    }


}