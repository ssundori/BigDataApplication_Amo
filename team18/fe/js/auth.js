// fe/js/auth.js
import { fetchData } from '../utils/api.js';

/**
 * 모든 페이지 공통 로그인 UI 초기화
 * - .js-auth-area 요소를 찾아서 auth/me.php 결과에 따라
 *   Login 버튼 또는 닉네임 + Logout 버튼을 렌더링
 */
export async function initAuthUI() {
    const containers = document.querySelectorAll('.js-auth-area');
    if (!containers.length) return;   // 이 페이지에 auth 영역이 없으면 패스

    let res = null;

    try {
        // ✅ 기존 구조를 고려해서 /team18/api/auth/me.php 로 호출
        res = await fetchData('auth/me.php');
        console.log('me.php response:', res);
    } catch (e) {
        console.error('auth/me.php 호출 실패', e);
    }

    const loggedIn = !!(res && res.loggedIn);
    const userName =
        (res && res.user && (res.user.user_name || res.user.user_login_id)) ||
        '';

    containers.forEach((container) => {
        if (loggedIn) {
            // 🔐 로그인 상태 → 닉네임 + Logout
            container.innerHTML = `
                <div class="header-auth-inner"
                     style="display:flex; align-items:center; gap:10px;">
                    <span class="user-name"
                          style="font-weight:bold; color:var(--color-primary);">
                        <i class="fas fa-user-circle" style="margin-right:4px;"></i>
                        ${userName}
                    </span>
                    <button type="button"
                            class="btn btn-primary btn-auth-logout"
                            style="background:none; color:var(--color-primary);
                                   font-weight:bold; padding:0;">
                        Logout
                    </button>
                </div>
            `;
        } else {
            // 🚪 비로그인 상태 → Login 버튼
            container.innerHTML = `
                <button type="button"
                        class="btn btn-primary btn-auth-login"
                        style="background:none; color:var(--color-primary);
                               font-size:1.1rem; font-weight:bold; padding:0;">
                    <i class="fas fa-user-circle" style="margin-right:4px;"></i>
                    Login
                </button>
            `;
        }
    });

    // Login 클릭 → 로그인 페이지로 이동
    document.querySelectorAll('.btn-auth-login').forEach((btn) => {
        btn.addEventListener('click', () => {
            // ⚠️ 실제 로그인 페이지 경로에 맞게 수정 가능
            // 예: '/team18/login.php' 나 '/team18/api/auth/login.php'
            window.location.href = '/team18/login.php';
        });
    });

    // Logout 클릭 → /api/auth/logout.php 호출 후 리다이렉트
    document.querySelectorAll('.btn-auth-logout').forEach((btn) => {
        btn.addEventListener('click', async () => {
            try {
                await fetchData('auth/logout.php');
            } catch (e) {
                console.error('auth/logout.php 호출 실패(무시 가능)', e);
            }
            // 로그아웃 하면 로그인 화면으로 이동
            window.location.href = '/team18/login.php';
        });
    });
}
