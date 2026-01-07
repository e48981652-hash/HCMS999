<?php

namespace App\Http\Controllers\Api\V1\Client;

use App\Http\Controllers\Controller;
use App\Models\Request as RequestModel;
use App\Models\Mcp;
use Illuminate\Http\Request;

class ClientDashboardController extends Controller
{
    /**
     * Get client dashboard statistics
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $businessId = $request->query('business_id');

        $query = RequestModel::where('created_by', $user->id);

        if ($businessId) {
            $query->where('business_id', $businessId);
        }

        // Active requests
        $activeRequests = (clone $query)->whereNotIn('status', ['completed', 'published'])->count();

        // MCP progress
        $mcpQuery = Mcp::whereHas('business', function($q) use ($user, $businessId) {
            $q->where('owner_user_id', $user->id);
            if ($businessId) {
                $q->where('id', $businessId);
            }
        });

        $totalMcps = (clone $mcpQuery)->count();
        $completedMcps = (clone $mcpQuery)->where('status', 'published')->count();
        $mcpProgress = $totalMcps > 0 ? ($completedMcps / $totalMcps) * 100 : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'active_requests' => $activeRequests,
                    'mcp_progress' => round($mcpProgress, 2),
                    'admin_requests' => 0,
                ],
            ],
        ]);
    }
}


