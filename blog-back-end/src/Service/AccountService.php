<?php

namespace App\Service;

use App\DtoEntity\RegisterAccountDTO;
use App\Entity\Account;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AccountService
{
    private string $projectDir;

    public function __construct(
        private readonly SendEmailService $emailService,
        private readonly string $uploadDir,
        private readonly string $uploadPath,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator,
        private JWTTokenManagerInterface $JWTManager,
        private EntityManagerInterface $entityManager,
        ParameterBagInterface $params
    ) {
        $this->projectDir = $params->get('kernel.project_dir');
    }


    public function createNewAccount(RegisterAccountDTO $dto, ?UploadedFile $file = null): array
    {

        $dtoErrors = $this->validator->validate($dto);
        if (count($dtoErrors) > 0) {
            $messages = [];
            foreach ($dtoErrors as $violation) {
                $messages[$violation->getPropertyPath()] = $violation->getMessage();
            }
            return ['ok' => false, 'errors' => $messages];
        }


        $account = new Account();
        $account->setEmail($dto->email);
        $account->setFirstName($dto->firstName ?? '');
        $account->setLastName($dto->lastName ?? '');
        $account->setTitle($dto->title ?? '');
        $account->setPhone($dto->phone ?? '');
        $account->setAddress($dto->address ?? '');


        $entityErrors = $this->validator->validate($account);
        if (count($entityErrors) > 0) {
            $messages = [];
            foreach ($entityErrors as $violation) {
                $messages[$violation->getPropertyPath()] = $violation->getMessage();
            }
            return ['ok' => false, 'errors' => $messages];
        }


        if ($file instanceof UploadedFile) {
            $extension   = $file->guessExtension() ?: $file->getClientOriginalExtension() ?: 'bin';
            $newFilename = uniqid('acc_', true) . '.' . $extension;


            $uploadDirAbs = rtrim($this->projectDir, DIRECTORY_SEPARATOR) . '/public/uploads/accounts';

            if (!is_dir($uploadDirAbs) && !mkdir($uploadDirAbs, 0777, true) && !is_dir($uploadDirAbs)) {
                return ['ok' => false, 'errors' => ['image' => 'Failed to prepare upload directory']];
            }

            try {
                $file->move($uploadDirAbs, $newFilename);
            } catch (\Throwable $e) {
                return ['ok' => false, 'errors' => ['image' => 'Failed to upload image']];
            }


            $account->setImage('/uploads/accounts/' . $newFilename);
        } elseif (!empty($dto->image)) {

            $account->setImage($dto->image);
        }


        $hashedPassword = $this->passwordHasher->hashPassword($account, $dto->password);
        $account->setPassword($hashedPassword);


        try {
            $this->entityManager->persist($account);
            $this->entityManager->flush();
        } catch (\Doctrine\DBAL\Exception\UniqueConstraintViolationException) {
            return ['ok' => false, 'errors' => ['email' => 'This email is already registered']];
        } catch (\Throwable $e) {

            return ['ok' => false, 'errors' => ['general' => 'Database error']];
        }


        $token = $this->JWTManager->create($account);

        return [
            'ok'   => true,
            'data' => [
                'id'        => $account->getId(),
                'firstname' => $account->getFirstName(),
                'lastname'  => $account->getLastName(),
                'email'     => $account->getEmail(),
                'token'     => $token,
            ],
        ];
    }
}
