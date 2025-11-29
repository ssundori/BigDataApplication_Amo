<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);


require_once __DIR__ . "/../config/db.php";

header("Content-Type: application/json; charset=utf-8");

// 입력값 정규화
function normalize($v) {
    if (!isset($v)) return null;
    if ($v === "" || $v === "undefined" || $v === "null") return null;
    return $v;
}

// 필수 파라미터
$rank_by = $_GET['rank_by'] ?? null;
$start_year = $_GET['start_year'] ?? null;
$end_year = $_GET['end_year'] ?? null;

// 선택 파라미터
$continent_id = normalize($_GET['continent_id'] ?? null);
$disaster_type_id = normalize($_GET['disaster_type_id'] ?? null);

// 필수값 체크
if (!$rank_by || !$start_year || !$end_year) {
    echo json_encode([
        "success" => false,
        "message" => "Missing parameters: rank_by, start_year, end_year are required."
    ]);
    exit;
}

// rank_by 매핑
$valid_columns = [
    "total_deaths",
    "total_affected",
    "total_damage_thousand_usd"
];

if (!in_array($rank_by, $valid_columns)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid rank_by. Allowed: total_deaths, total_affected, total_damage_thousand_usd"
    ]);
    exit;
}

// SQL 기본 구조
$sql = "
    SELECT 
        c.country_id,
        c.country_name,
        dt.disaster_subtype as disaster_type,
        SUM(d.$rank_by) AS measure_value
    FROM disasters d
    JOIN country c ON d.country_id = c.country_id
    JOIN disaster_types dt ON d.disaster_type_id = dt.disaster_type_id
    WHERE d.start_year BETWEEN ? AND ?
";

// 대륙 필터
$types = "ii";
$params = [$start_year, $end_year];

if ($continent_id !== null) {
    $sql .= " AND c.continent_id = ? ";
    $types .= "i";
    $params[] = intval($continent_id);
}

// 재해 유형 필터
if ($disaster_type_id !== null) {
    $sql .= " AND d.disaster_type_id = ? ";
    $types .= "i";
    $params[] = intval($disaster_type_id);
}

// 그룹/정렬/Top 10
$sql .= "
    GROUP BY c.country_id, c.country_name, dt.disaster_subtype
    ORDER BY measure_value DESC
    LIMIT 10
";

$stmt = $mysqli->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
$rank = 1;
while ($row = $result->fetch_assoc()) {
    $row['rank'] = $rank++;
    $data[] = $row;
}

echo json_encode([
    "success" => true,
    "meta" => [
        "rank_by" => $rank_by,
        "start_year" => $start_year,
        "end_year" => $end_year,
        "continent_id" => $continent_id,
        "disaster_type_id" => $disaster_type_id,
        "total_records" => count($data)
    ],
    "data" => $data
]);
