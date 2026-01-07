<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileProcessingService
{
    /**
     * Process and store uploaded file
     */
    public function storeFile(UploadedFile $file, string $directory, string $disk = 'public'): array
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($directory, $filename, $disk);
        $url = Storage::disk($disk)->url($path);

        return [
            'path' => $path,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'url' => $url,
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }
}
