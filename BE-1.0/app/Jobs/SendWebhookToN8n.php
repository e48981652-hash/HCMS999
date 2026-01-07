<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWebhookToN8n implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $event;
    public array $payload;
    public int $tries = 3;
    public int $backoff = 60; // seconds

    /**
     * Create a new job instance.
     */
    public function __construct(string $event, array $payload)
    {
        $this->event = $event;
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $webhookUrl = config('services.n8n.webhook_url');

        if (!$webhookUrl) {
            Log::warning('N8N webhook URL not configured');
            return;
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'X-Event' => $this->event,
                    'X-Signature' => $this->generateSignature(),
                ])
                ->post($webhookUrl, $this->payload);

            if (!$response->successful()) {
                throw new \Exception('Webhook request failed: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Failed to send webhook to n8n', [
                'event' => $this->event,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Will trigger retry
        }
    }

    /**
     * Generate HMAC signature for webhook security
     */
    private function generateSignature(): string
    {
        $secret = config('services.n8n.secret');
        $payload = json_encode($this->payload);

        return hash_hmac('sha256', $payload, $secret);
    }
}


