<?php
class User {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getByUsername($username) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO users (username, role, created_at, updated_at) 
            VALUES (?, ?, NOW(), NOW()) 
            RETURNING *
        ");
        $stmt->execute([
            $data['username'],
            $data['role'] ?? 'user'
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>