<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskMessageController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Task Management Routes
Route::prefix('tasks')->group(function () {
    Route::get('/', [TaskController::class, 'index']);
    Route::get('/all', [TaskController::class, 'allTasks']);
    Route::post('/', [TaskController::class, 'store']);
    Route::get('/{taskId}', [TaskController::class, 'show']);
    Route::put('/{taskId}', [TaskController::class, 'update']);
    Route::delete('/{taskId}', [TaskController::class, 'destroy']);
    Route::delete('/{taskId}/permanent', [TaskController::class, 'forceDestroy']);
    Route::post('/{taskId}/restore', [TaskController::class, 'restore']);
    Route::patch('/{taskId}/status', [TaskController::class, 'updateStatus']);
    Route::post('/{taskId}/archive', [TaskController::class, 'archive']);
    
    // Task Messages
    Route::get('/{taskId}/messages', [TaskMessageController::class, 'index']);
    Route::post('/{taskId}/messages', [TaskMessageController::class, 'store']);
    Route::put('/{taskId}/messages/{messageId}', [TaskMessageController::class, 'update']);
    Route::delete('/{taskId}/messages/{messageId}', [TaskMessageController::class, 'destroy']);
});

// Project-specific tasks
Route::get('/projects/{projectId}/tasks', [TaskController::class, 'byProject']);

// User Management Routes
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::put('/{id}', [UserController::class, 'update']);
    Route::delete('/{id}', [UserController::class, 'destroy']);
});