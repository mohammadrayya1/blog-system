<?php

namespace App\Factory;

use App\Entity\AdminAccount;
use Zenstruck\Foundry\Persistence\PersistentProxyObjectFactory;

/**
 * @extends PersistentProxyObjectFactory<AdminAccount>
 */
final class AdminAccountFactory extends PersistentProxyObjectFactory
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
        return AdminAccount::class;
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#model-factories
     *
     * @todo add your default values here
     */
    protected function defaults(): array|callable
    {
        return [
            'adminRolle' => self::faker()->randomElement([AdminAccount::ROLLE_ADMIN, AdminAccount::ROLLE_SUPER_ADMIN]),
            'email' => self::faker()->email(255),
            'firstName' => self::faker()->firstName(255),
            'lastName' => self::faker()->lastName(255),
            'plainPassword' => self::faker()->password(12, 20),
        ];
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#initialization
     */
    protected function initialize(): static
    {
        return $this// ->afterInstantiate(function(AdminAccount $adminAccount): void {})
            ;
    }
}
