<?php
// 세션이 없으면 시작
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 세션에 로그인 정보 없는 경우
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Login required."
    ]);
    exit;
}
?>
