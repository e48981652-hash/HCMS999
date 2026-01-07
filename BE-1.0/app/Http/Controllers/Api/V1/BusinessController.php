<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class BusinessController extends Controller
{
    /**
     * Get user's businesses
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            // Admin can see all businesses
            $businesses = Business::with('owner')
                ->paginate(15);
        } else {
            // Client can only see their businesses
            $businesses = $user->businesses()->paginate(15);
        }

        return response()->json([
            'success' => true,
            'data' => $businesses,
        ]);
    }

    /**
     * Create new business
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'social_links' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if ($user->role !== 'client' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $business = Business::create([
            'owner_user_id' => $user->id,
            'name' => $request->name,
            'industry' => $request->industry,
            'description' => $request->description,
            'social_links' => $request->social_links,
        ]);

        // Event: business.created
        event(new \App\Events\BusinessCreated($business));

        return response()->json([
            'success' => true,
            'message' => 'Business created successfully',
            'data' => $business,
        ], 201);
    }

    /**
     * Get business details
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $business = Business::findOrFail($id);

        // Check access
        if (!$user->hasBusinessAccess($business->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $business->load(['owner', 'users']);

        return response()->json([
            'success' => true,
            'data' => $business,
        ]);
    }

    /**
     * Update business
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'social_links' => 'nullable|array',
            'status' => 'sometimes|in:active,suspended,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $business = Business::findOrFail($id);

        // Only owner or admin can update
        if ($business->owner_user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $business->update($request->only([
            'name',
            'industry',
            'description',
            'social_links',
            'status',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Business updated successfully',
            'data' => $business,
        ]);
    }

    /**
     * Delete business (soft delete)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $business = Business::findOrFail($id);

        // Only owner or admin can delete
        if ($business->owner_user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $business->delete();

        return response()->json([
            'success' => true,
            'message' => 'Business deleted successfully',
        ]);
    }
}


