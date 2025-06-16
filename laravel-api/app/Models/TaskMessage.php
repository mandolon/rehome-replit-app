<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TaskMessage extends Model
{
    use HasFactory;

    protected $table = 'task_messages';

    protected $fillable = [
        'task_id',
        'user_id',
        'content',
        'message_type',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id', 'task_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByTask($query, $taskId)
    {
        return $query->where('task_id', $taskId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('message_type', $type);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getFormattedContentAttribute()
    {
        return nl2br(e($this->content));
    }

    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}