<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Request as RequestModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    /**
     * Get comments for a request
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

        $comments = Comment::where('entity_type', RequestModel::class)
            ->where('entity_id', $requestId)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $comments,
        ]);
    }

    /**
     * Create a new comment
     */
    public function store(Request $request, $requestId)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
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

        // Additional check for clients - can only comment on their own requests
        if ($user->role === 'client' && $requestModel->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $comment = Comment::create([
            'user_id' => $user->id,
            'entity_type' => RequestModel::class,
            'entity_id' => $requestId,
            'content' => $request->content,
        ]);

        $comment->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Comment created successfully',
            'data' => $comment,
        ], 201);
    }

    /**
     * Update a comment
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $comment = Comment::findOrFail($id);

        // Only the comment author can update their comment
        if ($comment->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You can only update your own comments',
            ], 403);
        }

        // Check if comment is for a request and user has access
        if ($comment->entity_type === RequestModel::class) {
            $requestModel = RequestModel::find($comment->entity_id);
            if ($requestModel && !$user->hasBusinessAccess($requestModel->business_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }
        }

        $comment->update([
            'content' => $request->content,
        ]);

        $comment->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Comment updated successfully',
            'data' => $comment,
        ]);
    }

    /**
     * Delete a comment
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $comment = Comment::findOrFail($id);

        // Only the comment author or admin can delete a comment
        $canDelete = $comment->user_id === $user->id || $user->role === 'admin';

        if (!$canDelete) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You can only delete your own comments',
            ], 403);
        }

        // Check if comment is for a request and user has access
        if ($comment->entity_type === RequestModel::class) {
            $requestModel = RequestModel::find($comment->entity_id);
            if ($requestModel && !$user->hasBusinessAccess($requestModel->business_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }
        }

        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully',
        ]);
    }
}

