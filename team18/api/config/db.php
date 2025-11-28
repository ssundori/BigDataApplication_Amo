<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$host = "127.0.0.1";
$port = 3306;
$user = "root";
$pass = "";
$dbname = "climate_disaster_db";

try {
    $mysqli = new mysqli($host, $user, $pass, $dbname, $port);
    $mysqli->set_charset("utf8mb4");
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed",
        "detail" => $e->getMessage()
    ]);
    exit;
}
