// fe/js/pages/DataManagePage.js

// -----------------------------
//  데모용 데이터 (1~10개 정도)
//  author 는 권한 체크용으로만 사용
// -----------------------------
const MOCK_DATA = [
    { id: 10, name: 'AMO', author: 'amo', deaths: 120, affected: 50000, damage: 3000 },
    { id: 9, name: 'AMO', author: 'amo', deaths: 90, affected: 21000, damage: 1200 },
    { id: 8, name: 'OMA', author: 'oma', deaths: 30, affected: 9000, damage: 500 },
    { id: 7, name: 'MOA', author: 'moa', deaths: 45, affected: 15000, damage: 700 },
    { id: 6, name: 'AMO', author: 'amo', deaths: 60, affected: 20000, damage: 1000 },
    { id: 5, name: 'OMA', author: 'oma', deaths: 10, affected: 3000, damage: 150 },
    { id: 4, name: 'MOA', author: 'moa', deaths: 22, affected: 7000, damage: 260 },
    { id: 3, name: 'AMO', author: 'amo', deaths: 77, affected: 18000, damage: 980 },
    { id: 2, name: 'OMA', author: 'oma', deaths: 13, affected: 5000, damage: 300 },
    { id: 1, name: 'MOA', author: 'moa', deaths: 8, affected: 2500, damage: 120 }
];

// 한 페이지에 몇 개씩 보여줄지
const PAGE_SIZE = 5;
let currentPage = 1;

// -----------------------------
//  공통 유틸
// -----------------------------

/** 세션스토리지에 저장된 로그인 유저 정보 가져오기 */
function getLoggedInUser() {
    try {
        const stored = sessionStorage.getItem('amoUser');
        if (!stored) return null;
        return JSON.parse(stored);
    } catch (e) {
        console.error('getLoggedInUser error', e);
        return null;
    }
}

/** 현재 페이지에 보여줄 데이터 슬라이스 */
function getPagedData() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return MOCK_DATA.slice(start, end);
}

// -----------------------------
//  테이블 렌더링
// -----------------------------
function renderTable() {
    const tbody = document.getElementById('dm-table-body');
    const paginationEl = document.getElementById('dm-pagination');
    const summaryEl = document.getElementById('dm-summary');

    if (!tbody) return;

    const user = getLoggedInUser();
    const loginId = user?.user_login_id?.toLowerCase() || null;

    tbody.innerHTML = '';

    const pageData = getPagedData();

    pageData.forEach(row => {
        const isOwner = loginId && row.author.toLowerCase() === loginId;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="width:120px;">${row.id}</td>
            <td style="width:200px;">${row.name}</td>
            <td style="width:300px; text-align:left;">
                <button class="btn btn-xs dm-show-btn" data-id="${row.id}">
                    <i class="fas fa-eye"></i> Show
                </button>
                <button class="btn btn-xs dm-edit-btn ${!isOwner ? 'dm-btn-disabled' : ''}"
                        data-id="${row.id}" ${!isOwner ? 'disabled' : ''}>
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-xs dm-delete-btn ${!isOwner ? 'dm-btn-disabled' : ''}"
                        data-id="${row.id}" ${!isOwner ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // 페이지네이션 렌더링
    const totalItems = MOCK_DATA.length;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);

    if (paginationEl) {
        let html = `<span style="margin-right:8px; font-weight:600;">Page</span>`;
        for (let p = 1; p <= totalPages; p++) {
            html += `
                <button 
                    class="page-btn ${p === currentPage ? 'active' : ''}" 
                    data-page="${p}">
                    ${p}
                </button>
            `;
        }
        paginationEl.innerHTML = html;
    }

    // "Showing 1–5 of 10" 요약 표시
    if (summaryEl) {
        const start = (currentPage - 1) * PAGE_SIZE + 1;
        const end = Math.min(currentPage * PAGE_SIZE, totalItems);
        summaryEl.textContent = `Showing ${start}–${end} of ${totalItems}`;
    }

    bindRowEvents();
    bindPaginationEvents();
}

// -----------------------------
//  Row 버튼 이벤트 (Show / Edit / Delete)
// -----------------------------
function bindRowEvents() {
    const user = getLoggedInUser();
    const loginId = user?.user_login_id?.toLowerCase() || null;

    // Show
    document.querySelectorAll('.dm-show-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-id'));
            const row = MOCK_DATA.find(r => r.id === id);
            if (!row) return;

            alert(
                `Num: ${row.id}\n` +
                `Name: ${row.name}\n` +
                `Author: ${row.author.toUpperCase()}\n` +
                `Total Deaths: ${row.deaths}\n` +
                `Total Affected: ${row.affected}\n` +
                `Total Damage (1000 USD): ${row.damage}`
            );
        });
    });

    // Edit
    document.querySelectorAll('.dm-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-id'));
            const row = MOCK_DATA.find(r => r.id === id);
            if (!row) return;

            const isOwner = loginId && row.author.toLowerCase() === loginId;
            if (!isOwner) return; // 방어로직

            alert(`(데모) Num ${row.id} 데이터를 편집하는 폼으로 연결될 예정입니다.`);
        });
    });

    // Delete
    document.querySelectorAll('.dm-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-id'));
            const rowIndex = MOCK_DATA.findIndex(r => r.id === id);
            if (rowIndex === -1) return;

            const row = MOCK_DATA[rowIndex];
            const isOwner = loginId && row.author.toLowerCase() === loginId;
            if (!isOwner) return;

            const ok = confirm(`정말로 Num ${row.id} (${row.name}) 데이터를 삭제하시겠습니까?`);
            if (!ok) return;

            // 데모: 실제 DB 삭제 대신 배열에서만 제거
            MOCK_DATA.splice(rowIndex, 1);

            // 현재 페이지에 데이터가 없어지면 한 페이지 앞으로
            const maxPage = Math.max(1, Math.ceil(MOCK_DATA.length / PAGE_SIZE));
            if (currentPage > maxPage) currentPage = maxPage;

            renderTable();
        });
    });
}

// -----------------------------
//  페이지 번호 버튼 이벤트
// -----------------------------
function bindPaginationEvents() {
    const paginationEl = document.getElementById('dm-pagination');
    if (!paginationEl) return;

    paginationEl.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = Number(btn.getAttribute('data-page'));
            if (!Number.isNaN(page)) {
                currentPage = page;
                renderTable();
            }
        });
    });
}

// -----------------------------
//  상단 ADD NEW / Search / Results 이벤트
// -----------------------------
function setupHeaderEvents() {
    // ADD NEW → 추가 폼 페이지로 이동
    const addBtn = document.getElementById('dm-add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.location.href = 'datamanageadd.php';
        });
    }

    // Search 버튼 (데모)
    const searchBtn = document.getElementById('dm-search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            alert('데모: 검색 기능은 추후 백엔드와 연동될 예정입니다.');
        });
    }

    // Results 셀렉트 (데모)
    const resultSelect = document.getElementById('dm-result-size');
    if (resultSelect) {
        resultSelect.addEventListener('change', () => {
            alert('데모: Results 개수 변경은 현재 고정(5)입니다. 실제 구현 시 PAGE_SIZE를 이 값에 맞춰 조절하면 됩니다.');
        });
    }
}

// -----------------------------
//  페이지 진입 시 초기화
// -----------------------------
function initDataManagePage() {
    const tableEl = document.getElementById('dm-table-body');
    if (!tableEl) return; // 다른 페이지에서 import 되었을 때 방어

    setupHeaderEvents();
    renderTable();
}

// -----------------------------
//  렌더 함수 (HTML 틀)
// -----------------------------
export function render() {
    const html = `
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--spacing-lg); padding-bottom:8px; border-bottom:1px solid #ddd;">
            <h1 style="color:var(--color-primary);">
                <i class="fas fa-database" style="margin-right:10px;"></i>
                Data Manage Page
            </h1>
            <!-- ✅ 공통 로그인/닉네임/로그아웃 영역 -->
            <div class="js-auth-area"></div>
            </div>
        </div>

        <div class="card" style="margin-bottom:var(--spacing-lg);">
            <!-- 상단 컨트롤 영역 -->
            <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:16px;">
                <!-- ADD NEW -->
                <button id="dm-add-btn" class="btn btn-nav" style="min-width:150px; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <i class="fas fa-plus-circle"></i> ADD NEW
                </button>

                <!-- Search 영역 -->
                <div style="display:flex; align-items:center; gap:8px; flex:1;">
                    <button id="dm-search-btn" class="btn btn-secondary" style="display:flex; align-items:center; gap:6px;">
                        <i class="fas fa-chevron-right"></i> Search
                    </button>
                    <div style="position:relative; flex:1;">
                        <input id="dm-search-input" type="text" placeholder="Search by name..."
                               style="width:100%; padding:8px 36px 8px 10px; border:1px solid #ced4da; border-radius:4px;">
                        <i class="fas fa-search" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#6c757d;"></i>
                    </div>
                </div>

                <!-- Results 셀렉트 -->
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-weight:600;">Results</span>
                    <select id="dm-result-size" style="padding:6px 30px 6px 10px; border-radius:4px; border:1px solid #ced4da;">
                        <option value="5" selected>5</option>
                        <option value="10">10</option>
                    </select>
                </div>
            </div>

            <!-- 데이터 테이블 -->
            <table class="data-table" style="width:100%; border-collapse:collapse; margin-top:8px;">
                <thead>
                    <tr>
                        <th style="width:120px; text-align:left;">Num</th>
                        <th style="width:200px; text-align:left;">Name</th>
                        <th style="width:300px; text-align:left;">Action</th>
                    </tr>
                </thead>
                <tbody id="dm-table-body">
                    <!-- JS에서 렌더링 -->
                </tbody>
            </table>

            <!-- 페이지네이션 + 요약 -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
                <div id="dm-pagination" class="pagination" style="display:flex; align-items:center; gap:6px;">
                    <!-- JS에서 페이지 버튼 렌더링 -->
                </div>
                <div id="dm-summary" style="font-size:0.9rem; color:#495057;">
                    <!-- JS에서 "Showing 1–5 of 10" 렌더링 -->
                </div>
            </div>

            <p style="margin-top:8px; font-size:0.8rem; color:#6c757d;">(현재 데모 데이터가 표시되고 있습니다.)</p>
        </div>
    `;

    // DOM에 붙은 다음 초기화
    setTimeout(() => {
        initDataManagePage();
    }, 0);

    return html;
}

// 다른 페이지들과 인터페이스 맞추기용
export async function loadData() {
    return;
}

