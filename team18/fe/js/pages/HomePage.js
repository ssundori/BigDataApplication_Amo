// fe/js/pages/HomePage.js
import { fetchData } from '../../utils/api.js';

function renderTopNavButtons() {
    const navItems = [
        { name: 'Aggregation', file: 'aggregation.php' },
        { name: 'Roll-Up', file: 'rollup.php' },
        { name: 'Ranking', file: 'ranking.php' },
        { name: 'Windowing', file: 'windowing.php' }
    ];

    return navItems
        .map(
            (item) => `
        <button
            class="btn btn-nav"
            onclick="window.location.href='${item.file}'"
            style="text-align:center;"
        >
            ${item.name}
        </button>
    `
        )
        .join('');
}

// (옵션) 안 쓰고 있지만, 나중에 재사용할 수 있으니 남겨둠
function renderSummaryCard(title, value, iconClass, color) {
    return `
        <div class="card summary-card" style="
            border-left: 5px solid ${color};
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:var(--spacing-md) var(--spacing-lg);
        ">
            <div>
                <p style="font-size:0.9rem; color:#6C757D; margin-bottom:5px;">${title}</p>
                <h3 style="font-size:1.8rem; color:${color};">${value}</h3>
            </div>
            <i class="${iconClass}" style="font-size:2.5rem; color:#E9ECEF; opacity:0.8;"></i>
        </div>
    `;
}

export function render() {
    return `
        <div class="page-header" style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:var(--spacing-lg);
            padding-bottom:var(--spacing-sm);
            border-bottom:1px solid #ddd;
        ">
            <h1 style="color:var(--color-primary);">Dashboard Home</h1>
            <!-- ✅ 로그인 / 닉네임 / 로그아웃이 들어갈 공통 영역 -->
            <div class="js-auth-area"></div>
        </div>

        <div class="top-nav-buttons" style="
            display:grid;
            grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));
            gap:var(--spacing-md);
            margin-bottom:var(--spacing-lg);
        ">
            ${renderTopNavButtons()}
        </div>

        <div class="dashboard-main-grid" style="
            display:grid;
            grid-template-columns:2fr 1fr;
            gap:var(--spacing-lg);
        ">
            <div class="card user-activity-card">
                <h2 style="margin-bottom:var(--spacing-md);">User Activity</h2>
                <div
                    id="activity-list"
                    style="margin-top:var(--spacing-md); color:#6C757D; font-size:0.95rem;"
                >
                    <p>Loading activities...</p>
                </div>
            </div>

            <div class="summary-cards-container" style="
                display:flex;
                flex-direction:column;
                gap:var(--spacing-md);
            ">
                <div id="summary-cards-area">
                    Loading summary...
                </div>
            </div>
        </div>
    `;
}

export async function loadData() {
    try {
        // (1) 요약 통계 가져오기 (dashboard/summary.php)
        const summaryRes = await fetchData('dashboard/summary.php');
        if (summaryRes.success) {
            renderSummaryCards(summaryRes.totals);
        }

        // (2) 유저 활동 가져오기 (dashboard/user_activity.php)
        const activityRes = await fetchData('dashboard/user_activity.php');
        if (activityRes.success) {
            renderActivityList(activityRes.data);
        }
    } catch (error) {
        console.error('Dashboard Load Error:', error);
    }
}

// (3) UI 업데이트 헬퍼 함수들
function renderSummaryCards(totals) {
    const container = document.getElementById('summary-cards-area');
    if (!container) return;

    const fmt = (num) => new Intl.NumberFormat().format(num);

    container.innerHTML = `
        ${makeCard('Total Disaster', fmt(totals.disaster), 'fas fa-bolt', '#DC3545')}
        ${makeCard('Total User Insert', fmt(totals.userInsert), 'fas fa-user-plus', '#FFC107')}
        ${makeCard('Total User', fmt(totals.user), 'fas fa-users', '#17A2B8')}
    `;
}

function makeCard(title, value, icon, color) {
    return `
        <div class="card summary-card" style="
            border-left:5px solid ${color};
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:var(--spacing-md) var(--spacing-lg);
            margin-bottom:10px;
        ">
            <div>
                <p style="font-size:0.9rem; color:#6C757D; margin-bottom:5px;">${title}</p>
                <h3 style="font-size:1.8rem; color:${color};">${value}</h3>
            </div>
            <i class="${icon}" style="font-size:2.5rem; color:#E9ECEF; opacity:0.8;"></i>
        </div>
    `;
}

function renderActivityList(activities) {
    const container = document.getElementById('activity-list');
    if (!container) return;

    if (!activities.length) {
        container.innerHTML = '<p>최근 활동이 없습니다.</p>';
        return;
    }

    container.innerHTML =
        activities
            .map(
                (item) => `
        <p style="margin-bottom:8px;">
            <i class="fas fa-history" style="margin-right:5px;"></i>
            <strong>${item.userName}</strong>님이 [${item.table}]에 레코드를 추가했습니다.
            <span style="font-size:0.8em; color:#aaa;">(${item.createdTime})</span>
        </p>
    `
            )
            .join('') +
        `<p style="text-align:right; margin-top:10px;">
            <a href="#" style="color:var(--color-primary);">View All &rarr;</a>
        </p>`;
}
