<?php
// disaster_types.php
header("Content-Type: application/json; charset=utf-8");

require_once "../config/db.php";  // $mysqli 연결 사용

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
    // 2) 재해 유형 목록 조회
    $sql = "
        SELECT 
            disaster_type_id,
            disaster_group,
            disaster_subtype
        FROM disaster_types
        ORDER BY disaster_type_id ASC
    ";

    $result = $mysqli->query($sql);

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = [
            "id"    => (int)$row["disaster_type_id"],
            "group" => $row["disaster_group"],
            "type"  => $row["disaster_subtype"]
        ];
    }

    // 3) 응답 JSON
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

