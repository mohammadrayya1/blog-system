<?php

namespace App\DtoEntity;

use Symfony\Component\Validator\Constraints as Assert;

class RegisterAccountDTO
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Email]
        public string $email,

        #[Assert\NotBlank]
        #[Assert\Length(min: 8)]
        public string $password,

        public ?string $firstName = null,
        public ?string $lastName = null,
        public ?string $title = null,
        public ?string $phone = null,
        public ?string $address = null,
        public ?string $image = null,
    ) {}
}

