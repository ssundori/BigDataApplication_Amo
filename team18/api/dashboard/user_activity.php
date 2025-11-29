<?php
// user_activity.php
header("Content-Type: application/json; charset=utf-8");

require_once "../config/db.php";  // $mysqli

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "errorCode" => "METHOD_NOT_ALLOWED",
        "message" => "Only GET method is allowed."
    ]);
    exit;
}

// limit 파라미터 (기본 10)
$limit = 10;
if (isset($_GET["limit"]) && is_numeric($_GET["limit"])) {
    $limit = max(1, min(50, (int)$_GET["limit"])); // 1~50 사이로 제한
}

try {
    $sql = "
        SELECT 
            ui.user_name,
            u.table_name,
            u.record_id,
            u.action_type,
            u.created_time
        FROM user_activity_log u
        JOIN user_info ui ON u.user_id = ui.user_id
        ORDER BY u.created_time DESC
        LIMIT ?
    ";

    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("i", $limit);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            "userName"    => $row["user_name"],
            "table"       => $row["table_name"],
            "recordId"    => (int)$row["record_id"],
            "actionType"  => $row["action_type"],   // 
            "createdTime" => $row["created_time"]   // 프론트에서 "30분 전"으로 변환
        ];
    }

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
