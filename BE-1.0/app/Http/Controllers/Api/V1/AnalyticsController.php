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

class AnalyticsController extends Controller
{
    /**
     * Get dashboard analytics
     */
    public function dashboard(Request $request)
    {
        $request->validate([
            'period' => 'nullable|string|in:7d,30d,90d,1y',
        ]);

        $period = $request->get('period', '30d');
        $startDate = $this->getStartDateForPeriod($period);

        // Requests over time
        $requestsOverTime = RequestModel::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', $startDate)
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // Requests by status
        $requestsByStatus = RequestModel::select('status', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('status')
            ->pluck('count', 'status');

        // Requests by business
        $requestsByBusiness = RequestModel::select('businesses.name', DB::raw('COUNT(requests.id) as count'))
            ->join('businesses', 'requests.business_id', '=', 'businesses.id')
            ->where('requests.created_at', '>=', $startDate)
            ->groupBy('businesses.name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Team performance
        $teamPerformance = Team::withCount([
            'requests as completed_requests' => function($query) use ($startDate) {
                $query->where('status', 'completed')
                    ->where('created_at', '>=', $startDate);
            },
            'requests as total_requests' => function($query) use ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }
        ])
        ->get()
        ->map(function($team) {
            return [
                'team_id' => $team->id,
                'team_name' => $team->name,
                'completed_requests' => $team->completed_requests,
                'total_requests' => $team->total_requests,
                'completion_rate' => $team->total_requests > 0 
                    ? round(($team->completed_requests / $team->total_requests) * 100, 2)
                    : 0,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'requests_over_time' => $requestsOverTime,
                'requests_by_status' => $requestsByStatus,
                'requests_by_business' => $requestsByBusiness,
                'team_performance' => $teamPerformance,
                'period' => $period,
                'start_date' => $startDate->toDateString(),
            ],
        ]);
    }

    /**
     * Get requests analytics
     */
    public function requests(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'business_id' => 'nullable|integer|exists:businesses,id',
        ]);

        $startDate = $request->get('start_date') 
            ? Carbon::parse($request->start_date) 
            : now()->subDays(30);
        $endDate = $request->get('end_date') 
            ? Carbon::parse($request->end_date) 
            : now();

        $query = RequestModel::whereBetween('created_at', [$startDate, $endDate]);

        if ($request->has('business_id')) {
            $query->where('business_id', $request->business_id);
        }

        // Status distribution
        $statusDistribution = $query->clone()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // Request types distribution
        $typeDistribution = $query->clone()
            ->join('request_types', 'requests.request_type_id', '=', 'request_types.id')
            ->select('request_types.name', DB::raw('COUNT(requests.id) as count'))
            ->groupBy('request_types.name')
            ->orderBy('count', 'desc')
            ->get();

        // Completion time analysis
        $completionTimeStats = $query->clone()
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->selectRaw('
                AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_hours,
                MIN(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as min_hours,
                MAX(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as max_hours
            ')
            ->first();

        // Trends (compare with previous period)
        $previousStartDate = $startDate->copy()->subDays($startDate->diffInDays($endDate));
        $currentCount = $query->clone()->count();
        $previousCount = RequestModel::whereBetween('created_at', [$previousStartDate, $startDate])
            ->when($request->has('business_id'), function($q) use ($request) {
                $q->where('business_id', $request->business_id);
            })
            ->count();

        $trend = $previousCount > 0 
            ? round((($currentCount - $previousCount) / $previousCount) * 100, 2)
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'status_distribution' => $statusDistribution,
                'type_distribution' => $typeDistribution,
                'completion_time' => [
                    'avg_hours' => round($completionTimeStats->avg_hours ?? 0, 2),
                    'min_hours' => round($completionTimeStats->min_hours ?? 0, 2),
                    'max_hours' => round($completionTimeStats->max_hours ?? 0, 2),
                ],
                'trends' => [
                    'current_count' => $currentCount,
                    'previous_count' => $previousCount,
                    'change_percent' => $trend,
                ],
            ],
        ]);
    }

    /**
     * Get teams performance analytics
     */
    public function teams(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $startDate = $request->get('start_date') 
            ? Carbon::parse($request->start_date) 
            : now()->subDays(30);
        $endDate = $request->get('end_date') 
            ? Carbon::parse($request->end_date) 
            : now();

        $teams = Team::with(['users'])->get()->map(function($team) use ($startDate, $endDate) {
            $requests = RequestModel::where('assigned_team_id', $team->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();

            $completed = $requests->where('status', 'completed');
            $avgCompletionTime = $completed->whereNotNull('completed_at')
                ->avg(function($req) {
                    return Carbon::parse($req->completed_at)->diffInHours(Carbon::parse($req->created_at));
                });

            return [
                'team_id' => $team->id,
                'team_name' => $team->name,
                'members_count' => $team->users->count(),
                'total_requests' => $requests->count(),
                'completed_requests' => $completed->count(),
                'in_progress_requests' => $requests->where('status', 'in-progress')->count(),
                'overdue_requests' => $requests->where('due_at', '<', now())
                    ->whereNotIn('status', ['completed'])
                    ->count(),
                'completion_rate' => $requests->count() > 0 
                    ? round(($completed->count() / $requests->count()) * 100, 2)
                    : 0,
                'avg_completion_time_hours' => round($avgCompletionTime ?? 0, 2),
                'sla_compliance_rate' => $this->calculateTeamSlaCompliance($team->id, $startDate, $endDate),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'teams' => $teams,
                'period' => [
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate->toDateString(),
                ],
            ],
        ]);
    }

    /**
     * Get start date for period
     */
    private function getStartDateForPeriod(string $period): Carbon
    {
        return match($period) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subDays(30),
        };
    }

    /**
     * Calculate team SLA compliance
     */
    private function calculateTeamSlaCompliance(int $teamId, Carbon $startDate, Carbon $endDate): float
    {
        $total = RequestModel::where('assigned_team_id', $teamId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        if ($total === 0) {
            return 0;
        }

        $violated = RequestModel::where('assigned_team_id', $teamId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('due_at', '<', now())
            ->whereNotIn('status', ['completed'])
            ->count();

        return round((($total - $violated) / $total) * 100, 2);
    }
}
