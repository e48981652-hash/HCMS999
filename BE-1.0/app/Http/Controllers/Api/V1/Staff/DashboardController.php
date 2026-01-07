<?php

namespace App\Http\Controllers\Api\V1\Staff;

use App\Http\Controllers\Controller;
use App\Models\Request as RequestModel;
use App\Models\McpPost;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get staff dashboard statistics
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Assigned tasks
        $assignedTasks = RequestModel::where('assigned_user_id', $user->id)
            ->whereNotIn('status', ['completed', 'published'])
            ->count();

        // Deadlines this week
        $deadlines = RequestModel::where('assigned_user_id', $user->id)
            ->whereBetween('due_at', [now(), now()->endOfWeek()])
            ->whereNotIn('status', ['completed', 'published'])
            ->count();

        // MCP posts assigned
        $mcpPosts = McpPost::where('assigned_to', $user->id)
            ->whereNotIn('status', ['published'])
            ->count();

        // Assigned requests
        $assignedRequests = RequestModel::where('assigned_user_id', $user->id)
            ->whereNotIn('status', ['completed', 'published'])
            ->count();

        // Recent tasks
        $recentTasks = RequestModel::where('assigned_user_id', $user->id)
            ->with(['business', 'requestType'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'assigned_tasks' => $assignedTasks,
                    'deadlines' => $deadlines,
                    'mcp_posts' => $mcpPosts,
                    'requests' => $assignedRequests,
                ],
                'recent_tasks' => $recentTasks,
            ],
        ]);
    }
}


