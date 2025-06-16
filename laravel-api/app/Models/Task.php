<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tasks';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'task_id',
        'title',
        'description',
        'status',
        'priority',
        'project_id',
        'project',
        'due_date',
        'assignee',
        'tags',
        'created_by',
        'deleted_by'
    ];

    protected $casts = [
        'tags' => 'array',
        'due_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $dates = [
        'due_date',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    // Relationships
    public function messages()
    {
        return $this->hasMany(TaskMessage::class, 'task_id', 'task_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    // Accessors & Mutators
    public function getIsOverdueAttribute()
    {
        return $this->due_date && $this->due_date->isPast() && $this->status !== 'completed';
    }

    public function getFormattedDueDateAttribute()
    {
        return $this->due_date ? $this->due_date->format('M d, Y') : null;
    }

    // Methods
    public function markAsCompleted($userId = null)
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completed_by' => $userId
        ]);
    }

    public function archive($userId = null)
    {
        $this->update([
            'archived_at' => now(),
            'archived_by' => $userId
        ]);
    }

    public function restore()
    {
        $this->update([
            'deleted_at' => null,
            'deleted_by' => null
        ]);
    }
}