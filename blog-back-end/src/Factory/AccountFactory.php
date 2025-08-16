<?php

namespace App\Factory;

use App\Entity\Account;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Zenstruck\Foundry\Persistence\PersistentProxyObjectFactory;

/** @extends PersistentProxyObjectFactory<Account> */
final class AccountFactory extends PersistentProxyObjectFactory
{

    public function __construct(private ?UserPasswordHasherInterface $passwordHasher = null)
    {
        parent::__construct();
    }

    public static function class(): string
    {
        return Account::class;
    }

    protected function defaults(): array|callable
    {
        return fn() => [
            'email' => self::faker()->safeEmail(),
            'firstName' => self::faker()->firstName(),
            'lastName' => self::faker()->lastName(),
            'address' => self::faker()->address(),
            'phone' => self::faker()->phoneNumber(),
            'title' => self::faker()->jobTitle(),
            'plainPassword' => self::faker()->password(12, 20),
            "image" => 'https://picsum.photos/seed/' . uniqid() . '/300/300'
        ];
    }

    protected function initialize(): static
    {
        return $this->afterInstantiate(function (Account $account): void {
            if ($this->passwordHasher !== null) {
                $account->setPassword(
                    $this->passwordHasher->hashPassword($account, $account->getPassword() ?? 'password')
                );
            }
        });
    }
}
