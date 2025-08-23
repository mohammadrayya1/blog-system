<?php

namespace App\DtoEntity;

class CommentDTO
{


    #[Assert\NotBlank(message: "Comment cannot be empty")]
    #[Assert\Length(max: 500, maxMessage: "Comment cannot exceed 500 characters")]
    public string $comment_text;



}