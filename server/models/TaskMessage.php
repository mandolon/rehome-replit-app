<?php
class TaskMessage {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function getByTaskId($taskId) {
        $stmt = $this->pdo->prepare("SELECT * FROM task_messages WHERE task_id = ? ORDER BY created_at ASC");
        $stmt->execute([$taskId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO task_messages (task_id, user_id, user_name, message, created_at, updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW()) 
            RETURNING *
        ");
        $stmt->execute([
            $data['taskId'],
            $data['userId'] ?? '1',
            $data['userName'] ?? 'User',
            $data['message']
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>