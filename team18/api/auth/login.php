<?php
session_start();
require_once "../config/db.php";  // DB 연결

// RAW JSON 읽기
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

// 1) 필드 검증
if (
    !isset($data["user_login_id"]) || trim($data["user_login_id"]) === "" ||
    !isset($data["password"]) || trim($data["password"]) === ""
) {
    echo json_encode([
        "success" => false,
        "errorCode" => "VALIDATION_ERROR",
        "message" => "ID and Password are required."
    ]);
    exit;
}

$user_login_id = $mysqli->real_escape_string($data["user_login_id"]);
$password = $data["password"];

// 2) 사용자 조회
$sql = "SELECT user_id, user_login_id, user_name, password FROM user_info WHERE user_login_id = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("s", $user_login_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "errorCode" => "INVALID_CREDENTIALS",
        "message" => "ID or password is incorrect."
    ]);
    exit;
}

$user = $result->fetch_assoc();

// 3) 비밀번호 검증 (password_verify)
if (!password_verify($password, $user["password"])) {
    echo json_encode([
        "success" => false,
        "errorCode" => "INVALID_CREDENTIALS",
        "message" => "ID or password is incorrect."
    ]);
    exit;
}

// 4) 로그인 성공 → 세션 생성
$_SESSION["user_id"] = $user["user_id"];
$_SESSION["user_login_id"] = $user["user_login_id"];
$_SESSION["user_name"] = $user["user_name"];

echo json_encode([
    "success" => true,
    "user" => [
        "user_id" => $user["user_id"],
        "user_login_id" => $user["user_login_id"],
        "user_name" => $user["user_name"]
    ]
]);
?>
