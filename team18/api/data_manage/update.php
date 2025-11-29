<?php
// team18/api/data_manage/update.php

ini_set("display_errors", 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../config/auth_check.php";    // 로그인 체크
require_once __DIR__ . "/../config/db.php";           // DB 연결

// 필수 GET 파라미터
$table = isset($_GET["table"]) ? $_GET["table"] : "";
$id    = isset($_GET["id"]) ? intval($_GET["id"]) : 0;

// 허용 테이블 목록 (보안)
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

// JSON Body 읽기
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!is_array($data)) {
    echo json_encode([
        "status" => "error",
        "error" => [
            "code" => 400,
            "message" => "Invalid JSON body"
        ]
    ]);
    exit;
}

// 업데이트할 필드 생성
$fields = [];
$values = [];

foreach ($data as $column => $value) {
    $fields[] = "$column = ?";
    $values[] = $value;
}

// 업데이트할 항목이 없으면 중단
if (count($fields) === 0) {
    echo json_encode([
        "status" => "error",
        "error" => [
            "code" => 400,
            "message" => "No fields to update"
        ]
    ]);
    exit;
}

$user_id = $_SESSION["user_id"];

try {
    // 트랜잭션 시작
    $mysqli->begin_transaction();

    // UPDATE SQL 준비
    $sql = "UPDATE $table SET " . implode(", ", $fields) . " WHERE $pk_name = ?";
    $stmt = $mysqli->prepare($sql);

    // 바인딩 타입 처리 (모두 string 처리해도 문제 없음)
    $types = str_repeat("s", count($values)) . "i";

    // id 추가
    $values[] = $id;

    // prepare용 동적 바인딩
    $stmt->bind_param($types, ...$values);
    $stmt->execute();

    // user_insert 로그 저장
    $sql2 = "
        INSERT INTO user_activity_log (user_id, table_name, record_id, action_type)
        VALUES (?, ?, ?, 'Update')
    ";
    $stmt2 = $mysqli->prepare($sql2);
    $stmt2->bind_param("isi", $user_id, $table, $id);
    $stmt2->execute();

    // 커밋
    $mysqli->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Record updated successfully",
        "updated_id" => $id
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
