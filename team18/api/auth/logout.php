<?php
session_start();

// 세션 전부 삭제
session_unset();    // 세션 변수 제거
session_destroy();  // 세션 자체 파괴

echo json_encode([
    "success" => true,
    "message" => "Logged out."
]);
?>
