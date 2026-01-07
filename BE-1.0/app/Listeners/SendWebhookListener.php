<?php

namespace App\Listeners;

use App\Jobs\SendWebhookToN8n;
use App\Events\RequestCreated;
use App\Events\RequestStatusChanged;
use App\Events\BusinessCreated;
use App\Events\McpPostUpdated;
use App\Events\FeedbackSubmitted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendWebhookListener
{
    /**
     * Handle request created event
     */
    public function handleRequestCreated(RequestCreated $event): void
    {
        $request = $event->request->load(['business', 'requestType', 'fieldValues']);

        // Get image URLs from field values
        $images = [];
        foreach ($request->fieldValues as $fieldValue) {
            if ($fieldValue->value_json) {
                $data = $fieldValue->value_json;
                if (isset($data['url'])) {
                    $images[] = $data['url'];
                } elseif (isset($data['urls'])) {
                    $images = array_merge($images, $data['urls']);
                }
            }
        }

        SendWebhookToN8n::dispatch('request.created', [
            'event' => 'request.created',
            'request_id' => $request->id,
            'business_id' => $request->business_id,
            'request_type' => $request->requestType->name,
            'images' => $images,
            'created_at' => $request->created_at->toIso8601String(),
        ]);
    }

    /**
     * Handle request status changed event
     */
    public function handleRequestStatusChanged(RequestStatusChanged $event): void
    {
        SendWebhookToN8n::dispatch('request.status_changed', [
            'event' => 'request.status_changed',
            'request_id' => $event->request->id,
            'old_status' => $event->oldStatus,
            'new_status' => $event->request->status,
            'updated_at' => $event->request->updated_at->toIso8601String(),
        ]);
    }

    /**
     * Handle business created event
     */
    public function handleBusinessCreated(BusinessCreated $event): void
    {
        SendWebhookToN8n::dispatch('business.created', [
            'event' => 'business.created',
            'business_id' => $event->business->id,
            'owner_id' => $event->business->owner_user_id,
            'name' => $event->business->name,
        ]);
    }

    /**
     * Handle MCP post updated event
     */
    public function handleMcpPostUpdated(McpPostUpdated $event): void
    {
        SendWebhookToN8n::dispatch('mcp.post.updated', [
            'event' => 'mcp.post.updated',
            'post_id' => $event->post->id,
            'mcp_id' => $event->post->mcp_id,
            'status' => $event->post->status,
        ]);
    }

    /**
     * Handle feedback submitted event
     */
    public function handleFeedbackSubmitted(FeedbackSubmitted $event): void
    {
        SendWebhookToN8n::dispatch('feedback.submitted', [
            'event' => 'feedback.submitted',
            'feedback_id' => $event->feedback->id,
            'user_id' => $event->feedback->user_id,
            'rating' => $event->feedback->rating,
            'category' => $event->feedback->category,
        ]);
    }
}
