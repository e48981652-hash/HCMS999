<?php

namespace App\Events;

use App\Models\Request;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RequestStatusChanged
{
    use Dispatchable, SerializesModels;

    public Request $request;
    public string $oldStatus;

    /**
     * Create a new event instance.
     */
    public function __construct(Request $request, string $oldStatus)
    {
        $this->request = $request;
        $this->oldStatus = $oldStatus;
    }
}


