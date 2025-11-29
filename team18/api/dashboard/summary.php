<?php
// summary.php
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

try {
    // Total Disaster
    $res1 = $mysqli->query("SELECT COUNT(*) AS cnt FROM disasters");
    $row1 = $res1->fetch_assoc();
    $totalDisaster = (int)$row1["cnt"];

    // Total User Insert
    $res2 = $mysqli->query("SELECT COUNT(*) AS cnt FROM user_activity_log");
    $row2 = $res2->fetch_assoc();
    $totalUserInsert = (int)$row2["cnt"];

    // Total User
    $res3 = $mysqli->query("SELECT COUNT(*) AS cnt FROM user_info");
    $row3 = $res3->fetch_assoc();
    $totalUser = (int)$row3["cnt"];

    echo json_encode([
        "success" => true,
        "totals" => [
            "disaster"   => $totalDisaster,
            "userInsert" => $totalUserInsert,
            "user"       => $totalUser
        ]
    ]);

} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "errorCode" => "DB_QUERY_ERROR",
        "message" => $e->getMessage()
    ]);
}
