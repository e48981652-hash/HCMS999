<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Request as RequestModel;
use App\Models\Business;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Get requests report
     */
    public function requests(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|string',
            'business_id' => 'nullable|integer|exists:businesses,id',
            'team_id' => 'nullable|integer|exists:teams,id',
        ]);

        $query = RequestModel::with(['business', 'creator', 'requestType', 'assignedTeam', 'assignedUser']);

        // Date range filter
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Business filter
        if ($request->has('business_id')) {
            $query->where('business_id', $request->business_id);
        }

        // Team filter
        if ($request->has('team_id')) {
            $query->where('assigned_team_id', $request->team_id);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $requests = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Summary statistics
        $summary = [
            'total' => $query->count(),
            'by_status' => RequestModel::select('status', DB::raw('COUNT(*) as count'))
                ->when($request->has('start_date'), function($q) use ($request) {
                    $q->whereDate('created_at', '>=', $request->start_date);
                })
                ->when($request->has('end_date'), function($q) use ($request) {
                    $q->whereDate('created_at', '<=', $request->end_date);
                })
                ->when($request->has('business_id'), function($q) use ($request) {
                    $q->where('business_id', $request->business_id);
                })
                ->groupBy('status')
                ->pluck('count', 'status'),
            'avg_completion_time' => $this->calculateAvgCompletionTime($request),
            'sla_compliance' => $this->calculateSlaCompliance($request),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'requests' => $requests,
                'summary' => $summary,
            ],
        ]);
    }

    /**
     * Get clients report
     */
    public function clients(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|string|in:active,suspended',
        ]);

        $query = User::where('role', 'client')->with(['businesses']);

        // Date range filter
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 15);
        $clients = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Summary statistics
        $summary = [
            'total' => $query->count(),
            'active' => User::where('role', 'client')->where('status', 'active')->count(),
            'suspended' => User::where('role', 'client')->where('status', 'suspended')->count(),
            'new_this_month' => User::where('role', 'client')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'total_requests' => RequestModel::whereHas('creator', function($q) {
                $q->where('role', 'client');
            })->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'clients' => $clients,
                'summary' => $summary,
            ],
        ]);
    }

    /**
     * Get teams report
     */
    public function teams(Request $request)
    {
        $request->validate([
            'team_id' => 'nullable|integer|exists:teams,id',
        ]);

        $query = Team::with(['users', 'requests']);

        if ($request->has('team_id')) {
            $query->where('id', $request->team_id);
        }

        $teams = $query->get()->map(function($team) {
            $assignedRequests = RequestModel::where('assigned_team_id', $team->id)->get();
            
            return [
                'id' => $team->id,
                'name' => $team->name,
                'members_count' => $team->users->count(),
                'total_requests' => $assignedRequests->count(),
                'completed_requests' => $assignedRequests->where('status', 'completed')->count(),
                'in_progress_requests' => $assignedRequests->where('status', 'in-progress')->count(),
                'overdue_requests' => $assignedRequests->where('due_at', '<', now())
                    ->whereNotIn('status', ['completed'])
                    ->count(),
                'avg_completion_time' => $this->calculateTeamAvgCompletionTime($team->id),
            ];
        });

        $summary = [
            'total_teams' => Team::count(),
            'total_members' => DB::table('team_user')->distinct('user_id')->count(),
            'total_team_requests' => RequestModel::whereNotNull('assigned_team_id')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'teams' => $teams,
                'summary' => $summary,
            ],
        ]);
    }

    /**
     * Calculate average completion time
     */
    private function calculateAvgCompletionTime(Request $request)
    {
        $query = RequestModel::where('status', 'completed')
            ->whereNotNull('completed_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_hours');

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->has('business_id')) {
            $query->where('business_id', $request->business_id);
        }

        return round($query->value('avg_hours') ?? 0, 2);
    }

    /**
     * Calculate SLA compliance
     */
    private function calculateSlaCompliance(Request $request)
    {
        $query = RequestModel::query();

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->has('business_id')) {
            $query->where('business_id', $request->business_id);
        }

        $total = $query->count();
        if ($total === 0) {
            return [
                'total' => 0,
                'compliant' => 0,
                'violated' => 0,
                'compliance_rate' => 0,
            ];
        }

        $violated = $query->clone()
            ->where('due_at', '<', now())
            ->whereNotIn('status', ['completed'])
            ->count();

        $compliant = $total - $violated;
        $complianceRate = ($compliant / $total) * 100;

        return [
            'total' => $total,
            'compliant' => $compliant,
            'violated' => $violated,
            'compliance_rate' => round($complianceRate, 2),
        ];
    }

    /**
     * Calculate team average completion time
     */
    private function calculateTeamAvgCompletionTime(int $teamId)
    {
        $avgHours = RequestModel::where('assigned_team_id', $teamId)
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_hours')
            ->value('avg_hours');

        return round($avgHours ?? 0, 2);
    }
}
