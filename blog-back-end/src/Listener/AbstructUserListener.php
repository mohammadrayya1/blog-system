<?php

namespace App\Listener;

use App\Entity\AbstructAccount;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AbstructUserListener
{
    public function __construct(private UserPasswordHasherInterface $hasher)
    {
    }

    public function prePersist(LifecycleEventArgs $args): void
    {
        $e = $args->getObject();
        if (!$e instanceof AbstructAccount) return;
        $this->hash($e);
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $e = $args->getObject();
        if (!$e instanceof AbstructAccount) return;

        $this->hash($e);
        $em = $args->getObjectManager();
        $meta = $em->getClassMetadata($e::class);
        $em->getUnitOfWork()->recomputeSingleEntityChangeSet($meta, $e);
    }

    private function hash(AbstructAccount $u): void
    {
        $plain = $u->getPlainPassword();
        if (!$plain) return;

        $u->setPassword($this->hasher->hashPassword($u, $plain));
        $u->eraseCredentials();
    }
}
