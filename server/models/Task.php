<?php
class Task {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function getAll($includeDeleted = false) {
        $sql = "SELECT * FROM tasks";
        if (!$includeDeleted) {
            $sql .= " WHERE deleted_at IS NULL";
        }
        $sql .= " ORDER BY created_at DESC";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById($taskId) {
        $stmt = $this->pdo->prepare("SELECT * FROM tasks WHERE task_id = ?");
        $stmt->execute([$taskId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO tasks (task_id, title, project_id, project, status, created_by, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW()) 
            RETURNING *
        ");
        $stmt->execute([
            $data['taskId'],
            $data['title'],
            $data['projectId'] ?? null,
            $data['project'] ?? null,
            $data['status'] ?? 'redline',
            $data['createdBy'] ?? 'system'
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function update($taskId, $updates) {
        $setParts = [];
        $values = [];
        
        foreach ($updates as $field => $value) {
            $setParts[] = "{$field} = ?";
            $values[] = $value;
        }
        
        $setParts[] = "updated_at = NOW()";
        $values[] = $taskId;
        
        $sql = "UPDATE tasks SET " . implode(', ', $setParts) . " WHERE task_id = ? RETURNING *";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($values);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function softDelete($taskId, $deletedBy = 'system') {
        $stmt = $this->pdo->prepare("
            UPDATE tasks 
            SET deleted_at = NOW(), deleted_by = ?, updated_at = NOW() 
            WHERE task_id = ?
        ");
        $stmt->execute([$deletedBy, $taskId]);
        return $stmt->rowCount() > 0;
    }
    
    public function permanentDelete($taskId) {
        $stmt = $this->pdo->prepare("DELETE FROM tasks WHERE task_id = ?");
        $stmt->execute([$taskId]);
        return $stmt->rowCount() > 0;
    }
}
?>