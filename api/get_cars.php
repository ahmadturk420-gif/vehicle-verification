<?php
header("Content-Type: application/json");
require 'db.php';

try {
    $stmt = $pdo->query("SELECT * FROM vehicles ORDER BY id DESC");
    $cars = $stmt->fetchAll();
    echo json_encode(["status" => "success", "data" => $cars]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>