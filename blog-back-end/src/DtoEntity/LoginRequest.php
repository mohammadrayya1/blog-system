<?php

namespace App\DtoEntity;

use Symfony\Component\Validator\Constraints as Assert;

class LoginRequest
{
    #[Assert\NotBlank(message: "Email is required")]
    #[Assert\Email(message: "Invalid email format")]
    public string $email;

    #[Assert\NotBlank(message: "Password is required")]
    #[Assert\Length(min: 4, minMessage: "Password must be at least {{ limit }} characters long")]
    public string $password;
}
