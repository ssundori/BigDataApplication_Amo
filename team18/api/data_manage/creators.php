<?php
// team18/api/data_manage/creators.php

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../config/auth_check.php";
require_once __DIR__ . "/../config/db.php";

try {
    // disasters 에 대한 user_insert + user_info 조인
    $sql = "
        SELECT 
            ui.user_login_id,
            ui.user_name,
            u.record_id AS disaster_id
        FROM user_insert u
        JOIN user_info ui ON ui.user_id = u.user_id
        WHERE u.table_name = 'disasters'
    ";

    $result = $mysqli->query($sql);
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $rows
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "error" => [
            "code" => 500,
            "message" => "Failed to load creators: " . $e->getMessage()
        ]
    ]);
}
