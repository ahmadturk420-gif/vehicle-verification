<?php
header("Content-Type: application/json");
require 'db.php';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

$id     = intval($data['id'] ?? 0);
$status = trim($data['status'] ?? '');

if (!$id || !in_array($status, ['Available', 'Sold'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid ID or status value!"]);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE vehicles SET status = :status WHERE id = :id");
    $stmt->execute([':status' => $status, ':id' => $id]);

    echo json_encode(["status" => "success", "message" => "Vehicle marked as $status!"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>