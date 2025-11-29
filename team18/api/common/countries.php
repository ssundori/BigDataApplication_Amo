<?php
// countries.php
header("Content-Type: application/json; charset=utf-8");

require_once "../config/db.php";  // DB 연결 ($mysqli)

// 1) GET 메서드만 허용
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
    // 2) 국가 목록 조회
    $sql = "
        SELECT 
            country_id,
            country_name
        FROM country
        ORDER BY country_name ASC
    ";

    $result = $mysqli->query($sql);

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = [
            "id"   => (int)$row["country_id"],
            "name" => $row["country_name"]
        ];
    }

    // 3) 성공 응답
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
