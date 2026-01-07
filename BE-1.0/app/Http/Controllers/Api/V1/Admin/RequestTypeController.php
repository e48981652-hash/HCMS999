<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\RequestType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RequestTypeController extends Controller
{
    /**
     * Get all request types (admin only)
     */
    public function adminIndex(Request $request)
    {
        $this->authorize('viewAny', RequestType::class);

        $requestTypes = RequestType::with(['fields', 'defaultTeam'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $requestTypes,
        ]);
    }

    /**
     * Create request type (admin only)
     */
    public function store(Request $request)
    {
        $this->authorize('create', RequestType::class);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_published' => 'boolean',
            'default_team_id' => 'nullable|exists:teams,id',
            'sla_hours' => 'required|integer|min:1',
            'fields' => 'required|array|min:1',
            'fields.*.field_key' => 'required|string',
            'fields.*.label' => 'required|string',
            'fields.*.type' => 'required|in:text,textarea,select,multiselect,date,file,image',
            'fields.*.required' => 'boolean',
            'fields.*.options' => 'nullable|array',
            'fields.*.validation' => 'nullable|array',
            'fields.*.order' => 'integer',
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
            $requestType = RequestType::create([
                'name' => $request->name,
                'description' => $request->description,
                'is_published' => $request->is_published ?? false,
                'default_team_id' => $request->default_team_id,
                'sla_hours' => $request->sla_hours,
            ]);

            // Create fields
            foreach ($request->fields as $index => $field) {
                $requestType->fields()->create([
                    'field_key' => $field['field_key'],
                    'label' => $field['label'],
                    'type' => $field['type'],
                    'required' => $field['required'] ?? false,
                    'options' => $field['options'] ?? null,
                    'validation' => $field['validation'] ?? null,
                    'order' => $field['order'] ?? $index,
                ]);
            }

            DB::commit();

            $requestType->load('fields');

            return response()->json([
                'success' => true,
                'message' => 'Request type created successfully',
                'data' => $requestType,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create request type',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update request type (admin only)
     */
    public function update(Request $request, $id)
    {
        $requestType = RequestType::findOrFail($id);
        $this->authorize('update', $requestType);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_published' => 'boolean',
            'default_team_id' => 'nullable|exists:teams,id',
            'sla_hours' => 'sometimes|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $requestType->update($request->only([
            'name',
            'description',
            'is_published',
            'default_team_id',
            'sla_hours',
        ]));

        $requestType->load('fields');

        return response()->json([
            'success' => true,
            'message' => 'Request type updated successfully',
            'data' => $requestType,
        ]);
    }
}


