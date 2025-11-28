// fe/js/pages/DataManagePage.js
import { fetchData } from '../../utils/api.js';

const STATE = {
    allRows: [],          // 전체 disasters 데이터
    filteredRows: [],     // 검색/필터 적용된 데이터
    currentPage: 1,
    pageSize: 10,
    searchKeyword: '',
    countries: {},        // country_id -> country_name
    disasterTypes: {},    // disaster_type_id -> label
    currentUser: null
};

/** 로그인 유저 정보 (login.php에서 세션스토리지에 넣어둔 것 재사용) */
function loadCurrentUser() {
    try {
        const raw = sessionStorage.getItem('amoUser');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('loadCurrentUser error', e);
        return null;
    }
}

/** 국가/재해타입 정보 로딩 ------------------------------------ */
async function loadCountries() {
    const res = await fetchData('common/countries.php');
    if (!res?.success || !Array.isArray(res.data)) return;
    const map = {};
    res.data.forEach((c) => {
        map[c.id] = c.name;
    });
    STATE.countries = map;
}

async function loadDisasterTypes() {
    const res = await fetchData('common/disaster_types.php');
    if (!res?.success || !Array.isArray(res.data)) return;
    const map = {};
    res.data.forEach((t) => {
        // label: "Group / Type / Subtype" 형태로 만들기
        const parts = [];
        if (t.group) parts.push(t.group);
        if (t.type) parts.push(t.type);
        if (t.subtype) parts.push(t.subtype);
        map[t.id] = parts.join(' / ');
    });
    STATE.disasterTypes = map;
}

/** disasters 목록 로딩 ---------------------------------------- */
async function loadDisasters() {
    // 한 번에 많이 가져오도록 page_size 크게
    const res = await fetchData('data_manage/read.php', {
        table: 'disasters',
        page: 1,
        page_size: 2000,
        sort_by: 'disaster_id',
        sort_order: 'DESC'
    });

    if (!res || res.status !== 'success' || !Array.isArray(res.data)) {
        console.error('loadDisasters error:', res);
        return;
    }

    STATE.allRows = res.data;
    STATE.filteredRows = [...STATE.allRows];
}

/** 검색 + 페이지 적용 후 테이블 렌더 ------------------------- */
function applyFilterAndRender() {
    const keyword = STATE.searchKeyword.trim().toLowerCase();

    let rows = [...STATE.allRows];
    if (keyword) {
        rows = rows.filter((row) => {
            const idStr = String(row.disaster_id ?? '').toLowerCase();

            const countryName =
                STATE.countries[row.country_id] || '';

            const typeLabel =
                STATE.disasterTypes[row.disaster_type_id] || '';

            return (
                idStr.includes(keyword) ||
                countryName.toLowerCase().includes(keyword) ||
                typeLabel.toLowerCase().includes(keyword)
            );
        });
    }

    STATE.filteredRows = rows;
    STATE.currentPage = 1;
    renderTable();
    renderPagination();
}

/** 테이블 본문 렌더링 ---------------------------------------- */
function renderTable() {
    const tbody = document.getElementById('dm-list-tbody');
    if (!tbody) return;

    const { currentPage, pageSize, filteredRows } = STATE;

    if (!filteredRows.length) {
        tbody.innerHTML =
            '<tr><td colspan="3" style="text-align:center; padding:20px;">표시할 데이터가 없습니다.</td></tr>';
        const info = document.getElementById('dm-list-info');
        if (info) info.textContent = 'Showing 0 of 0';
        return;
    }

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, filteredRows.length);

    const pageRows = filteredRows.slice(startIdx, endIdx);

    const total = filteredRows.length;
    const infoText = `Showing ${startIdx + 1} - ${endIdx} of ${total}`;
    const infoEl = document.getElementById('dm-list-info');
    if (infoEl) infoEl.textContent = infoText;

    const currentLoginId = STATE.currentUser?.user_login_id || null;

    let html = '';

    pageRows.forEach((row, idx) => {
        const displayNum = row.disaster_id; // Num 열에 표시할 값

        const creatorName = row.creator_name || '-';
        const creatorLoginId = row.creator_login_id || null;

        // 본인 글일 때만 편집/삭제 허용
        const canEdit =
            !!currentLoginId &&
            !!creatorLoginId &&
            currentLoginId === creatorLoginId;

        html += `
            <tr data-id="${row.disaster_id}">
                <td class="dm-col-num">${displayNum}</td>
                <td class="dm-col-name">${creatorName}</td>
                <td class="dm-col-action" style="text-align:center;">
                    <button type="button" class="btn btn-sm btn-light dm-btn-show">
                        <i class="fas fa-eye"></i> Show
                    </button>
                    <button type="button" class="btn btn-sm dm-btn-edit" ${canEdit ? '' : 'disabled'
            }>
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button type="button" class="btn btn-sm dm-btn-delete" ${canEdit ? '' : 'disabled'
            }>
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    // 이벤트 바인딩
    tbody.querySelectorAll('.dm-btn-show').forEach((btn) => {
        btn.addEventListener('click', onClickShow);
    });

    tbody.querySelectorAll('.dm-btn-edit').forEach((btn) => {
        if (btn.disabled) return;
        btn.addEventListener('click', onClickEdit);
    });

    tbody.querySelectorAll('.dm-btn-delete').forEach((btn) => {
        if (btn.disabled) return;
        btn.addEventListener('click', onClickDelete);
    });
}

/** 페이지네이션 렌더링 -------------------------------------- */
function renderPagination() {
    const pager = document.getElementById('dm-list-pagination');
    if (!pager) return;

    const total = STATE.filteredRows.length;
    const { pageSize, currentPage } = STATE;

    const totalPages = Math.ceil(total / pageSize) || 1;
    const blockSize = 10; // 한 번에 보여줄 최대 페이지 버튼 수

    let html = '';

    // 페이지가 1개면 아무 버튼도 안 보여줘도 됨
    if (totalPages <= 1) {
        pager.innerHTML = '';
        return;
    }

    // 현재 블록 계산 (1~10, 11~20 ...)
    const blockIndex = Math.floor((currentPage - 1) / blockSize);
    const startPage = blockIndex * blockSize + 1;
    const endPage = Math.min(startPage + blockSize - 1, totalPages);

    // « (첫 페이지)
    if (currentPage > 1) {
        html += `<button type="button" class="btn btn-sm dm-page-btn" data-page="1">&laquo;</button>`;
    }

    // < (이전 페이지)
    if (currentPage > 1) {
        html += `<button type="button" class="btn btn-sm dm-page-btn" data-page="${currentPage - 1}">&lt;</button>`;
    }

    // 중간 페이지들
    for (let p = startPage; p <= endPage; p++) {
        html += `
            <button type="button"
                    class="btn btn-sm dm-page-btn ${p === currentPage ? 'dm-page-btn-active' : ''
            }"
                    data-page="${p}">
                ${p}
            </button>
        `;
    }

    // > (다음 페이지)
    if (currentPage < totalPages) {
        html += `<button type="button" class="btn btn-sm dm-page-btn" data-page="${currentPage + 1}">&gt;</button>`;
    }

    // » (마지막 페이지)
    if (currentPage < totalPages) {
        html += `<button type="button" class="btn btn-sm dm-page-btn" data-page="${totalPages}">&raquo;</button>`;
    }

    pager.innerHTML = html;

    pager.querySelectorAll('.dm-page-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const p = Number(e.currentTarget.dataset.page);
            if (!Number.isNaN(p)) {
                STATE.currentPage = p;
                renderTable();
                renderPagination();
            }
        });
    });
}


/** Show / Edit / Delete 핸들러 ------------------------------- */
function findRowByEventTarget(target) {
    const tr = target.closest('tr[data-id]');
    if (!tr) return null;
    const id = Number(tr.dataset.id);
    if (Number.isNaN(id)) return null;
    return STATE.allRows.find((r) => r.disaster_id === id) || null;
}

function onClickShow(e) {
    const row = findRowByEventTarget(e.currentTarget);
    if (!row) return;

    const countryName = STATE.countries[row.country_id] || '-';
    const typeLabel = STATE.disasterTypes[row.disaster_type_id] || '-';

    const detail = [
        `ID: ${row.disaster_id}`,
        `Country: ${countryName}`,
        `Disaster: ${typeLabel}`,
        `Period: ${row.start_year} ~ ${row.end_year}`,
        `Total deaths: ${row.total_deaths}`,
        `Total affected: ${row.total_affected}`,
        `Total damage(1000$): ${row.total_damage_thousand_usd}`
    ].join('\n');

    alert(detail);
}

function onClickEdit(e) {
    const row = findRowByEventTarget(e.currentTarget);
    if (!row) return;
    window.location.href = `datamanageadd.php?id=${row.disaster_id}`;
}

async function onClickDelete(e) {
    const row = findRowByEventTarget(e.currentTarget);
    if (!row) return;

    if (!confirm(`ID ${row.disaster_id} 데이터를 삭제하시겠습니까?`)) {
        return;
    }

    const res = await fetchData('data_manage/delete.php', {
        table: 'disasters',
        id: row.disaster_id
    });

    if (!res || res.status !== 'success') {
        alert(res?.error?.message || '삭제에 실패했습니다.');
        return;
    }

    // 프론트 상태에서도 제거
    STATE.allRows = STATE.allRows.filter(
        (r) => r.disaster_id !== row.disaster_id
    );
    STATE.filteredRows = STATE.filteredRows.filter(
        (r) => r.disaster_id !== row.disaster_id
    );

    alert('삭제되었습니다.');
    renderTable();
    renderPagination();
}

/** 이벤트 세팅 ----------------------------------------------- */
function setupEvents() {
    const searchInput = document.getElementById('dm-search-input');
    const searchBtn = document.getElementById('dm-search-btn');
    const pageSizeSelect = document.getElementById('dm-page-size');

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                STATE.searchKeyword = searchInput.value;
                applyFilterAndRender();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            STATE.searchKeyword = searchInput.value;
            applyFilterAndRender();
        });
    }

    if (pageSizeSelect) {
        pageSizeSelect.value = String(STATE.pageSize);
        pageSizeSelect.addEventListener('change', () => {
            const v = Number(pageSizeSelect.value);
            STATE.pageSize = Number.isNaN(v) ? 10 : v;
            STATE.currentPage = 1;
            renderTable();
            renderPagination();
        });
    }

    const addNewBtn = document.getElementById('dm-add-new-btn');
    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => {
            window.location.href = 'datamanageadd.php';
        });
    }
}

/** 페이지 초기화 ---------------------------------------------- */
function initDataManagePage() {
    const root = document.getElementById('dm-page-root');
    if (!root) return;

    (async () => {
        STATE.currentUser = loadCurrentUser();

        await Promise.all([loadCountries(), loadDisasterTypes(), loadDisasters()]);

        applyFilterAndRender(); // 내부에서 renderTable + renderPagination 호출
        setupEvents();
    })();
}

/** 렌더 ------------------------------------------------------ */
export function render() {
    const html = `
        <div class="page-header"
             style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--spacing-lg); padding-bottom:8px; border-bottom:1px solid #ddd;">
            <h1 style="color:var(--color-primary);">
                <i class="fas fa-database" style="margin-right:10px;"></i>
                Data Manage Page
            </h1>
            <div class="js-auth-area"></div>
        </div>

        <div class="card" id="dm-page-root" style="max-width:980px;">
            <div class="dm-top-bar"
                 style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <button id="dm-add-new-btn" class="btn btn-nav"
                        style="min-width:180px; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <i class="fas fa-plus-circle"></i>
                    ADD NEW
                </button>

                <div style="display:flex; align-items:center; gap:8px;">
                    <input id="dm-search-input"
                           type="text"
                           placeholder="Search by ID / Country / Disaster type"
                           style="width:260px; padding:6px 8px; border:1px solid #ccc; border-radius:4px;">
                    <button id="dm-search-btn" class="btn btn-secondary btn-sm">Search</button>

                    <label style="margin-left:16px; font-size:0.9rem;">
                        Results
                        <select id="dm-page-size" style="margin-left:4px; padding:4px 6px;">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                    </label>
                </div>
            </div>

            <table class="table" style="width:100%; table-layout:fixed;">
                <thead>
                    <tr>
                        <th style="width:20%; text-align:left;">Num</th>
                        <th style="width:40%; text-align:left;">Name</th>
                        <th style="width:40%; text-align:center;">Action</th>
                    </tr>
                </thead>
                <tbody id="dm-list-tbody">
                    <tr>
                        <td colspan="3" style="text-align:center; padding:20px;">
                            Loading...
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
                <div id="dm-list-info" style="font-size:0.9rem; color:#555;">
                    Showing 0 of 0
                </div>
                <div id="dm-list-pagination" style="display:flex; flex-wrap:wrap; gap:4px;"></div>
            </div>
        </div>
    `;

    setTimeout(() => {
        initDataManagePage();
    }, 0);

    return html;
}

export async function loadData() {
    return;
}
