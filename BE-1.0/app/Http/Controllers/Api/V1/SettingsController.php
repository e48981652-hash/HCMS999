<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get all settings (admin only)
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Setting::class);

        $settings = Setting::all()->keyBy('key');

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Get specific setting
     */
    public function show(Request $request, $key)
    {
        $setting = Setting::find($key);

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $setting,
        ]);
    }

    /**
     * Update setting (admin only)
     */
    public function update(Request $request, $key)
    {
        $this->authorize('update', Setting::class);

        $validator = Validator::make($request->all(), [
            'value' => 'required',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        Setting::set($key, $request->value, $request->description);

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => Setting::find($key),
        ]);
    }
}


