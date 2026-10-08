<?php
header("Content-Type: application/json");
require 'db.php';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

$title      = trim($data['title'] ?? '');
$make       = trim($data['make'] ?? '');
$model_year = intval($data['model_year'] ?? 0);
$price      = intval($data['price'] ?? 0);
$mileage    = intval($data['mileage'] ?? 0);
$city       = trim($data['city'] ?? '');

if (empty($title) || empty($make) || !$model_year || !$price || !$mileage || empty($city)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "All fields are required!"]);
    exit;
}

try {
    $sql = "INSERT INTO vehicles (title, make, model_year, price, mileage, city, status) 
            VALUES (:title, :make, :model_year, :price, :mileage, :city, 'Available')";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':title'      => $title,
        ':make'       => $make,
        ':model_year' => $model_year,
        ':price'      => $price,
        ':mileage'    => $mileage,
        ':city'       => $city
    ]);

    echo json_encode(["status" => "success", "message" => "Vehicle listing created!"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>