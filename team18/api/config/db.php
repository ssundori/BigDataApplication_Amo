<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$host = "127.0.0.1";
$port = 3306;   #실행 시 포트 번호 변경
$user = "team18"; #실행시 team18 로 변경
$pass = "team18";     #실행 시 team18로 변경
$dbname = "team18";

try {
    $mysqli = new mysqli($host, $user, $pass, $dbname, $port);
    $mysqli->set_charset("utf8mb4");
    // echo "DB connection OK!";
} catch (mysqli_sql_exception $e) {
    echo "DB ERROR: " . $e->getMessage();
}
?>




