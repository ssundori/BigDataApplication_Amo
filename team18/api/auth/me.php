<?php
session_start();

// 로그인 안 되어 있음
if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "loggedIn" => false,
        "message" => "Not logged in."
    ]);
    exit;
}

// 로그인됨 → 세션 정보 반환
echo json_encode([
    "success" => true,
    "loggedIn" => true,
    "user" => [
        "user_id" => $_SESSION["user_id"],
        "user_login_id" => $_SESSION["user_login_id"],
        "user_name" => $_SESSION["user_name"]
    ]
]);
?>
