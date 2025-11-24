<?php
header("Content-Type: application/json; charset=utf-8");
require_once "../config/db.php";

// GET only
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "errorCode" => "METHOD_NOT_ALLOWED",
        "message" => "Only GET method is allowed."
    ]);
    exit;
}

// parameters
$measure        = $_GET["measure"]        ?? null;
$fromYear       = $_GET["fromYear"]       ?? null;
$toYear         = $_GET["toYear"]         ?? null;
$continentId    = $_GET["continentId"]    ?? null;
$disasterTypeId = $_GET["disasterTypeId"] ?? null;

// validation
if (
    !$measure ||
    !$fromYear || !is_numeric($fromYear) ||
    !$toYear   || !is_numeric($toYear) ||
    !$continentId || !is_numeric($continentId) ||
    !$disasterTypeId || !is_numeric($disasterTypeId)
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "errorCode" => "VALIDATION_ERROR",
        "message" => "measure, fromYear, toYear, continentId, disasterTypeId are required."
    ]);
    exit;
}

$fromYear       = (int)$fromYear;
$toYear         = (int)$toYear;
$continentId    = (int)$continentId;
$disasterTypeId = (int)$disasterTypeId;

if ($fromYear > $toYear) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "errorCode" => "INVALID_YEAR_RANGE",
        "message" => "fromYear must be <= toYear."
    ]);
    exit;
}

// map measure → column
switch ($measure) {
    case "deaths":   $column = "total_deaths"; break;
    case "affected": $column = "total_affected"; break;
    case "damage":   $column = "total_damage_thousand_usd"; break;
    default:
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "errorCode" => "INVALID_MEASURE",
            "message" => "measure must be: deaths | affected | damage."
        ]);
        exit;
}

try {

    /*
        그룹핑 요구사항 충족
        GROUP BY c.continent_id, d.disaster_type_id
        (두 개 이상의 컬럼 group)
    */
    $sqlOverall = "
        SELECT 
            c.continent_id,
            d.disaster_type_id,
            SUM(d.$column) AS sum_value,
            AVG(d.$column) AS avg_value
        FROM disasters d
        JOIN country c ON d.country_id = c.country_id
        WHERE
            d.start_year BETWEEN ? AND ?
            AND c.continent_id = ?
            AND d.disaster_type_id = ?
        GROUP BY 
            c.continent_id,
            d.disaster_type_id
    ";

    $stmt = $mysqli->prepare($sqlOverall);
    $stmt->bind_param("iiii", $fromYear, $toYear, $continentId, $disasterTypeId);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();

    $overall = [
        "sum" => $row["sum_value"] !== null ? $row["sum_value"] + 0 : null,
        "avg" => $row["avg_value"] !== null ? $row["avg_value"] + 0 : null
    ];

    echo json_encode([
        "success"        => true,
        "measure"        => $measure,
        "fromYear"       => $fromYear,
        "toYear"         => $toYear,
        "continentId"    => $continentId,
        "disasterTypeId" => $disasterTypeId,
        "overall"        => $overall
    ]);

} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "errorCode" => "DB_QUERY_ERROR",
        "message" => $e->getMessage()
    ]);
}
