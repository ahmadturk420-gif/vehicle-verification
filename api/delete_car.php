<?php
header("Content-Type: application/json");
require 'db.php';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

$id = intval($data['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid Vehicle ID"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM vehicles WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(["status" => "success", "message" => "Vehicle listing deleted successfully!"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>