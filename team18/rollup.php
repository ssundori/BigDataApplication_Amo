<?php
// rollup.php : Roll-up 화면용 엔트리 페이지
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BigData Application - Roll-up</title>

    <!-- 팀원이 쓰는 FE용 CSS -->
    <link rel="stylesheet" href="./fe/css/style.css">
    <link rel="stylesheet" href="./fe/css/sidebar.css">

    <!-- 아이콘 폰트 -->
    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body>
    <!-- 사이드바 들어갈 자리 -->
    <aside id="sidebar-container" class="sidebar"></aside>

    <!-- 실제 페이지 내용 들어갈 자리 -->
    <main id="app-root" class="main-content"></main>

    <!-- 공통 JS (라우팅 포함) -->
    <script type="module" src="./fe/js/main.js"></script>
</body>
</html>
