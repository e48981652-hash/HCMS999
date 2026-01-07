<?php

namespace App\Services;

use App\Models\Request as RequestModel;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    /**
     * Generate requests report summary
     */
    public function getRequestsSummary(array $filters): array
    {
        $query = RequestModel::query();

        if (isset($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }
        if (isset($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }
        if (isset($filters['business_id'])) {
            $query->where('business_id', $filters['business_id']);
        }

        return [
            'total' => $query->count(),
            'by_status' => $query->clone()
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status'),
        ];
    }
}
