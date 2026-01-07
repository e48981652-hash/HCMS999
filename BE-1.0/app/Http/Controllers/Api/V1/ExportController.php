<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Request as RequestModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExportController extends Controller
{
    /**
     * Export requests to CSV/Excel
     */
    public function requests(Request $request)
    {
        $request->validate([
            'format' => 'nullable|string|in:csv,excel',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|string',
            'business_id' => 'nullable|integer|exists:businesses,id',
        ]);

        $format = $request->get('format', 'csv');
        $query = RequestModel::with(['business', 'creator', 'requestType', 'assignedTeam']);

        // Apply filters
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('business_id')) {
            $query->where('business_id', $request->business_id);
        }

        $requests = $query->orderBy('created_at', 'desc')->get();

        // Prepare data
        $data = $requests->map(function($req) {
            return [
                'ID' => $req->id,
                'Request Type' => $req->requestType->name ?? 'N/A',
                'Business' => $req->business->name ?? 'N/A',
                'Created By' => $req->creator->first_name . ' ' . $req->creator->last_name,
                'Status' => $req->status,
                'Priority' => $req->priority ?? 'N/A',
                'Assigned Team' => $req->assignedTeam->name ?? 'N/A',
                'Due Date' => $req->due_at ? $req->due_at->format('Y-m-d H:i:s') : 'N/A',
                'Created At' => $req->created_at->format('Y-m-d H:i:s'),
                'Updated At' => $req->updated_at->format('Y-m-d H:i:s'),
            ];
        });

        if ($format === 'csv') {
            return $this->exportToCsv($data, 'requests_' . now()->format('Y-m-d') . '.csv');
        } else {
            // For Excel, you would use a library like Laravel Excel
            // For now, return CSV as Excel format requires additional dependencies
            return $this->exportToCsv($data, 'requests_' . now()->format('Y-m-d') . '.csv');
        }
    }

    /**
     * Export clients to CSV/Excel
     */
    public function clients(Request $request)
    {
        $request->validate([
            'format' => 'nullable|string|in:csv,excel',
            'status' => 'nullable|string|in:active,suspended',
        ]);

        $format = $request->get('format', 'csv');
        $query = User::where('role', 'client')->with(['businesses']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $clients = $query->orderBy('created_at', 'desc')->get();

        $data = $clients->map(function($client) {
            return [
                'ID' => $client->id,
                'First Name' => $client->first_name,
                'Last Name' => $client->last_name,
                'Email' => $client->email,
                'Status' => $client->status,
                'Businesses Count' => $client->businesses->count(),
                'Businesses' => $client->businesses->pluck('name')->join(', '),
                'Created At' => $client->created_at->format('Y-m-d H:i:s'),
            ];
        });

        if ($format === 'csv') {
            return $this->exportToCsv($data, 'clients_' . now()->format('Y-m-d') . '.csv');
        } else {
            return $this->exportToCsv($data, 'clients_' . now()->format('Y-m-d') . '.csv');
        }
    }

    /**
     * Export to CSV
     */
    private function exportToCsv($data, $filename)
    {
        if ($data->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No data to export',
            ], 400);
        }

        $headers = array_keys($data->first());
        $csv = fopen('php://temp', 'r+');

        // Add BOM for UTF-8
        fwrite($csv, "\xEF\xBB\xBF");

        // Add headers
        fputcsv($csv, $headers);

        // Add data
        foreach ($data as $row) {
            fputcsv($csv, array_values($row));
        }

        rewind($csv);
        $csvData = stream_get_contents($csv);
        fclose($csv);

        return response($csvData)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
