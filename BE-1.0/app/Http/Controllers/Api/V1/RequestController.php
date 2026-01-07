<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Request as RequestModel;
use App\Models\RequestType;
use App\Models\RequestTypeField;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RequestController extends Controller
{
    /**
     * Get user's requests
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $businessId = $request->query('business_id');
        $status = $request->query('status');

        $query = RequestModel::with(['requestType', 'business', 'assignedUser', 'assignedTeam', 'fieldValues']);

        if ($user->role === 'client') {
            $query->where('created_by', $user->id);
        } elseif ($user->role === 'staff') {
            $query->where(function($q) use ($user) {
                $q->where('assigned_user_id', $user->id)
                  ->orWhereIn('assigned_team_id', $user->teams->pluck('id'));
            });
        }

        if ($businessId) {
            $query->where('business_id', $businessId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Create new request
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'request_type_id' => 'required|exists:request_types,id',
            'business_id' => 'required|exists:businesses,id',
            'fields' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Check business access
        if (!$user->hasBusinessAccess($request->business_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to business',
            ], 403);
        }

        $requestType = RequestType::with('fields')->findOrFail($request->request_type_id);

        if (!$requestType->is_published) {
            return response()->json([
                'success' => false,
                'message' => 'Request type is not available',
            ], 403);
        }

        // Validate fields
        $fieldErrors = $this->validateRequestFields($requestType, $request->fields, $request);
        if (!empty($fieldErrors)) {
            return response()->json([
                'success' => false,
                'message' => 'Field validation error',
                'errors' => $fieldErrors,
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Calculate due date based on SLA
            $dueAt = now()->addHours($requestType->sla_hours);

            $requestModel = RequestModel::create([
                'request_type_id' => $request->request_type_id,
                'business_id' => $request->business_id,
                'created_by' => $user->id,
                'assigned_team_id' => $requestType->default_team_id,
                'status' => 'new',
                'due_at' => $dueAt,
            ]);

            // Save field values
            $this->saveRequestFields($requestModel, $requestType, $request->fields, $request);

            DB::commit();

            $requestModel->load(['requestType', 'business', 'fieldValues']);

            // Event: request.created
            event(new \App\Events\RequestCreated($requestModel));

            return response()->json([
                'success' => true,
                'message' => 'Request created successfully',
                'data' => $requestModel,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get request details
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $requestModel = RequestModel::with([
            'requestType.fields',
            'business',
            'creator',
            'assignedUser',
            'assignedTeam',
            'fieldValues',
            'comments.user',
            'attachments',
        ])->findOrFail($id);

        // Check access - must have business access
        if (!$user->hasBusinessAccess($requestModel->business_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Additional check for clients - can only see their own requests
        if ($user->role === 'client' && $requestModel->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $requestModel,
        ]);
    }

    /**
     * Update request status
     */
    public function update(Request $request, $id)
    {
        $requestModel = RequestModel::findOrFail($id);
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:draft,in-preparation,ready,scheduled,published,needs-review,completed,in-progress,waiting,overdue',
            'assigned_user_id' => 'sometimes|nullable|exists:users,id',
            'assigned_team_id' => 'sometimes|nullable|exists:teams,id',
            'priority' => 'sometimes|in:low,medium,high,urgent',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Authorization check - must have business access
        if (!$user->hasBusinessAccess($requestModel->business_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Additional check for clients - can only update their own requests
        if ($user->role === 'client' && $requestModel->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $oldStatus = $requestModel->status;
        $requestModel->update($request->only([
            'status',
            'assigned_user_id',
            'assigned_team_id',
            'priority',
        ]));

        // Event: request.status_changed
        if ($oldStatus !== $requestModel->status) {
            event(new \App\Events\RequestStatusChanged($requestModel, $oldStatus));
        }

        return response()->json([
            'success' => true,
            'message' => 'Request updated successfully',
            'data' => $requestModel,
        ]);
    }

    /**
     * Validate request fields
     */
    private function validateRequestFields(RequestType $requestType, array $fields, Request $request): array
    {
        $errors = [];

        foreach ($requestType->fields as $fieldDefinition) {
            $fieldKey = $fieldDefinition->field_key;
            $fieldValue = $fields[$fieldKey] ?? null;

            // Check required
            if ($fieldDefinition->required && empty($fieldValue)) {
                $errors[$fieldKey] = "Field {$fieldDefinition->label} is required";
                continue;
            }

            // Validate image fields
            if ($fieldDefinition->isImageType()) {
                $imageErrors = $this->validateImageField($fieldDefinition, $fieldKey, $request);
                if (!empty($imageErrors)) {
                    $errors[$fieldKey] = $imageErrors;
                }
            }
        }

        return $errors;
    }

    /**
     * Validate image field
     */
    private function validateImageField(RequestTypeField $field, string $fieldKey, Request $request): array
    {
        $errors = [];
        $config = $field->getImageConfig();
        $files = $request->file($fieldKey);

        if ($field->required && empty($files)) {
            return ["Field is required"];
        }

        if (empty($files)) {
            return [];
        }

        $filesArray = is_array($files) ? $files : [$files];
        $fileCount = count($filesArray);

        // Check max files
        if ($fileCount > $config['max_files']) {
            $errors[] = "Maximum {$config['max_files']} files allowed";
        }

        // Validate each file
        foreach ($filesArray as $file) {
            // Check mime type
            $mimeType = $file->getMimeType();
            $allowedMimes = array_map(function($ext) {
                return 'image/' . $ext;
            }, $config['allowed_types']);

            if (!in_array($mimeType, $allowedMimes)) {
                $errors[] = "Invalid file type. Allowed: " . implode(', ', $config['allowed_types']);
            }

            // Check size (convert MB to bytes)
            $maxSizeBytes = $config['max_size'] * 1024 * 1024;
            if ($file->getSize() > $maxSizeBytes) {
                $errors[] = "File size exceeds {$config['max_size']}MB";
            }
        }

        return $errors;
    }

    /**
     * Save request fields (including image uploads)
     */
    private function saveRequestFields(RequestModel $requestModel, RequestType $requestType, array $fields, Request $request): void
    {
        foreach ($requestType->fields as $fieldDefinition) {
            $fieldKey = $fieldDefinition->field_key;
            $fieldValue = $fields[$fieldKey] ?? null;

            if ($fieldDefinition->isImageType()) {
                // Handle image upload
                $imageUrls = $this->uploadImages($requestModel, $fieldDefinition, $fieldKey, $request);
                $requestModel->setFieldValue($fieldKey, $imageUrls);
            } else {
                // Handle regular fields
                $requestModel->setFieldValue($fieldKey, $fieldValue);
            }
        }
    }

    /**
     * Upload images for request
     */
    private function uploadImages(RequestModel $requestModel, RequestTypeField $field, string $fieldKey, Request $request): array
    {
        $files = $request->file($fieldKey);
        if (empty($files)) {
            return [];
        }

        $config = $field->getImageConfig();
        $filesArray = is_array($files) ? $files : [$files];
        $uploadedUrls = [];

        foreach ($filesArray as $file) {
            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = "requests/{$requestModel->id}/{$filename}";

            // Store file
            $storedPath = Storage::disk('public')->putFileAs(
                "requests/{$requestModel->id}",
                $file,
                $filename
            );

            // Get public URL
            $url = Storage::disk('public')->url($storedPath);
            $uploadedUrls[] = $url;

            // Create attachment record
            \App\Models\Attachment::create([
                'entity_type' => RequestModel::class,
                'entity_id' => $requestModel->id,
                'uploaded_by' => $request->user()->id,
                'file_path' => $storedPath,
                'file_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'disk' => 'public',
            ]);
        }

        // Return single URL or array of URLs based on config
        if ($config['multiple']) {
            return ['urls' => $uploadedUrls];
        } else {
            return ['url' => $uploadedUrls[0] ?? null];
        }
    }

    /**
     * Bulk update/delete requests
     */
    public function bulk(Request $request)
    {
        $request->validate([
            'action' => 'required|string|in:update,delete',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:requests,id',
            'data' => 'required_if:action,update|array',
        ]);

        $user = $request->user();
        $ids = $request->ids;
        $action = $request->action;

        // Verify user has access to all requests
        $requests = RequestModel::whereIn('id', $ids)->get();
        
        if ($user->role === 'client') {
            // Clients can only modify their own requests
            $unauthorizedIds = $requests->where('created_by', '!=', $user->id)->pluck('id');
            if ($unauthorizedIds->isNotEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to some requests',
                    'unauthorized_ids' => $unauthorizedIds,
                ], 403);
            }
        } elseif ($user->role === 'staff') {
            // Staff can only modify assigned requests
            $unauthorizedIds = $requests->where('assigned_user_id', '!=', $user->id)
                ->whereNotIn('assigned_team_id', $user->teams->pluck('id'))
                ->pluck('id');
            if ($unauthorizedIds->isNotEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to some requests',
                    'unauthorized_ids' => $unauthorizedIds,
                ], 403);
            }
        }

        if ($action === 'update') {
            $data = $request->data;
            
            // Validate update data
            $allowedFields = ['status', 'assigned_user_id', 'assigned_team_id', 'priority'];
            $data = array_intersect_key($data, array_flip($allowedFields));
            
            if (empty($data)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid fields to update',
                ], 422);
            }

            $updated = RequestModel::whereIn('id', $ids)->update($data);

            return response()->json([
                'success' => true,
                'message' => "{$updated} request(s) updated successfully",
                'updated_count' => $updated,
            ]);
        } elseif ($action === 'delete') {
            $deleted = RequestModel::whereIn('id', $ids)->delete();

            return response()->json([
                'success' => true,
                'message' => "{$deleted} request(s) deleted successfully",
                'deleted_count' => $deleted,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid action',
        ], 422);
    }
}


