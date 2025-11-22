<?php
// continents.php
header("Content-Type: application/json; charset=utf-8");

require_once "../config/db.php";  // $mysqli 사용

// 1) 메서드 체크 (GET만 허용)
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "errorCode" => "METHOD_NOT_ALLOWED",
        "message" => "Only GET method is allowed."
    ]);
    exit;
}

try {
    // 2) DB에서 대륙 목록 조회
    $sql = "SELECT continent_id, continent_name FROM continent ORDER BY continent_id ASC";
    $result = $mysqli->query($sql);

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = [
            "id"   => (int)$row["continent_id"],
            "name" => $row["continent_name"]
        ];
    }

    // 3) 응답 반환
    echo json_encode([
        "success" => true,
        "data"    => $data
    ]);

} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "errorCode" => "DB_QUERY_ERROR",
        "message" => $e->getMessage()
    ]);
}
