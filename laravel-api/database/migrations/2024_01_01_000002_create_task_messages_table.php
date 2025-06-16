<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_messages', function (Blueprint $table) {
            $table->id();
            $table->string('task_id');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->enum('message_type', ['comment', 'system', 'attachment'])->default('comment');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['task_id']);
            $table->index(['user_id']);
            $table->index(['message_type']);
            $table->index(['created_at']);
            
            // Foreign key constraint for task_id
            $table->foreign('task_id')->references('task_id')->on('tasks')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_messages');
    }
};