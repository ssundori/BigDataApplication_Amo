<?php
// login.php
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Login | AMO</title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>

<body>

<div class="auth-page-wrapper">

  <!-- 상단 AMO 로고 -->
  <div class="auth-logo">AMO</div>

  <!-- 로그인 카드 -->
  <div class="auth-card">
    <h2>Login</h2>

    <form id="loginForm">
      <input type="text" id="loginId" class="auth-input" placeholder="ID">
      <input type="password" id="loginPw" class="auth-input" placeholder="PassWord">

      <button type="submit" class="auth-btn">Login</button>

      <div class="auth-links">
        <a href="register.php">Sign In</a>
        <a href="#">forget password</a>
      </div>

      <p id="loginError" class="error-msg"></p>
    </form>
  </div>

</div>

<script src="assets/js/main.js"></script>

<script>
  const loginForm  = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    loginError.textContent = '';

    const loginId  = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPw').value;

    if (!loginId || !password) {
      loginError.textContent = 'ID와 비밀번호를 모두 입력해주세요.';
      return;
    }

    try {
      const res = await fetch('http://localhost/team18/api/auth/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_login_id: loginId,
          password: password
        })
      });

      const data = await res.json();

      if (!data.success) {
        let msg = data.message || '로그인에 실패했습니다.';
        if (data.errorCode === 'VALIDATION_ERROR') {
          msg = 'ID와 비밀번호를 모두 입력해주세요.';
        } else if (data.errorCode === 'INVALID_CREDENTIALS') {
          msg = 'ID 또는 비밀번호가 올바르지 않습니다.';
        }
        loginError.textContent = msg;
        return;
      }

      // 로그인 성공 → 사용자 정보 저장
      if (typeof setLoggedInUser === 'function') {
        setLoggedInUser(data.user);
      } else {
        sessionStorage.setItem('amoUser', JSON.stringify(data.user));
      }

      alert('로그인 되었습니다.');
      window.location.href = 'index.php';

    } catch (err) {
      console.error(err);
      loginError.textContent = '서버 통신 중 오류가 발생했습니다.';
    }
  });
</script>

</body>
</html>
