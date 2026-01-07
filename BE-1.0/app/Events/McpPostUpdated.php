<?php

namespace App\Events;

use App\Models\McpPost;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class McpPostUpdated
{
    use Dispatchable, SerializesModels;

    public McpPost $post;

    /**
     * Create a new event instance.
     */
    public function __construct(McpPost $post)
    {
        $this->post = $post;
    }
}


