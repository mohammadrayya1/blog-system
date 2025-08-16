<?php

namespace App\Factory;

use App\Entity\Post;
use Zenstruck\Foundry\Persistence\PersistentProxyObjectFactory;

/**
 * @extends PersistentProxyObjectFactory<Post>
 */
final class PostFactory extends PersistentProxyObjectFactory
{
    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#factories-as-services
     *
     * @todo inject services if required
     */
    public function __construct()
    {
    }

    public static function class(): string
    {
        return Post::class;
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#model-factories
     *
     * @todo add your default values here
     */
    protected function defaults(): array|callable
    {
        return [
            'account' => AccountFactory::new(),
            'createdAt' => self::faker()->dateTime(),
            'description' => self::faker()->sentence(),
            'likes' => self::faker()->randomNumber(3),
            'updatedAt' => self::faker()->dateTime(),
            "image" => 'https://picsum.photos/seed/' . uniqid() . '/300/300'
        ];
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#initialization
     */
    protected function initialize(): static
    {
        return $this// ->afterInstantiate(function(Post $post): void {})
            ;
    }
}
