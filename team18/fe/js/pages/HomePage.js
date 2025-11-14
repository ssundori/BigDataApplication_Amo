// 홈 화면을 렌더링하는 함수 (main.js에서 호출)
export function render() {
    return `
        <div class="page-header">
            <h1 style="color: var(--color-primary);">Dashboard</h1>
            <button class="btn btn-primary" onclick="window.location.href='login.php'">
                <i class="fas fa-sign-in-alt"></i> Login/Sign In
            </button>
        </div>

        <div class="user-info-section" style="
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: var(--spacing-lg);
            margin-top: var(--spacing-lg);
        ">
            <!-- 1. 사용자 활동 정보 카드 -->
            <div class="card user-activity-card" style="grid-column: 1 / span 2;">
                <h2>User Activity</h2>
                <p>Welcome back, User A (ID: 18)!</p>
                
                <div style="display: flex; gap: var(--spacing-lg); margin-top: var(--spacing-md);">
                    <!-- Roll-up 메뉴 버튼 시안 반영 -->
                    <button class="btn btn-nav" style="background-color: var(--color-primary); color: var(--color-text-light); text-align: center; padding: 10px 15px;">
                        Roll-up
                    </button>
                    <!-- Aggression 메뉴 버튼 시안 반영 -->
                    <button class="btn btn-nav" style="background-color: var(--color-primary); color: var(--color-text-light); text-align: center; padding: 10px 15px;">
                        Aggression
                    </button>
                </div>
            </div>

            <!-- 2. 요약 통계 카드 컨테이너 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); grid-column: 1 / -1;">
                ${renderSummaryCard("Total Disaster", "1,200", "fas fa-bolt", "#DC3545")}
                ${renderSummaryCard("Total Deaths", "19,476", "fas fa-skull-crossbones", "#FFC107")}
                ${renderSummaryCard("Total Affected", "1,200K", "fas fa-users", "#17A2B8")}
                ${renderSummaryCard("Total Lives", "519", "fas fa-heartbeat", "#8BC34A")}
            </div>
        </div>
    `;
}

/**
 * 요약 정보를 표시하는 작은 카드 컴포넌트를 렌더링합니다.
 */
function renderSummaryCard(title, value, iconClass, color) {
    return `
        <div class="card summary-card" style="border-left: 5px solid ${color};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="font-size: 0.9rem; color: #6C757D;">${title}</p>
                    <h3 style="font-size: 1.8rem; margin-top: 5px; color: ${color};">${value}</h3>
                </div>
                <i class="${iconClass}" style="font-size: 2rem; color: #E9ECEF;"></i>
            </div>
        </div>
    `;
}