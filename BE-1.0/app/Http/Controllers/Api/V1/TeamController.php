<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TeamController extends Controller
{
    /**
     * Get all teams (admin only)
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Team::class);

        $teams = Team::with(['users'])->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $teams,
        ]);
    }

    /**
     * Create team (admin only)
     */
    public function store(Request $request)
    {
        $this->authorize('create', Team::class);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $team = Team::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Team created successfully',
            'data' => $team,
        ], 201);
    }

    /**
     * Get team details (admin only)
     */
    public function show(Request $request, $id)
    {
        $team = Team::with(['users', 'requests'])->findOrFail($id);
        $this->authorize('view', $team);

        // Get team statistics
        $stats = [
            'members_count' => $team->users->count(),
            'requests_count' => $team->requests->count(),
            'active_requests_count' => $team->requests()->whereIn('status', ['pending', 'in_progress'])->count(),
            'completed_requests_count' => $team->requests()->where('status', 'completed')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'team' => $team,
                'statistics' => $stats,
            ],
        ]);
    }

    /**
     * Update team (admin only)
     */
    public function update(Request $request, $id)
    {
        $team = Team::findOrFail($id);
        $this->authorize('update', $team);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $team->update($request->only(['name', 'description']));
        $team->load('users');

        return response()->json([
            'success' => true,
            'message' => 'Team updated successfully',
            'data' => $team,
        ]);
    }

    /**
     * Delete team (admin only)
     */
    public function destroy(Request $request, $id)
    {
        $team = Team::findOrFail($id);
        $this->authorize('delete', $team);

        // Check if team has active requests
        $activeRequestsCount = $team->requests()
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        if ($activeRequestsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete team with {$activeRequestsCount} active request(s). Please reassign or complete requests first.",
            ], 422);
        }

        // Check if team is default for any request types
        $defaultRequestTypesCount = $team->defaultRequestTypes()->count();
        if ($defaultRequestTypesCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete team that is default for {$defaultRequestTypesCount} request type(s). Please change default team first.",
            ], 422);
        }

        $team->delete();

        return response()->json([
            'success' => true,
            'message' => 'Team deleted successfully',
        ]);
    }

    /**
     * Assign users to team (admin only)
     */
    public function assignUsers(Request $request, $id)
    {
        $team = Team::findOrFail($id);
        $this->authorize('update', $team);

        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $team->users()->sync($request->user_ids);

        $team->load('users');

        return response()->json([
            'success' => true,
            'message' => 'Users assigned successfully',
            'data' => $team,
        ]);
    }
}


