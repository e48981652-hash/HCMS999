<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Request as RequestModel;
use App\Models\Business;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Global search
     */
    public function index(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2',
            'type' => 'nullable|string|in:all,requests,businesses,clients',
        ]);

        $query = $request->get('q');
        $type = $request->get('type', 'all');
        $results = [];

        // Search requests
        if ($type === 'all' || $type === 'requests') {
            $requests = RequestModel::with(['business', 'requestType', 'creator'])
                ->where(function($q) use ($query) {
                    $q->where('id', 'like', "%{$query}%")
                        ->orWhereHas('requestType', function($q) use ($query) {
                            $q->where('name', 'ilike', "%{$query}%");
                        })
                        ->orWhereHas('business', function($q) use ($query) {
                            $q->where('name', 'ilike', "%{$query}%");
                        });
                })
                ->limit(10)
                ->get()
                ->map(function($req) {
                    return [
                        'type' => 'request',
                        'id' => $req->id,
                        'title' => $req->requestType->name ?? "Request #{$req->id}",
                        'description' => $req->business->name ?? 'N/A',
                        'url' => "/app/requests/{$req->id}",
                    ];
                });

            $results['requests'] = $requests;
        }

        // Search businesses
        if ($type === 'all' || $type === 'businesses') {
            $businesses = Business::where('name', 'ilike', "%{$query}%")
                ->orWhere('industry', 'ilike', "%{$query}%")
                ->limit(10)
                ->get()
                ->map(function($business) {
                    return [
                        'type' => 'business',
                        'id' => $business->id,
                        'title' => $business->name,
                        'description' => $business->industry ?? 'N/A',
                        'url' => "/app/businesses/{$business->id}",
                    ];
                });

            $results['businesses'] = $businesses;
        }

        // Search clients
        if ($type === 'all' || $type === 'clients') {
            $clients = User::where('role', 'client')
                ->where(function($q) use ($query) {
                    $q->where('first_name', 'ilike', "%{$query}%")
                        ->orWhere('last_name', 'ilike', "%{$query}%")
                        ->orWhere('email', 'ilike', "%{$query}%");
                })
                ->limit(10)
                ->get()
                ->map(function($client) {
                    return [
                        'type' => 'client',
                        'id' => $client->id,
                        'title' => "{$client->first_name} {$client->last_name}",
                        'description' => $client->email,
                        'url' => "/app/admin/clients/{$client->id}",
                    ];
                });

            $results['clients'] = $clients;
        }

        // Combine all results for 'all' type
        if ($type === 'all') {
            $allResults = collect();
            foreach ($results as $typeResults) {
                $allResults = $allResults->merge($typeResults);
            }
            $results['all'] = $allResults->take(20)->values();
        }

        return response()->json([
            'success' => true,
            'data' => $results,
            'query' => $query,
            'type' => $type,
        ]);
    }
}
