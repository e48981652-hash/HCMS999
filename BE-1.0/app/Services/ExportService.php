<?php

namespace App\Services;

use Illuminate\Support\Collection;

class ExportService
{
    /**
     * Export collection to CSV
     */
    public function toCsv(Collection $data, array $headers, string $filename): string
    {
        $csv = fopen('php://temp', 'r+');
        
        // Add BOM for UTF-8
        fwrite($csv, "\xEF\xBB\xBF");
        
        // Add headers
        fputcsv($csv, $headers);
        
        // Add data
        foreach ($data as $row) {
            $values = [];
            foreach ($headers as $header) {
                $values[] = $row[$header] ?? '';
            }
            fputcsv($csv, $values);
        }
        
        rewind($csv);
        $csvData = stream_get_contents($csv);
        fclose($csv);
        
        return $csvData;
    }
}
