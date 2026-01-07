<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Request as RequestModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{
    /**
     * Get activity feed
     */
    public function feed(Request $request)
    {
        $request->validate([
            'type' => 'nullable|string|in:all,requests,users,businesses',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $type = $request->get('type', 'all');
        $limit = $request->get('limit', 20);

        $query = AuditLog::with('actor')->orderBy('created_at', 'desc');

        // Filter by entity type
        if ($type !== 'all') {
            $entityTypes = match($type) {
                'requests' => ['request', 'Request'],
                'users' => ['user', 'User'],
                'businesses' => ['business', 'Business'],
                default => [],
            };
            if (!empty($entityTypes)) {
                $query->whereIn('entity_type', $entityTypes);
            }
        }

        $activities = $query->limit($limit)->get()->map(function($log) {
            return [
                'id' => $log->id,
                'action' => $log->action,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
                'actor' => $log->actor ? [
                    'id' => $log->actor->id,
                    'name' => $log->actor->first_name . ' ' . $log->actor->last_name,
                    'email' => $log->actor->email,
                ] : null,
                'description' => $this->formatActivityDescription($log),
                'timestamp' => $log->created_at->toISOString(),
                'metadata' => [
                    'before' => $log->before,
                    'after' => $log->after,
                    'ip_address' => $log->ip_address,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }

    /**
     * Format activity description
     */
    private function formatActivityDescription(AuditLog $log): string
    {
        $actorName = $log->actor 
            ? $log->actor->first_name . ' ' . $log->actor->last_name 
            : 'System';

        $action = match($log->action) {
            'created' => 'created',
            'updated' => 'updated',
            'deleted' => 'deleted',
            'status_changed' => 'changed status of',
            'assigned' => 'assigned',
            default => $log->action,
        };

        $entity = strtolower($log->entity_type);

        return "{$actorName} {$action} {$entity} #{$log->entity_id}";
    }
}
