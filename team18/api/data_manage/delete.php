<?php
// team18/api/data_manage/delete.php

ini_set("display_errors", 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../config/auth_check.php";   // 로그인 체크
require_once __DIR__ . "/../config/db.php";           // DB 연결

// GET 파라미터 수집
$table = isset($_GET["table"]) ? $_GET["table"] : "";
$id    = isset($_GET["id"]) ? intval($_GET["id"]) : 0;

// 허용 테이블 목록
$allowed_tables = [
    "disasters" => "disaster_id",
    "co2_concentration" => "co2_id",
    "global_annual_temperatures" => "record_id",
    "global_annual_sst_anomalies" => "record_id",
    "country_annual_temperatures" => "record_id"
];

if (!array_key_exists($table, $allowed_tables)) {
    echo json_encode([
        "status" => "error",
        "error" => [
            "code" => 400,
            "message" => "Invalid table name"
        ]
    ]);
    exit;
}

$pk_name = $allowed_tables[$table];

// ID 체크
if ($id <= 0) {
    echo json_encode([
        "status" => "error",
        "error" => [
            "code" => 400,
            "message" => "Valid id is required"
        ]
    ]);
    exit;
}

$user_id = $_SESSION["user_id"];

try {
    // 트랜잭션 시작
    $mysqli->begin_transaction();

    // DELETE 실행
    $sql = "DELETE FROM $table WHERE $pk_name = ?";
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        throw new Exception("Record not found or already deleted");
    }

    // 로그 저장
    $sql2 = "
        INSERT INTO user_insert (user_id, table_name, record_id)
        VALUES (?, ?, ?)
    ";
    $stmt2 = $mysqli->prepare($sql2);
    $stmt2->bind_param("isi", $user_id, $table, $id);
    $stmt2->execute();

    // 커밋
    $mysqli->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Record deleted successfully",
        "deleted_id" => $id
    ]);

} catch (Exception $e) {
    $mysqli->rollback();

    echo json_encode([
        "status" => "error",
        "error" => [
            "code" => 500,
            "message" => "Transaction failed: " . $e->getMessage()
        ]
    ]);
}

?>
