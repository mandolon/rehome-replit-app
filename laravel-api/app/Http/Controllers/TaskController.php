<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks
     */
    public function index(Request $request): JsonResponse
    {
        $query = Task::with(['messages', 'creator'])
            ->active()
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('project_id')) {
            $query->byProject($request->project_id);
        }

        if ($request->has('include_deleted') && $request->boolean('include_deleted')) {
            $query->withTrashed();
        }

        $tasks = $query->get();

        return response()->json($tasks);
    }

    /**
     * Store a newly created task
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => 'required|string|unique:tasks,task_id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:redline,backlog,in_progress,in_review,completed',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'project_id' => 'nullable|string',
            'project' => 'nullable|string',
            'due_date' => 'nullable|date',
            'assignee' => 'nullable|string',
            'tags' => 'nullable|array',
            'created_by' => 'nullable|string'
        ]);

        $task = Task::create($validated);
        $task->load(['messages', 'creator']);

        // Broadcast real-time update
        broadcast(new \App\Events\TaskCreated($task));

        return response()->json($task, 201);
    }

    /**
     * Display the specified task
     */
    public function show(string $taskId): JsonResponse
    {
        $task = Task::with(['messages.user', 'creator'])
            ->where('task_id', $taskId)
            ->firstOrFail();

        return response()->json($task);
    }

    /**
     * Update the specified task
     */
    public function update(Request $request, string $taskId): JsonResponse
    {
        $task = Task::where('task_id', $taskId)->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:redline,backlog,in_progress,in_review,completed',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'project_id' => 'nullable|string',
            'project' => 'nullable|string',
            'due_date' => 'nullable|date',
            'assignee' => 'nullable|string',
            'tags' => 'nullable|array'
        ]);

        $task->update($validated);
        $task->load(['messages', 'creator']);

        // Broadcast real-time update
        broadcast(new \App\Events\TaskUpdated($task));

        return response()->json($task);
    }

    /**
     * Soft delete the specified task
     */
    public function destroy(string $taskId): JsonResponse
    {
        $task = Task::where('task_id', $taskId)->firstOrFail();
        $task->delete();

        // Broadcast real-time update
        broadcast(new \App\Events\TaskDeleted($taskId));

        return response()->json(['message' => 'Task deleted successfully'], 204);
    }

    /**
     * Permanently delete the specified task
     */
    public function forceDestroy(string $taskId): JsonResponse
    {
        $task = Task::withTrashed()
            ->where('task_id', $taskId)
            ->firstOrFail();
        
        $task->forceDelete();

        // Broadcast real-time update
        broadcast(new \App\Events\TaskPermanentlyDeleted($taskId));

        return response()->json(['message' => 'Task permanently deleted'], 204);
    }

    /**
     * Restore a soft deleted task
     */
    public function restore(string $taskId): JsonResponse
    {
        $task = Task::withTrashed()
            ->where('task_id', $taskId)
            ->firstOrFail();
        
        $task->restore();
        $task->load(['messages', 'creator']);

        // Broadcast real-time update
        broadcast(new \App\Events\TaskRestored($task));

        return response()->json($task);
    }

    /**
     * Get all tasks including deleted ones
     */
    public function allTasks(): JsonResponse
    {
        $tasks = Task::withTrashed()
            ->with(['messages', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tasks);
    }

    /**
     * Update task status
     */
    public function updateStatus(Request $request, string $taskId): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:redline,backlog,in_progress,in_review,completed'
        ]);

        $task = Task::where('task_id', $taskId)->firstOrFail();
        
        if ($validated['status'] === 'completed') {
            $task->markAsCompleted(auth()->id());
        } else {
            $task->update(['status' => $validated['status']]);
        }

        $task->load(['messages', 'creator']);

        // Broadcast real-time update
        broadcast(new \App\Events\TaskUpdated($task));

        return response()->json($task);
    }

    /**
     * Archive a task
     */
    public function archive(string $taskId): JsonResponse
    {
        $task = Task::where('task_id', $taskId)->firstOrFail();
        $task->archive(auth()->id());

        // Broadcast real-time update
        broadcast(new \App\Events\TaskArchived($task));

        return response()->json(['message' => 'Task archived successfully']);
    }

    /**
     * Get tasks by project
     */
    public function byProject(string $projectId): JsonResponse
    {
        $tasks = Task::byProject($projectId)
            ->with(['messages', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tasks);
    }
}