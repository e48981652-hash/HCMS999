<?php

namespace App\Services;

use App\Models\Request as RequestModel;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Get requests over time
     */
    public function getRequestsOverTime(Carbon $startDate, Carbon $endDate): array
    {
        return RequestModel::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->whereBetween('created_at', [$startDate, $endDate])
        ->groupBy('date')
        ->orderBy('date')
        ->get()
        ->toArray();
    }

    /**
     * Get status distribution
     */
    public function getStatusDistribution(Carbon $startDate, Carbon $endDate): array
    {
        return RequestModel::select('status', DB::raw('COUNT(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }
}
