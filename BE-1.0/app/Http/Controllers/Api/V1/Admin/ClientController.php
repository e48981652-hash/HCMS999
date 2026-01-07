<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class ClientController extends Controller
{
    /**
     * Get all clients (admin only)
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $query = User::where('role', 'client')
            ->with(['businesses']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $clients = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $clients,
        ]);
    }

    /**
     * Get client details
     */
    public function show(Request $request, $id)
    {
        $client = User::with(['businesses'])->findOrFail($id);
        $this->authorize('view', $client);

        if ($client->role !== 'client') {
            return response()->json([
                'success' => false,
                'message' => 'User is not a client',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $client,
        ]);
    }

    /**
     * Create new client
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $client = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'client',
            'status' => 'active',
        ]);

        $client->load('businesses');

        return response()->json([
            'success' => true,
            'message' => 'Client created successfully',
            'data' => $client,
        ], 201);
    }

    /**
     * Suspend client
     */
    public function suspend(Request $request, $id)
    {
        $client = User::findOrFail($id);
        $this->authorize('update', $client);

        $client->update(['status' => 'suspended']);

        return response()->json([
            'success' => true,
            'message' => 'Client suspended successfully',
        ]);
    }

    /**
     * Activate client
     */
    public function activate(Request $request, $id)
    {
        $client = User::findOrFail($id);
        $this->authorize('update', $client);

        $client->update(['status' => 'active']);

        return response()->json([
            'success' => true,
            'message' => 'Client activated successfully',
        ]);
    }

    /**
     * Bulk operations on clients
     */
    public function bulk(Request $request)
    {
        $request->validate([
            'action' => 'required|string|in:activate,suspend,delete',
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:users,id',
        ]);

        $ids = $request->ids;
        $action = $request->action;
        $this->authorize('viewAny', User::class);

        // Ensure all IDs are clients
        $clients = User::whereIn('id', $ids)->where('role', 'client')->pluck('id');
        
        if ($clients->count() !== count($ids)) {
            return response()->json([
                'success' => false,
                'message' => 'Some IDs do not belong to clients',
            ], 400);
        }

        if ($action === 'activate') {
            $updated = User::whereIn('id', $ids)->update(['status' => 'active']);
            return response()->json([
                'success' => true,
                'message' => "{$updated} clients activated successfully",
                'updated_count' => $updated,
            ]);
        } elseif ($action === 'suspend') {
            $updated = User::whereIn('id', $ids)->update(['status' => 'suspended']);
            return response()->json([
                'success' => true,
                'message' => "{$updated} clients suspended successfully",
                'updated_count' => $updated,
            ]);
        } elseif ($action === 'delete') {
            $deleted = User::whereIn('id', $ids)->delete();
            return response()->json([
                'success' => true,
                'message' => "{$deleted} clients deleted successfully",
                'deleted_count' => $deleted,
            ]);
        }
    }
}


