<?php
// team18/api/data_manage/create.php

ob_start();  // ★ PHP warning을 숨겨 JSON 깨짐 방지
ini_set("display_errors", 0);
error_reporting(E_ALL);


header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../config/auth_check.php";    // 로그인 체크
require_once __DIR__ . "/../config/db.php";            // DB 연결

// JSON 입력 파싱
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

// JSON 형식 오류 처리
if (!is_array($data)) {
    echo json_encode([
        "status" => "error",
        "error" => [
            "code" => 400,
            "message" => "Invalid JSON format"
        ]
    ]);
    exit;
}

// 필수 필드 체크
$required = [
    "country_id",
    "disaster_type_id",
    "start_year",
    "end_year",
    "total_deaths",
    "total_affected",
    "total_damage_thousand_usd"
];

foreach ($required as $field) {
    if (!isset($data[$field])) {
        echo json_encode([
            "status" => "error",
            "error" => [
                "code" => 400,
                "message" => "$field is required"
            ]
        ]);
        exit;
    }
}

// 값 추출
$country_id  = intval($data["country_id"]);
$disaster_type_id = intval($data["disaster_type_id"]);
$start_year  = intval($data["start_year"]);
$end_year    = intval($data["end_year"]);
$total_deaths  = intval($data["total_deaths"]);
$total_affected = intval($data["total_affected"]);
$total_damage   = intval($data["total_damage_thousand_usd"]);

$user_id = $_SESSION["user_id"];   // 로그인 사용자 ID

try {
    // 트랜잭션 시작
    $mysqli->begin_transaction();

    // disasters 테이블 INSERT
    $sql1 = "
        INSERT INTO disasters 
        (country_id, disaster_type_id, start_year, end_year, total_deaths, total_affected, total_damage_thousand_usd)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ";
    $stmt1 = $mysqli->prepare($sql1);
    $stmt1->bind_param(
        "iiiiiii",
        $country_id, $disaster_type_id,
        $start_year, $end_year,
        $total_deaths, $total_affected, $total_damage
    );
    $stmt1->execute();

    // 새 레코드 ID
    $new_id = $mysqli->insert_id;

    // user_insert 로그 INSERT
    $sql2 = "
        INSERT INTO user_activity_log (user_id, table_name, record_id, action_type)
        VALUES (?, 'disasters', ?, 'Insert')
    ";
    $stmt2 = $mysqli->prepare($sql2);
    $stmt2->bind_param("ii", $user_id, $new_id);
    $stmt2->execute();

    $mysqli->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Disaster record created successfully",
        "record" => [
            "disaster_id" => $new_id,
            "country_id" => $country_id,
            "disaster_type_id" => $disaster_type_id,
            "start_year" => $start_year,
            "end_year" => $end_year,
            "total_deaths" => $total_deaths,
            "total_affected" => $total_affected,
            "total_damage_thousand_usd" => $total_damage
        ]
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
