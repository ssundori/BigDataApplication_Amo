// fe/js/main.js

import {
    render as renderHomePage,
    loadData as loadHomeData
} from './pages/HomePage.js';

import { render as renderRankingPage } from './pages/RankingPage.js';
import { render as renderWindowingPage } from './pages/WindowingPage.js';
import { render as renderAggregationPage } from './pages/AggregationPage.js';
import { render as renderRollupPage } from './pages/RollupPage.js';
import { render as renderDataManagePage } from './pages/DataManagePage.js';
import { render as renderDataManageAddPage } from './pages/DataManageAddPage.js';

// ✅ 방금 만든 auth 모듈
import { initAuthUI } from './auth.js';

import {
    renderSidebar,
    setupSidebarToggle
} from '../components/Sidebar.js';

/** 사이드바 껍데기 렌더 */
function renderPageShell() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = renderSidebar();
        setupSidebarToggle();
    }
}

/** URL 경로에 따라 각 페이지 렌더 */
async function route() {
    const root = document.getElementById('app-root');
    if (!root) return;

    const path = window.location.pathname;
    let content = '';
    let pageType = '';

    // 홈
    if (path.includes('index.php') || path.endsWith('/team18/') || path.endsWith('/team18')) {
        content = renderHomePage();
        pageType = 'home';

        // Aggregation
    } else if (path.includes('aggregation.php')) {
        content = renderAggregationPage();

        // Roll-up
    } else if (path.includes('rollup.php')) {
        content = renderRollupPage();

        // Ranking
    } else if (path.includes('ranking.php')) {
        content = renderRankingPage();

        // Windowing
    } else if (path.includes('windowing.php')) {
        content = renderWindowingPage();

        // Data Manage 리스트
    } else if (path.includes('datamanage.php')) {
        content = renderDataManagePage();

        // Data Manage 추가 폼
    } else if (path.includes('datamanageadd.php')) {
        content = renderDataManageAddPage();

        // 그 외
    } else {
        content = '<h1>404 Not Found</h1>';
    }

    if (content !== '') {
        root.innerHTML = content;

        // 홈 대시보드 데이터 로딩
        if (pageType === 'home') {
            await loadHomeData();
        }

        // ✅ 페이지 렌더 후 로그인/로그아웃 UI 갱신
        await initAuthUI();
    }
}

/** 뒤로가기/앞으로가기 시에도 라우팅 */
window.addEventListener('popstate', route);

/** 초기 진입 시 */
document.addEventListener('DOMContentLoaded', () => {
    renderPageShell();
    route();
});
