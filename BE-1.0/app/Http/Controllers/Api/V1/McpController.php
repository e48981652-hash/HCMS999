<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Mcp;
use App\Models\McpPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class McpController extends Controller
{
    /**
     * Get business MCPs
     */
    public function index(Request $request, $businessId)
    {
        $user = $request->user();

        // Check business access
        if (!$user->hasBusinessAccess($businessId)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $month = $request->query('month'); // Format: YYYY-MM

        $query = Mcp::where('business_id', $businessId)
            ->with(['posts.assignedUser']);

        if ($month) {
            $query->where('month', $month);
        }

        $mcps = $query->orderBy('month', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $mcps,
        ]);
    }

    /**
     * Create MCP (admin only)
     */
    public function store(Request $request, $businessId)
    {
        $this->authorize('create', Mcp::class);

        $validator = Validator::make($request->all(), [
            'month' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $mcp = Mcp::create([
            'business_id' => $businessId,
            'month' => $request->month,
            'status' => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'MCP created successfully',
            'data' => $mcp,
        ], 201);
    }

    /**
     * Update MCP post
     */
    public function updatePost(Request $request, $id)
    {
        $post = McpPost::findOrFail($id);
        $user = $request->user();

        // Check access - staff assigned or admin
        if ($post->assigned_to !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'caption' => 'nullable|string',
            'status' => 'sometimes|in:draft,in-preparation,scheduled,published',
            'scheduled_at' => 'sometimes|nullable|date',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $post->status;
        $post->update($request->only([
            'title',
            'caption',
            'status',
            'scheduled_at',
            'metadata',
        ]));

        // Event: mcp.post.updated
        if ($oldStatus !== $post->status) {
            event(new \App\Events\McpPostUpdated($post));
        }

        return response()->json([
            'success' => true,
            'message' => 'MCP post updated successfully',
            'data' => $post,
        ]);
    }
}


