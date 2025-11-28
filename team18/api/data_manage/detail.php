<?php
// team18/api/data_manage/detail.php

ini_set("display_errors", 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../config/auth_check.php";
require_once __DIR__ . "/../config/db.php";

$table = "disasters";   // 고정
$pk    = "disaster_id";

$id = isset($_GET["id"]) ? intval($_GET["id"]) : 0;

if ($id <= 0) {
    echo json_encode([
        "status" => "error",
        "error" => [
            "code" => 400,
            "message" => "Invalid id"
        ]
    ]);
    exit;
}

$sql = "SELECT * FROM disasters WHERE disaster_id = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();

$result = $stmt->get_result();
$data = $result->fetch_assoc();

if (!$data) {
    echo json_encode([
        "status" => "error",
        "error" => [ "code" => 404, "message" => "Record not found" ]
    ]);
    exit;
}

echo json_encode([
    "status" => "success",
    "data" => $data
]);
