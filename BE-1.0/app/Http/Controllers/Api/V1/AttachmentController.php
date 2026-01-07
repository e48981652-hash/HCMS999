<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Request as RequestModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    /**
     * Get attachments for a request
     */
    public function index(Request $request, $requestId)
    {
        $user = $request->user();
        $requestModel = RequestModel::findOrFail($requestId);

        // Check access - must have business access
        if (!$user->hasBusinessAccess($requestModel->business_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Additional check for clients - can only see their own requests
        if ($user->role === 'client' && $requestModel->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $attachments = Attachment::where('entity_type', RequestModel::class)
            ->where('entity_id', $requestId)
            ->with('uploader')
            ->orderBy('created_at', 'desc')
            ->get();

        // Add URL to each attachment
        $attachments->transform(function ($attachment) {
            $attachment->url = $attachment->url;
            return $attachment;
        });

        return response()->json([
            'success' => true,
            'data' => $attachments,
        ]);
    }

    /**
     * Upload additional attachment
     */
    public function store(Request $request, $requestId)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // Max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $requestModel = RequestModel::findOrFail($requestId);

        // Check access - must have business access
        if (!$user->hasBusinessAccess($requestModel->business_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Additional check for clients - can only add attachments to their own requests
        if ($user->role === 'client' && $requestModel->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $file = $request->file('file');
        
        // Generate unique filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = "requests/{$requestId}/{$filename}";

        // Store file
        $storedPath = Storage::disk('public')->putFileAs(
            "requests/{$requestId}",
            $file,
            $filename
        );

        // Create attachment record
        $attachment = Attachment::create([
            'entity_type' => RequestModel::class,
            'entity_id' => $requestId,
            'uploaded_by' => $user->id,
            'file_path' => $storedPath,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'disk' => 'public',
        ]);

        $attachment->load('uploader');
        $attachment->url = $attachment->url;

        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully',
            'data' => $attachment,
        ], 201);
    }

    /**
     * Download attachment
     */
    public function download(Request $request, $id)
    {
        $user = $request->user();
        $attachment = Attachment::findOrFail($id);

        // Check if attachment is for a request
        if ($attachment->entity_type === RequestModel::class) {
            $requestModel = RequestModel::find($attachment->entity_id);
            
            if (!$requestModel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Request not found',
                ], 404);
            }

            // Check access - must have business access
            if (!$user->hasBusinessAccess($requestModel->business_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Additional check for clients - can only download from their own requests
            if ($user->role === 'client' && $requestModel->created_by !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }
        }

        // Check if file exists
        if (!Storage::disk($attachment->disk)->exists($attachment->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return Storage::disk($attachment->disk)->download(
            $attachment->file_path,
            $attachment->file_name
        );
    }

    /**
     * Delete attachment
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $attachment = Attachment::findOrFail($id);

        // Check if attachment is for a request
        if ($attachment->entity_type === RequestModel::class) {
            $requestModel = RequestModel::find($attachment->entity_id);
            
            if (!$requestModel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Request not found',
                ], 404);
            }

            // Check access - must have business access
            if (!$user->hasBusinessAccess($requestModel->business_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Only the uploader, admin, or staff can delete
            $canDelete = $attachment->uploaded_by === $user->id 
                || $user->role === 'admin' 
                || $user->role === 'staff';

            // Additional check for clients - can only delete from their own requests
            if ($user->role === 'client' && $requestModel->created_by !== $user->id) {
                $canDelete = false;
            }

            if (!$canDelete) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You cannot delete this attachment',
                ], 403);
            }
        } else {
            // For other entity types, only uploader or admin can delete
            $canDelete = $attachment->uploaded_by === $user->id || $user->role === 'admin';
            
            if (!$canDelete) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You cannot delete this attachment',
                ], 403);
            }
        }

        // Delete file from storage
        if (Storage::disk($attachment->disk)->exists($attachment->file_path)) {
            Storage::disk($attachment->disk)->delete($attachment->file_path);
        }

        // Delete attachment record
        $attachment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Attachment deleted successfully',
        ]);
    }
}

