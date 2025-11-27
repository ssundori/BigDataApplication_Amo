// fe/js/pages/DataManageAddPage.js
import { fetchData, postData } from '../../utils/api.js';

// 전역(모듈) 변수 – 재사용용
let DISASTER_TYPES = [];

/** 로그인 유저 (작성자 정보 보내고 싶을 때 사용) */
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

/* -------------------------------
   셀렉트 박스 채우기
-------------------------------- */

/** Country 목록 채우기 */
async function populateCountries() {
    const countrySelect = document.getElementById('dm-add-country');
    if (!countrySelect) return;

    countrySelect.innerHTML = '<option value="">Select Country</option>';

    try {
        // 팀에서 쓰는 국가 리스트 API에 맞게 파일명만 조정
        const res = await fetchData('common/countries.php');
        if (!res || !res.success || !Array.isArray(res.data)) return;

        let html = '<option value="">Select Country</option>';
        res.data.forEach((c) => {
            html += `<option value="${c.id}">${c.name}</option>`;
        });
        countrySelect.innerHTML = html;
    } catch (err) {
        console.error('populateCountries error', err);
    }
}

/** 재해 타입(그룹 + 타입) 정보 불러오기 */
async function loadDisasterTypes() {
    try {
        // Aggregation / Rollup에서 쓰던 것과 동일한 API라고 가정
        const res = await fetchData('common/disaster_types.php');
        if (res && res.success && Array.isArray(res.data)) {
            DISASTER_TYPES = res.data; // {id, type, group} 형태라고 가정
        }
    } catch (err) {
        console.error('loadDisasterTypes error', err);
    }
}

/** Group 셀렉트 채우기 */
function populateDisasterGroups() {
    const groupSelect = document.getElementById('dm-add-disaster-group');
    if (!groupSelect) return;

    const groups = [...new Set(DISASTER_TYPES.map((d) => d.group))];

    let html = '<option value="">Group</option>';
    groups.forEach((g) => {
        html += `<option value="${g}">${g}</option>`;
    });

    groupSelect.innerHTML = html;
}

/** 선택된 Group에 따라 Type 셀렉트 채우기 */
function populateDisasterTypesByGroup(selectedGroup) {
    const typeSelect = document.getElementById('dm-add-disaster-type');
    if (!typeSelect) return;

    if (!selectedGroup) {
        typeSelect.innerHTML = '<option value="">Type</option>';
        return;
    }

    const filtered = DISASTER_TYPES.filter(
        (d) => d.group === selectedGroup
    );

    let html = '<option value="">Type</option>';
    filtered.forEach((d) => {
        html += `<option value="${d.id}">${d.type}</option>`;
    });

    typeSelect.innerHTML = html;
}

/* -------------------------------
   폼 이벤트
-------------------------------- */
function setupFormEvents() {
    const groupSelect = document.getElementById('dm-add-disaster-group');
    const cancelBtn   = document.getElementById('dm-add-cancel');
    const submitBtn   = document.getElementById('dm-add-submit');

    if (groupSelect) {
        groupSelect.addEventListener('change', (e) => {
            populateDisasterTypesByGroup(e.target.value);
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // 목록 페이지로 돌아가기
            window.location.href = 'datamanage.php';
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleSubmit();
        });
    }
}

/** 숫자 입력 보정용 */
function parseNumber(value) {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
}

/** ADD NEW 클릭 시 처리 */
async function handleSubmit() {
    const errorEl = document.getElementById('dm-add-error');
    if (errorEl) errorEl.textContent = '';

    const dataTypeEl      = document.getElementById('dm-add-data-type');
    const countryEl       = document.getElementById('dm-add-country');
    const groupEl         = document.getElementById('dm-add-disaster-group');
    const typeEl          = document.getElementById('dm-add-disaster-type');
    const startYearEl     = document.getElementById('dm-add-start-year');
    const endYearEl       = document.getElementById('dm-add-end-year');
    const deathsEl        = document.getElementById('dm-add-total-deaths');
    const affectedEl      = document.getElementById('dm-add-total-affected');
    const damageEl        = document.getElementById('dm-add-total-damage');

    const dataType   = dataTypeEl?.value || '';
    const countryId  = countryEl?.value || '';
    const group      = groupEl?.value || '';
    const disasterId = typeEl?.value || '';

    const startYear  = parseNumber(startYearEl?.value);
    const endYear    = parseNumber(endYearEl?.value);
    const totalDeaths   = parseNumber(deathsEl?.value);
    const totalAffected = parseNumber(affectedEl?.value);
    const totalDamage   = parseNumber(damageEl?.value);

    // 기본 검증
    if (!dataType || !countryId || !group || !disasterId ||
        startYear === null || endYear === null) {
        if (errorEl) {
            errorEl.textContent = '필수 항목을 모두 입력해주세요.';
        } else {
            alert('필수 항목을 모두 입력해주세요.');
        }
        return;
    }

    if (startYear > endYear) {
        if (errorEl) {
            errorEl.textContent = '시작 연도가 종료 연도보다 클 수 없습니다.';
        } else {
            alert('시작 연도가 종료 연도보다 클 수 없습니다.');
        }
        return;
    }

    const user = getLoggedInUser();

    // 🔽 백엔드에서 실제로 요구하는 필드명에 맞춰 조정해줘야 할 부분
    const payload = {
        // 예시: data_type: 'global' | 'country'
        data_type: dataType,              // 'Global Disaster' 같은 텍스트면, 서버에서 매핑 필요
        country_id: Number(countryId),
        disaster_type_id: Number(disasterId),
        start_year: startYear,
        end_year: endYear,
        total_deaths: totalDeaths ?? 0,
        total_affected: totalAffected ?? 0,
        total_damage: totalDamage ?? 0,   // 1000 USD 단위라고 가정

        // 선택: 로그인 유저 정보도 같이 보내고 싶으면
        created_by: user?.user_login_id || null
    };

    try {
        // ✅ 실제 데이터 추가 API – 파일명만 팀에 맞게 조정
        const res = await postData('data_manage/create.php', payload);

        if (!res || !res.success) {
            const msg = res?.message || res?.error?.message || '데이터 추가에 실패했습니다.';
            if (errorEl) {
                errorEl.textContent = msg;
            } else {
                alert(msg);
            }
            return;
        }

        alert('데이터가 성공적으로 추가되었습니다.');
        // 완료 후 목록 페이지로 이동
        window.location.href = 'datamanage.php';
    } catch (err) {
        console.error('handleSubmit error', err);
        if (errorEl) {
            errorEl.textContent = '서버 통신 중 오류가 발생했습니다.';
        } else {
            alert('서버 통신 중 오류가 발생했습니다.');
        }
    }
}

/* -------------------------------
   페이지 초기화
-------------------------------- */
function initDataManageAddPage() {
    const formRoot = document.getElementById('dm-add-form-root');
    if (!formRoot) return; // 다른 페이지에서 import 되었을 때 대비

    (async () => {
        await Promise.all([loadDisasterTypes(), populateCountries()]);
        populateDisasterGroups();
        populateDisasterTypesByGroup('');
        setupFormEvents();
    })();
}

/* -------------------------------
   렌더(UI) – 지금 UI 유지
-------------------------------- */
export function render() {
    const html = `
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--spacing-lg); padding-bottom:8px; border-bottom:1px solid #ddd;">
            <h1 style="color:var(--color-primary);">
                <i class="fas fa-database" style="margin-right:10px;"></i>
                Data Manage Page
            </h1>
            <div class="btn btn-primary" style="background:none; color:var(--color-primary); font-size:1.1rem; font-weight:bold; padding:0;">
                <i class="fas fa-user-circle"></i> Login
            </div>
        </div>

        <div class="card" id="dm-add-form-root" style="max-width:820px;">
            <h2 style="margin-bottom:var(--spacing-md); color:var(--color-primary);">Add New Data</h2>

            <form id="dm-add-form" class="settings-grid" style="
                display:grid;
                grid-template-columns: 200px 1fr;
                row-gap: 10px;
                column-gap: 16px;
                align-items:center;
            ">
                <label class="form-label" for="dm-add-data-type">Data Type</label>
                <select id="dm-add-data-type" style="padding:6px; max-width:260px;">
                    <option value="Global Disaster">Global Disaster</option>
                    <option value="Country Disaster">Country Disaster</option>
                </select>

                <label class="form-label" for="dm-add-country">Country</label>
                <select id="dm-add-country" style="padding:6px; max-width:260px;">
                    <option value="">Select Country</option>
                </select>

                <label class="form-label">Disaster Type</label>
                <div style="display:flex; gap:8px; max-width:360px;">
                    <select id="dm-add-disaster-group" style="padding:6px; flex:1;">
                        <option value="">Group</option>
                    </select>
                    <select id="dm-add-disaster-type" style="padding:6px; flex:1;">
                        <option value="">Type</option>
                    </select>
                </div>

                <label class="form-label">Start Year / End Year</label>
                <div style="display:flex; align-items:center; gap:8px; max-width:260px;">
                    <input type="number" id="dm-add-start-year" min="1990" max="2025" value="2000" style="padding:6px; width:90px;">
                    <span>~</span>
                    <input type="number" id="dm-add-end-year" min="1990" max="2025" value="2000" style="padding:6px; width:90px;">
                </div>

                <label class="form-label" for="dm-add-total-deaths">Total deaths</label>
                <input type="number" id="dm-add-total-deaths" placeholder="ex) 100" style="padding:6px; max-width:260px;">

                <label class="form-label" for="dm-add-total-affected">Total affected (People)</label>
                <input type="number" id="dm-add-total-affected" placeholder="ex) 50000" style="padding:6px; max-width:260px;">

                <label class="form-label" for="dm-add-total-damage">Total damaged (1000 Dollar)</label>
                <input type="number" id="dm-add-total-damage" placeholder="ex) 1000" style="padding:6px; max-width:260px;">

                <div style="grid-column:1 / -1; margin-top:16px; display:flex; flex-direction:column; gap:8px;">
                    <p id="dm-add-error" style="color:#DC3545; font-size:0.9rem;"></p>
                    <div style="display:flex; gap:8px; justify-content:flex-start;">
                        <button id="dm-add-cancel" class="btn btn-secondary" type="button" style="min-width:120px;">Cancel</button>
                        <button id="dm-add-submit" class="btn btn-nav" type="submit" style="flex:1; max-width:480px;">
                            + ADD NEW
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;

    // DOM에 붙은 뒤 초기화
    setTimeout(() => {
        initDataManageAddPage();
    }, 0);

    return html;
}

export async function loadData() {
    return;
}
