<?php
header("Content-Type: application/json; charset=utf-8");
require_once "../config/db.php";

// 1) GET only
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode([
        "success"   => false,
        "errorCode" => "METHOD_NOT_ALLOWED",
        "message"   => "Only GET is allowed."
    ]);
    exit;
}

// 2) Parameters
$countryId = $_GET["countryId"] ?? null;
$fromYear  = $_GET["fromYear"]  ?? null;
$toYear    = $_GET["toYear"]    ?? null;

if (
    !$countryId || !is_numeric($countryId) ||
    !$fromYear  || !is_numeric($fromYear) ||
    !$toYear    || !is_numeric($toYear)
) {
    http_response_code(400);
    echo json_encode([
        "success"   => false,
        "errorCode" => "VALIDATION_ERROR",
        "message"   => "countryId, fromYear, toYear are required."
    ]);
    exit;
}

$countryId = (int)$countryId;
$fromYear  = (int)$fromYear;
$toYear    = (int)$toYear;

if ($fromYear > $toYear) {
    http_response_code(400);
    echo json_encode([
        "success"   => false,
        "errorCode" => "INVALID_YEAR_RANGE",
        "message"   => "fromYear must be <= toYear."
    ]);
    exit;
}

try {

    // -------------------------------------------------------------------------
    // 3) 국가 정보 + 대륙 정보 조회
    // -------------------------------------------------------------------------
    $sqlCountry = "
        SELECT 
            c.country_id,
            c.country_name,
            c.continent_id,
            ct.continent_name
        FROM country c
        JOIN continent ct ON c.continent_id = ct.continent_id
        WHERE c.country_id = ?
    ";

    $stmt = $mysqli->prepare($sqlCountry);
    $stmt->bind_param("i", $countryId);
    $stmt->execute();
    $res = $stmt->get_result();
    $countryInfo = $res->fetch_assoc();
    $stmt->close();

    if (!$countryInfo) {
        echo json_encode([
            "success"   => false,
            "errorCode" => "COUNTRY_NOT_FOUND",
            "message"   => "Country not found."
        ]);
        exit;
    }

    $continentId   = (int)$countryInfo["continent_id"];
    $continentName = $countryInfo["continent_name"];


    // -------------------------------------------------------------------------
    // 4) 국가 연도별 연평균 기온
    // -------------------------------------------------------------------------
    $sqlCountryTemp = "
        SELECT measurement_year, avg_temperature_celsius
        FROM country_annual_temperatures
        WHERE country_id = ?
          AND measurement_year BETWEEN ? AND ?
    ";

    $stmt = $mysqli->prepare($sqlCountryTemp);
    $stmt->bind_param("iii", $countryId, $fromYear, $toYear);
    $stmt->execute();
    $resCountryTemp = $stmt->get_result();
    $stmt->close();

    $countryTemp = [];
    while ($row = $resCountryTemp->fetch_assoc()) {
        $year = (int)$row["measurement_year"];
        $countryTemp[$year] = $row["avg_temperature_celsius"];
    }


    // -------------------------------------------------------------------------
    // 5) 대륙 + 글로벌 ROLLUP
    // measurement_year + continent_id + ROLLUP → 두 단계 요약
    // -------------------------------------------------------------------------
    $sqlContinentGlobalTemp = "
        SELECT 
            t.measurement_year,
            c.continent_id,
            AVG(t.avg_temperature_celsius) AS avgTemp
        FROM country_annual_temperatures t
        JOIN country c ON t.country_id = c.country_id
        WHERE t.measurement_year BETWEEN ? AND ?
        GROUP BY t.measurement_year, c.continent_id WITH ROLLUP
    ";

    $stmt = $mysqli->prepare($sqlContinentGlobalTemp);
    $stmt->bind_param("ii", $fromYear, $toYear);
    $stmt->execute();
    $resRollup = $stmt->get_result();
    $stmt->close();

    $continentTemp = [];   // 대륙 평균만 저장
    $globalTemp = [];      // 글로벌 평균만 저장

    while ($row = $resRollup->fetch_assoc()) {

        $year = $row["measurement_year"];
        $cont = $row["continent_id"];

        // 연도 null → 전체 ALL → 필요 없음 (건너뜀)
        if ($year === null) continue;

        $year = (int)$year;

        // continent_id null → 글로벌 평균
        if ($cont === null) {
            $globalTemp[$year] = $row["avgTemp"];
        }
        // 특정 대륙 평균
        else if ((int)$cont === $continentId) {
            $continentTemp[$year] = $row["avgTemp"];
        }
    }


    // -------------------------------------------------------------------------
    // 6) 최종 응답 데이터 조립 (연도별 3줄)
    // -------------------------------------------------------------------------
    $data = [];

    for ($y = $fromYear; $y <= $toYear; $y++) {

        // 국가
        $data[] = [
            "year"    => $y,
            "level"   => "country",
            "avgTemp" => $countryTemp[$y] ?? null
        ];

        // 대륙
        $data[] = [
            "year"    => $y,
            "level"   => "continent",
            "avgTemp" => $continentTemp[$y] ?? null
        ];

        // 글로벌
        $data[] = [
            "year"    => $y,
            "level"   => "global",
            "avgTemp" => $globalTemp[$y] ?? null
        ];
    }


    // -------------------------------------------------------------------------
    // 7) 응답 반환
    // -------------------------------------------------------------------------
    echo json_encode([
        "success"       => true,
        "countryId"     => $countryInfo["country_id"],
        "countryName"   => $countryInfo["country_name"],
        "continentId"   => $continentId,
        "continentName" => $continentName,
        "fromYear"      => $fromYear,
        "toYear"        => $toYear,
        "data"          => $data
    ]);


} catch (mysqli_sql_exception $e) {

    http_response_code(500);
    echo json_encode([
        "success"   => false,
        "errorCode" => "DB_QUERY_ERROR",
        "message"   => $e->getMessage()
    ]);
}
?>
