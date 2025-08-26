<?php

namespace App\DtoEntity;

use App\Entity\AbstructAccount;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;

class CreatePostDTO
{


    public function __construct(
        #[Assert\NotNull(message: 'User is required')]
        public AbstructAccount $user,

        #[Assert\NotBlank(message: 'Content is required')]
        public string $content,

        #[Assert\Image(
            maxSize: "50M",
            maxSizeMessage: "The image is too large ({{ size }} {{ suffix }}). Allowed maximum is {{ limit }} {{ suffix }}.",
            mimeTypesMessage: "Invalid image type"
        )]
        public ?UploadedFile $imageFile = null,

        /** @var int[] */
        #[Assert\NotBlank(message: 'At least one category is required')]
        #[Assert\Count(min: 1, minMessage: 'At least one category is required')]
        public array $categoryIds = [],
    ) {}

    public static function fromRequest(Request $r, AbstructAccount $user): self
    {

        $cont = (string) $r->request->get('content');
        $ids  = (array) $r->request->all('categoryIds', []);
        $file = $r->files->get('image');

        return new self(
            user:        $user,
            content:     trim($cont),
            imageFile:   $file,
            categoryIds: array_map('intval', $ids),
        );
    }
}
