<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Register | AMO</title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="register-page">

  <!-- 오른쪽 위 AMO 로고 -->
  <div class="register-logo">AMO</div>

  <!-- 가운데 카드 -->
  <div class="register-wrapper">
    <div class="auth-card">
      <h2>Register</h2>

      <form id="registerForm">
        <!-- Name -->
        <div class="form-group">
          <label for="regName">Name</label>
          <input type="text" id="regName" name="user_name" required>
        </div>

        <!-- ID -->
        <div class="form-group">
          <label for="regId">ID</label>
          <input type="text" id="regId" name="user_login_id" required>
        </div>

        <!-- PassWord -->
        <div class="form-group">
          <label for="regPw1">PassWord</label>
          <input type="password" id="regPw1" required>
        </div>

        <!-- Type PassWord One More Time -->
        <div class="form-group">
          <label for="regPw2">Type PassWord One More Time</label>
          <input type="password" id="regPw2" required>
        </div>

        <!-- 버튼 텍스트: Sign In (피그마 그대로) -->
        <button type="submit" class="btn primary-btn">Sign In</button>

        <p id="regError" class="error-msg"></p>
      </form>
    </div>
  </div>

  <script src="assets/js/main.js"></script>
  <script>
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
      registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('regName').value.trim();
        const id   = document.getElementById('regId').value.trim();
        const pw1  = document.getElementById('regPw1').value;
        const pw2  = document.getElementById('regPw2').value;
        const err  = document.getElementById('regError');

        err.textContent = '';

        // 프론트 단 유효성 체크
        if (!name || !id || !pw1 || !pw2) {
          err.textContent = "모든 항목을 입력하세요.";
          return;
        }
        if (pw1 !== pw2) {
          err.textContent = "비밀번호가 일치하지 않습니다.";
          return;
        }

        try {
          // 백엔드 회원가입 API 호출
          const res = await fetch('api/auth/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_login_id: id,
              user_name: name,
              password: pw1,
              passwordConfirm: pw2
            })
          });

          const data = await res.json();

          if (!data.success) {
            // 명세서에 있는 message 그대로 보여주기
            err.textContent = data.message || '회원가입에 실패했습니다.';
            return;
          }

          // 성공 시 알림 후 로그인 페이지로 이동
          alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
          window.location.href = 'login.php';

        } catch (error) {
          console.error(error);
          err.textContent = '서버 통신 중 오류가 발생했습니다.';
        }
      });
    }
  </script>

</body>
</html>
