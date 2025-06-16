<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::active()->orderBy('username');

        if ($request->has('role')) {
            $query->byRole($request->role);
        }

        $users = $query->get();

        return response()->json($users);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => 'required|string|unique:users,username|max:255',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:admin,manager,user,client',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'company' => 'nullable|string|max:255',
            'avatar_color' => 'nullable|string|max:255'
        ]);

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    /**
     * Display the specified user
     */
    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json($user);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'username' => ['sometimes', 'string', 'max:255', Rule::unique('users')->ignore($id)],
            'email' => ['nullable', 'email', Rule::unique('users')->ignore($id)],
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|in:admin,manager,user,client',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'company' => 'nullable|string|max:255',
            'status' => 'sometimes|in:active,inactive,suspended',
            'avatar_color' => 'nullable|string|max:255',
            'notifications_muted' => 'nullable|boolean',
            'show_online_status' => 'nullable|boolean',
            'show_last_active' => 'nullable|boolean'
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    /**
     * Remove the specified user
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully'], 204);
    }

    /**
     * Update user's last active timestamp
     */
    public function updateLastActive(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->updateLastActive();

        return response()->json(['message' => 'Last active updated']);
    }

    /**
     * Get users by role
     */
    public function byRole(string $role): JsonResponse
    {
        $users = User::byRole($role)->active()->get();

        return response()->json($users);
    }
}