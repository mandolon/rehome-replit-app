<?php

namespace App\Http\Controllers;

use App\Models\TaskMessage;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskMessageController extends Controller
{
    /**
     * Get all messages for a specific task
     */
    public function index(string $taskId): JsonResponse
    {
        $task = Task::where('task_id', $taskId)->firstOrFail();
        
        $messages = TaskMessage::byTask($taskId)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Store a new message for a task
     */
    public function store(Request $request, string $taskId): JsonResponse
    {
        $task = Task::where('task_id', $taskId)->firstOrFail();

        $validated = $request->validate([
            'content' => 'required|string',
            'user_id' => 'required|integer|exists:users,id',
            'message_type' => 'nullable|string|in:comment,system,attachment',
            'metadata' => 'nullable|array'
        ]);

        $message = TaskMessage::create([
            'task_id' => $taskId,
            'user_id' => $validated['user_id'],
            'content' => $validated['content'],
            'message_type' => $validated['message_type'] ?? 'comment',
            'metadata' => $validated['metadata'] ?? null
        ]);

        $message->load('user');

        // Broadcast real-time update
        broadcast(new \App\Events\TaskMessageCreated($message));

        return response()->json($message, 201);
    }

    /**
     * Update a specific message
     */
    public function update(Request $request, string $taskId, int $messageId): JsonResponse
    {
        $message = TaskMessage::where('id', $messageId)
            ->where('task_id', $taskId)
            ->firstOrFail();

        $validated = $request->validate([
            'content' => 'sometimes|string',
            'metadata' => 'nullable|array'
        ]);

        $message->update($validated);
        $message->load('user');

        // Broadcast real-time update
        broadcast(new \App\Events\TaskMessageUpdated($message));

        return response()->json($message);
    }

    /**
     * Delete a specific message
     */
    public function destroy(string $taskId, int $messageId): JsonResponse
    {
        $message = TaskMessage::where('id', $messageId)
            ->where('task_id', $taskId)
            ->firstOrFail();

        $message->delete();

        // Broadcast real-time update
        broadcast(new \App\Events\TaskMessageDeleted($messageId, $taskId));

        return response()->json(['message' => 'Message deleted successfully'], 204);
    }
}