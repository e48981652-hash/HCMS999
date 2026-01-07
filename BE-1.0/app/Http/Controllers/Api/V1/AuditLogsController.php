<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogsController extends Controller
{
    /**
     * Get audit logs
     */
    public function index(Request $request)
    {
        $request->validate([
            'actor_id' => 'nullable|integer|exists:users,id',
            'action' => 'nullable|string',
            'entity_type' => 'nullable|string',
            'entity_id' => 'nullable|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $query = AuditLog::with('actor');

        // Filters
        if ($request->has('actor_id')) {
            $query->where('actor_id', $request->actor_id);
        }
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }
        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }
        if ($request->has('entity_id')) {
            $query->where('entity_id', $request->entity_id);
        }
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $perPage = $request->get('per_page', 15);
        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Get audit log by ID
     */
    public function show($id)
    {
        $log = AuditLog::with('actor')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $log,
        ]);
    }
}
