<?php
// 세션이 없으면 시작
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 세션에 로그인 정보 없는 경우
if (!isset($_SESSION["user_id"])) {
 echo "
        <script>
            alert('로그인 후 이용해주세요.');
            window.location.href = '/team18/login.php';
        </script>
    ";
    exit;
}


