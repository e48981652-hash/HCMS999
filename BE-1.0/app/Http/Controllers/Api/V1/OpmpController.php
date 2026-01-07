<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Opmp;
use App\Models\OpmpVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class OpmpController extends Controller
{
    /**
     * Get business OPMP
     */
    public function show(Request $request, $businessId)
    {
        $user = $request->user();

        // Check business access
        if (!$user->hasBusinessAccess($businessId)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $opmp = Opmp::where('business_id', $businessId)->first();

        if (!$opmp) {
            return response()->json([
                'success' => false,
                'message' => 'OPMP not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $opmp,
        ]);
    }

    /**
     * Create or update OPMP (admin only)
     */
    public function update(Request $request, $businessId)
    {
        $this->authorize('update', Opmp::class);

        $validator = Validator::make($request->all(), [
            'data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $opmp = Opmp::updateOrCreate(
                ['business_id' => $businessId],
                [
                    'data' => $request->data,
                    'updated_by' => $request->user()->id,
                ]
            );

            // Create version entry
            $opmp->versions()->create([
                'data' => $request->data,
                'updated_by' => $request->user()->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'OPMP updated successfully',
                'data' => $opmp,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update OPMP',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get OPMP version history
     */
    public function versions(Request $request, $businessId)
    {
        $user = $request->user();

        // Check business access
        if (!$user->hasBusinessAccess($businessId)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $opmp = Opmp::where('business_id', $businessId)->first();

        if (!$opmp) {
            return response()->json([
                'success' => false,
                'message' => 'OPMP not found',
            ], 404);
        }

        $versions = OpmpVersion::where('opmp_id', $opmp->id)
            ->with('updater:id,first_name,last_name,email')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $versions,
        ]);
    }
}


