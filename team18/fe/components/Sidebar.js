// Sidebar 컴포넌트
export function renderSidebar() {
    const navItems = [
        { name: "Dash Board", icon: "fas fa-tachometer-alt", url: "index.php" },
        { name: "Aggregation", icon: "fas fa-layer-group", url: "aggregation.php" },
        { name: "Roll-up", icon: "fas fa-arrow-up", url: "rollup.php" },
        { name: "Ranking", icon: "fas fa-trophy", url: "ranking.php" },
        { name: "Windowing", icon: "fas fa-chart-line", url: "windowing.php" },
        { name: "Data Manage", icon: "fas fa-database", url: "datamanage.php" }
    ];

    const isHomeActive = window.location.pathname.includes('index.php') || window.location.pathname.endsWith('/');

    const menuHtml = navItems.map(item => {
        let isActive = window.location.pathname.includes(item.url);
        if (item.name === "Dash Board" && (isHomeActive && !window.location.pathname.includes('login.php'))) {
            isActive = true;
        }

        return `
            <a href="${item.url}" class="sidebar-nav-item ${isActive ? 'active' : ''}">
                <i class="${item.icon}"></i>
                <span>${item.name}</span>
            </a>
        `;
    }).join('');

    return `
        <div class="sidebar-header">
            <h3 style="color: var(--color-text-light);">AMO Data DashBoard</h3>
        </div>

        <div class="sidebar-login-section">
            <a href="/team18/login.php" class="sidebar-login-link">
                <i class="fas fa-sign-in-alt"></i> Login/Sign In 
                <span id="user-info-display" style="margin-left: 8px;"></span>
            </a>
             <button class="sidebar-toggle-btn" id="sidebar-toggle" title="사이드바 접기">
                <i class="fas fa-chevron-left"></i>
            </button>
        </div>
        
        <nav class="sidebar-nav">
            ${menuHtml}
        </nav>
        
    `;
}

export function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar-container');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('app-root'); 

    if (toggleBtn && sidebar && mainContent) {
        if (window.innerWidth < 768 && !sidebar.classList.contains('collapsed')) {
             sidebar.classList.add('collapsed');
             toggleBtn.querySelector('i').className = 'fas fa-chevron-right';
        }

        toggleBtn.addEventListener('click', () => {
            const isCollapsed = sidebar.classList.toggle('collapsed');

            toggleBtn.querySelector('i').className = isCollapsed 
                ? 'fas fa-chevron-right' 
                : 'fas fa-chevron-left'; 
        });
    }
}
