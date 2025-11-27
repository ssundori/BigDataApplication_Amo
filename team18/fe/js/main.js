// main.js

import { render as renderHomePage, loadData as loadHomeData } from './pages/HomePage.js'; // loadData import 추가
import { render as renderRankingPage } from './pages/RankingPage.js';
import { render as renderWindowingPage } from './pages/WindowingPage.js';
import { render as renderAggregationPage } from './pages/AggregationPage.js';
import { render as renderRollupPage } from './pages/RollupPage.js';
import { render as renderDataManagePage } from './pages/DataManagePage.js';
import { renderSidebar, setupSidebarToggle } from '../components/Sidebar.js';

function renderPageShell() {
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (sidebarContainer) {
        sidebarContainer.innerHTML = renderSidebar();
        setupSidebarToggle();
    }
}

async function route() {
    const root = document.getElementById('app-root');
    if (!root) return; 

    const path = window.location.pathname;
    let content = '';
    let pageType = ''; // 현재 어떤 페이지인지 구분

    if (path.includes('index.php') || path.endsWith('/team18/') || path.endsWith('/team18')) {
        content = renderHomePage();
        pageType = 'home';
    } else if (path.includes('ranking.php')) {
        content = renderRankingPage();
        pageType = 'ranking'; // RankingPage 내부에서 populateFilters를 호출하므로 별도 처리 없어도 됨
    } else if (path.includes('windowing.php')) {
        content = renderWindowingPage();
    } else if (path.includes('aggregation')) {   // aggregation.php, aggregation.html 다 잡음
        content = renderAggregationPage();
    } else if (path.includes('rollup')) {
        content = renderRollupPage();
    } else if (path.includes('datamanage')) {      // datamanage.php
        content = renderDataManagePage();
    // 그 외 → 404
    } else {
        content = `<h1>404 Not Found</h1>`;
    }

    if (content !== '') {
        root.innerHTML = content;
        
        if (pageType === 'home') {
            await loadHomeData();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderPageShell(); 
    route();
});
