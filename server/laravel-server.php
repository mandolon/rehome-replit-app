<?php
// Built-in PHP development server for Laravel API
$host = '0.0.0.0';
$port = 8000;
$document_root = __DIR__;

// Start the server
echo "Starting Laravel API server on http://{$host}:{$port}\n";
echo "Document root: {$document_root}\n";

// Handle requests
if (php_sapi_name() === 'cli-server') {
    $request_uri = $_SERVER['REQUEST_URI'];
    
    // Route all API requests to api.php
    if (strpos($request_uri, '/api/') === 0) {
        include __DIR__ . '/api.php';
        return true;
    }
    
    // Serve static files
    $file_path = $document_root . $request_uri;
    if (is_file($file_path)) {
        return false; // Let the built-in server handle static files
    }
    
    // Default to index.php for SPA routing
    include __DIR__ . '/api.php';
    return true;
}
?>