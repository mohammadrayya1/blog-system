<?php

namespace App\Service;

use App\Contract\UploadFileInterface;

class LocalFileUploadService implements UploadFileInterface
{

    public function uploadFile() :string
    {
        return "URL our file to our Server";
    }
}