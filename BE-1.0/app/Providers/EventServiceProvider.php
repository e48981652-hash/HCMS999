<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\BusinessCreated;
use App\Events\RequestCreated;
use App\Events\RequestStatusChanged;
use App\Events\McpPostUpdated;
use App\Events\FeedbackSubmitted;
use App\Listeners\SendWebhookListener;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        BusinessCreated::class => [
            [SendWebhookListener::class, 'handleBusinessCreated'],
        ],
        RequestCreated::class => [
            [SendWebhookListener::class, 'handleRequestCreated'],
        ],
        RequestStatusChanged::class => [
            [SendWebhookListener::class, 'handleRequestStatusChanged'],
        ],
        McpPostUpdated::class => [
            [SendWebhookListener::class, 'handleMcpPostUpdated'],
        ],
        FeedbackSubmitted::class => [
            [SendWebhookListener::class, 'handleFeedbackSubmitted'],
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}


