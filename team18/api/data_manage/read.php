<?php
// team18/api/data_manage/read.php

ini_set("display_errors", 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../config/auth_check.php";   // 로그인 체크
require_once __DIR__ . "/../config/db.php";           // DB 연결

// 요청 파라미터 읽기
$table = isset($_GET["table"]) ? $_GET["table"] : "";
$page = isset($_GET["page"]) ? intval($_GET["page"]) : 1;
$page_size = isset($_GET["page_size"]) ? intval($_GET["page_size"]) : 20;
$sort_by = isset($_GET["sort_by"]) ? $_GET["sort_by"] : "1";
$sort_order = (isset($_GET["sort_order"]) && strtolower($_GET["sort_order"]) === "desc") ? "DESC" : "ASC";

// 허용된 테이블만 조회 가능 (보안)
$allowed_tables = [
    "disasters",
    "country",
    "continent",
    "disaster_types",
    "global_annual_temperatures",
    "global_annual_sst_anomalies",
    "co2_concentration",
    "country_annual_temperatures"
];

if (!in_array($table, $allowed_tables)) {
    echo json_encode([
        "status" => "error",
        "error" => [
            "code" => 400,
            "message" => "Invalid table name"
        ]
    ]);
    exit;
}

// 페이징 계산
$offset = ($page - 1) * $page_size;

// 전체 개수 조회
$count_sql = "SELECT COUNT(*) AS total FROM $table";
$count_result = $mysqli->query($count_sql);
$count_row = $count_result->fetch_assoc();
$total_records = intval($count_row["total"]);

// SELECT 조회
$sql = "SELECT * FROM $table ORDER BY $sort_by $sort_order LIMIT ?, ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("ii", $offset, $page_size);
$stmt->execute();
$result = $stmt->get_result();

// 결과 배열 생성
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

// 성공 응답
echo json_encode([
    "status" => "success",
    "meta" => [
        "table" => $table,
        "page" => $page,
        "page_size" => $page_size,
        "total_records" => $total_records
    ],
    "data" => $data
]);

?>
