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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('task_id')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['redline', 'backlog', 'in_progress', 'in_review', 'completed'])->default('redline');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->nullable();
            $table->string('project_id')->nullable();
            $table->string('project')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->string('assignee')->nullable();
            $table->json('tags')->nullable();
            $table->string('created_by')->nullable();
            $table->string('deleted_by')->nullable();
            $table->boolean('archived')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->string('archived_by')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('completed_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['status']);
            $table->index(['project_id']);
            $table->index(['assignee']);
            $table->index(['created_by']);
            $table->index(['due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};