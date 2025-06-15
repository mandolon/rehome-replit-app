<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Task.php';
require_once __DIR__ . '/models/TaskMessage.php';

// WebSocket functionality for real-time updates
class TaskWebSocket {
    private static $clients = [];
    
    public static function broadcast($event, $data) {
        // In a production environment, this would use Redis or a proper WebSocket server
        // For now, we'll implement a simple file-based notification system
        $notification = [
            'event' => $event,
            'data' => $data,
            'timestamp' => time()
        ];
        file_put_contents(__DIR__ . '/websocket_events.json', json_encode($notification) . "\n", FILE_APPEND);
    }
}

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection using environment variables
try {
    $host = getenv('PGHOST') ?: 'localhost';
    $port = getenv('PGPORT') ?: '5432';
    $dbname = getenv('PGDATABASE') ?: 'postgres';
    $user = getenv('PGUSER') ?: 'postgres';
    $password = getenv('PGPASSWORD') ?: '';
    
    $pdo = new PDO(
        "pgsql:host={$host};port={$port};dbname={$dbname}",
        $user,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Route handler
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = parse_url($requestUri, PHP_URL_PATH);
$path = preg_replace('#^/api#', '', $path);

try {
    switch ($requestMethod) {
        case 'GET':
            handleGetRequest($pdo, $path);
            break;
        case 'POST':
            handlePostRequest($pdo, $path);
            break;
        case 'PUT':
            handlePutRequest($pdo, $path);
            break;
        case 'DELETE':
            handleDeleteRequest($pdo, $path);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleGetRequest($pdo, $path) {
    if ($path === '/tasks') {
        $stmt = $pdo->prepare("SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY created_at DESC");
        $stmt->execute();
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($tasks);
    } elseif ($path === '/tasks/all') {
        $stmt = $pdo->prepare("SELECT * FROM tasks ORDER BY created_at DESC");
        $stmt->execute();
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($tasks);
    } elseif (preg_match('#^/tasks/([^/]+)$#', $path, $matches)) {
        $taskId = $matches[1];
        $stmt = $pdo->prepare("SELECT * FROM tasks WHERE task_id = ?");
        $stmt->execute([$taskId]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($task) {
            echo json_encode($task);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Task not found']);
        }
    } elseif (preg_match('#^/tasks/([^/]+)/messages$#', $path, $matches)) {
        $taskId = $matches[1];
        $stmt = $pdo->prepare("SELECT * FROM task_messages WHERE task_id = ? ORDER BY created_at ASC");
        $stmt->execute([$taskId]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($messages);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
}

function handlePostRequest($pdo, $path) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($path === '/tasks') {
        $stmt = $pdo->prepare("
            INSERT INTO tasks (task_id, title, project_id, project, status, created_by, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW()) 
            RETURNING *
        ");
        $stmt->execute([
            $input['taskId'],
            $input['title'],
            $input['projectId'] ?? null,
            $input['project'] ?? null,
            $input['status'] ?? 'redline',
            $input['createdBy'] ?? 'system'
        ]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);
        http_response_code(201);
        echo json_encode($task);
    } elseif (preg_match('#^/tasks/([^/]+)/messages$#', $path, $matches)) {
        $taskId = $matches[1];
        $stmt = $pdo->prepare("
            INSERT INTO task_messages (task_id, user_id, user_name, message, created_at, updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW()) 
            RETURNING *
        ");
        $stmt->execute([
            $taskId,
            $input['userId'] ?? '1',
            $input['userName'] ?? 'User',
            $input['message']
        ]);
        $message = $stmt->fetch(PDO::FETCH_ASSOC);
        http_response_code(201);
        echo json_encode($message);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
}

function handlePutRequest($pdo, $path) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (preg_match('#^/tasks/([^/]+)$#', $path, $matches)) {
        $taskId = $matches[1];
        
        $updates = [];
        $values = [];
        
        if (isset($input['title'])) {
            $updates[] = 'title = ?';
            $values[] = $input['title'];
        }
        if (isset($input['status'])) {
            $updates[] = 'status = ?';
            $values[] = $input['status'];
        }
        if (isset($input['archived'])) {
            $updates[] = 'archived = ?';
            $values[] = $input['archived'];
        }
        if (isset($input['deletedAt'])) {
            $updates[] = 'deleted_at = ?';
            $values[] = $input['deletedAt'];
        }
        if (isset($input['deletedBy'])) {
            $updates[] = 'deleted_by = ?';
            $values[] = $input['deletedBy'];
        }
        
        $updates[] = 'updated_at = NOW()';
        $values[] = $taskId;
        
        $sql = "UPDATE tasks SET " . implode(', ', $updates) . " WHERE task_id = ? RETURNING *";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($task) {
            echo json_encode($task);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Task not found']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
}

function handleDeleteRequest($pdo, $path) {
    if (preg_match('#^/tasks/([^/]+)$#', $path, $matches)) {
        $taskId = $matches[1];
        
        // Soft delete by setting deleted_at and deleted_by
        $stmt = $pdo->prepare("
            UPDATE tasks 
            SET deleted_at = NOW(), deleted_by = 'system', updated_at = NOW() 
            WHERE task_id = ?
        ");
        $stmt->execute([$taskId]);
        
        if ($stmt->rowCount() > 0) {
            http_response_code(204);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Task not found']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
}
?>