<?php
namespace App\EventSubscriber;

use App\Entity\Post;
use App\Service\PostSearch;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;

class PostIndexSubscriber implements EventSubscriber
{
    public function __construct(private PostSearch $es) {}

    public function getSubscribedEvents(): array
    {
        return [Events::postPersist, Events::postUpdate, Events::postRemove];
    }

    public function postPersist(LifecycleEventArgs $args): void { $this->sync($args); }
    public function postUpdate(LifecycleEventArgs $args): void { $this->sync($args); }

    private function sync(LifecycleEventArgs $args): void
    {
        $e = $args->getObject();
        if ($e instanceof Post) {
            $this->es->index($e);
        }
    }

    public function postRemove(LifecycleEventArgs $args): void
    {
        $e = $args->getObject();
        if ($e instanceof Post) {
            $this->es->delete($e->getId());
        }
    }
}
