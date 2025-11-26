<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . "/../config/auth_check.php";
require_once __DIR__ . "/../config/db.php";

header("Content-Type: application/json; charset=utf-8");

// 1) 파라미터 받기
$data_series = $_GET['data_series'] ?? null;
$window_size = isset($_GET['window_size']) ? intval($_GET['window_size']) : null;
$start_year = $_GET['start_year'] ?? null;
$end_year = $_GET['end_year'] ?? null;
$region_entity = $_GET['region_entity'] ?? null;

// 필수값 체크
if (!$data_series || !$window_size || !$start_year || !$end_year) {
    echo json_encode([
        "success" => false,
        "message" => "Missing parameters: data_series, window_size, start_year, end_year are required."
    ]);
    exit;
}

// 2) data_series에 따라 SQL 분기
switch ($data_series) {
    case "global_temp":
        $sql = "
            SELECT measurement_year AS year, global_avg_temperature_celsius AS value
            FROM global_annual_temperatures
            WHERE measurement_year BETWEEN ? AND ?
            ORDER BY measurement_year ASC
        ";
        $types = "ii";
        $params = [$start_year, $end_year];
        $unit = "°C";
        $description = "${window_size}-year moving average of global annual temperatures";
        break;

    case "sst_anomaly":
        if (!$region_entity) {
            echo json_encode([
                "success" => false,
                "message" => "region_entity is required for sst_anomaly."
            ]);
            exit;
        }

        $sql = "
            SELECT measurement_year AS year, sst_anomaly_celsius AS value
            FROM global_annual_sst_anomalies
            WHERE measurement_year BETWEEN ? AND ?
              AND region_entity = ?
            ORDER BY measurement_year ASC
        ";
        $types = "iis";
        $params = [$start_year, $end_year, $region_entity];
        $unit = "°C";
        $description = "${window_size}-year moving average of sea surface temperature anomalies";
        break;

    case "co2_concentration":
        $sql = "
            SELECT year AS year, co2_ppm AS value
            FROM co2_concentration
            WHERE year BETWEEN ? AND ?
            ORDER BY year ASC
        ";
        $types = "ii";
        $params = [$start_year, $end_year];
        $unit = "ppm";
        $description = "${window_size}-year moving average of CO₂ concentration";
        break;

    default:
        echo json_encode([
            "success" => false,
            "message" => "Invalid data_series option."
        ]);
        exit;
}

// 3) DB 실행
$stmt = $mysqli->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

// 4) 이동평균 계산
$moving = [];
$count = count($rows);

for ($i = 0; $i < $count; $i++) {
    $sum = 0;
    $valid = 0;

    for ($j = $i; $j > $i - $window_size; $j--) {
        if ($j < 0) break;
        $sum += $rows[$j]["value"];
        $valid++;
    }

    $moving[] = [
        "year" => $rows[$i]["year"],
        "original_value" => $rows[$i]["value"],
        "moving_avg" => round($sum / $valid, 3)
    ];
}

// 5) 응답 JSON
echo json_encode([
    "success" => true,
    "meta" => [
        "query" => [
            "data_series" => $data_series,
            "window_size" => $window_size,
            "start_year" => $start_year,
            "end_year" => $end_year,
            "region_entity" => $region_entity
        ],
        "unit" => $unit,
        "description" => $description,
        "records" => count($moving)
    ],
    "data" => $moving
]);
