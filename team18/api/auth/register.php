<?php
// team18/api/auth/register.php

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/../config/db.php";  // db.php에서 $mysqli 가져오기

// 1) HTTP 메서드 체크 (POST만 허용)
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success"   => false,
        "errorCode" => "METHOD_NOT_ALLOWED",
        "message"   => "Only POST method is allowed."
    ]);
    exit;
}

// 2) JSON Body 파싱
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

// JSON 파싱 실패 방어
if (!is_array($data)) {
    echo json_encode([
        "success"   => false,
        "errorCode" => "INVALID_JSON",
        "message"   => "Invalid JSON body."
    ]);
    exit;
}

// 3) 필드 추출 & trim
$user_login_id   = isset($data["user_login_id"]) ? trim($data["user_login_id"]) : "";
$user_name       = isset($data["user_name"])     ? trim($data["user_name"])     : "";
$password        = isset($data["password"])      ? $data["password"]            : "";
$passwordConfirm = isset($data["passwordConfirm"]) ? $data["passwordConfirm"]   : "";

// 4) 필드 누락/빈 값 확인
if ($user_login_id === "" || $user_name === "" || $password === "" || $passwordConfirm === "") {
    echo json_encode([
        "success"   => false,
        "errorCode" => "VALIDATION_ERROR",
        "message"   => "All fields are required."
    ]);
    exit;
}

// 5) 비밀번호 불일치
if ($password !== $passwordConfirm) {
    echo json_encode([
        "success"   => false,
        "errorCode" => "PASSWORD_NOT_MATCH",
        "message"   => "Password and confirmation do not match."
    ]);
    exit;
}

// 6) ID 중복 체크 (user_login_id UNIQUE)
$checkSql = "SELECT user_id FROM user_info WHERE user_login_id = ?";
$stmt = $mysqli->prepare($checkSql);

if (!$stmt) {
    echo json_encode([
        "success"   => false,
        "errorCode" => "DB_PREPARE_ERROR",
        "message"   => "Failed to prepare statement."
    ]);
    exit;
}

$stmt->bind_param("s", $user_login_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    // 이미 같은 ID 존재
    $stmt->close();
    echo json_encode([
        "success"   => false,
        "errorCode" => "LOGIN_ID_DUPLICATED",
        "message"   => "This ID is already in use."
    ]);
    exit;
}
$stmt->close();

// 7) 비밀번호 해시 생성 (user_info.password 컬럼에 저장)
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// 8) INSERT 쿼리
$insertSql = "
    INSERT INTO user_info (user_login_id, user_name, password)
    VALUES (?, ?, ?)
";
$stmt = $mysqli->prepare($insertSql);

if (!$stmt) {
    echo json_encode([
        "success"   => false,
        "errorCode" => "DB_PREPARE_ERROR",
        "message"   => "Failed to prepare insert statement."
    ]);
    exit;
}

$stmt->bind_param("sss", $user_login_id, $user_name, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Registered successfully."
    ]);
} else {
    // 예상치 못한 DB 에러 (예: UNIQUE 제약 위반 등)
    echo json_encode([
        "success"   => false,
        "errorCode" => "DB_INSERT_ERROR",
        "message"   => "Failed to register user."
    ]);
}

$stmt->close();
