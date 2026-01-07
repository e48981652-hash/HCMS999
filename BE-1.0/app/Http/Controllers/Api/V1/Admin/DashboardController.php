<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Request as RequestModel;
use App\Models\Mcp;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index(Request $request)
    {
        // New requests this week
        $newRequests = RequestModel::whereBetween('created_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ])->count();

        // Overdue SLA requests
        $overdueRequests = RequestModel::where('due_at', '<', now())
            ->whereNotIn('status', ['completed', 'published'])
            ->count();

        // MCP progress
        $totalMcps = Mcp::count();
        $completedMcps = Mcp::where('status', 'published')->count();
        $mcpProgress = $totalMcps > 0 ? ($completedMcps / $totalMcps) * 100 : 0;

        // Team workload (average assigned requests per user)
        $avgWorkload = DB::table('requests')
            ->select(DB::raw('AVG(user_requests.count) as avg'))
            ->fromSub(
                DB::table('requests')
                    ->select('assigned_user_id', DB::raw('COUNT(*) as count'))
                    ->whereNotNull('assigned_user_id')
                    ->whereNotIn('status', ['completed', 'published'])
                    ->groupBy('assigned_user_id'),
                'user_requests'
            )
            ->value('avg') ?? 0;

        $teamWorkload = min(100, ($avgWorkload / 10) * 100); // Normalize to 0-100

        // Recent requests
        $recentRequests = RequestModel::with(['business', 'creator', 'requestType'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // MCP progress by business
        $mcpProgressByBusiness = Mcp::select('business_id', DB::raw('COUNT(*) as total'), DB::raw('SUM(CASE WHEN status = \'published\' THEN 1 ELSE 0 END) as completed'))
            ->with('business:id,name')
            ->groupBy('business_id')
            ->get()
            ->map(function($item) {
                return [
                    'business' => $item->business->name,
                    'progress' => $item->total > 0 ? ($item->completed / $item->total) * 100 : 0,
                ];
            });

        // Request status distribution
        $requestStatusDistribution = RequestModel::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Requests over time (last 30 days)
        $requestsOverTime = RequestModel::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date')
        ->get()
        ->map(function($item) {
            return [
                'date' => $item->date,
                'period' => $item->date,
                'count' => $item->count,
            ];
        });

        // Team performance
        $teamPerformance = Team::with(['users'])->get()->map(function($team) {
            $assignedRequests = RequestModel::where('assigned_team_id', $team->id)->get();
            return [
                'id' => $team->id,
                'name' => $team->name,
                'members_count' => $team->users->count(),
                'completed' => $assignedRequests->where('status', 'completed')->count(),
                'in_progress' => $assignedRequests->where('status', 'in_progress')->count(),
                'overdue' => $assignedRequests->where('due_at', '<', now())
                    ->whereNotIn('status', ['completed', 'published'])
                    ->count(),
                'total' => $assignedRequests->count(),
            ];
        });

        // Recent activity (from audit logs if available, otherwise from requests)
        $recentActivity = RequestModel::with(['business', 'creator', 'requestType'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($req) {
                return [
                    'id' => $req->id,
                    'type' => 'request_created',
                    'title' => "New request: {$req->requestType->name ?? 'N/A'}",
                    'description' => "Request #{$req->id} created by {$req->creator->first_name} {$req->creator->last_name}",
                    'message' => "Request created for {$req->business->name ?? 'N/A'}",
                    'created_at' => $req->created_at->toISOString(),
                ];
            });

        // Alerts (overdue requests, high workload teams, etc.)
        $alerts = [];
        
        // Overdue requests alert
        if ($overdueRequests > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Overdue Requests',
                'message' => "You have {$overdueRequests} overdue request(s) that need attention.",
                'action' => 'view_requests',
            ];
        }

        // High workload alert
        if ($teamWorkload > 80) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'High Team Workload',
                'message' => 'Team workload is above 80%. Consider redistributing tasks.',
                'action' => 'view_teams',
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'new_requests' => $newRequests,
                    'overdue_sla' => $overdueRequests,
                    'mcp_progress' => round($mcpProgress, 2),
                    'team_workload' => round($teamWorkload, 2),
                ],
                'request_status_distribution' => $requestStatusDistribution,
                'requests_over_time' => $requestsOverTime,
                'team_performance' => $teamPerformance,
                'recent_requests' => $recentRequests,
                'recent_activity' => $recentActivity,
                'alerts' => $alerts,
                'mcp_progress_by_business' => $mcpProgressByBusiness,
            ],
        ]);
    }
}


