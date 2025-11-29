// fe/js/pages/DataManageAddPage.js
import { fetchData, postData } from '../../utils/api.js';

let DISASTER_TYPES = [];

/* ------------------------------------
   로그인 유저 가져오기
--------------------------------------*/
function getLoggedInUser() {
    try {
        const stored = sessionStorage.getItem('amoUser');
        if (!stored) return null;
        return JSON.parse(stored);
    } catch (e) {
        console.error(e);
        return null;
    }
}

/* ------------------------------------
    URL에서 ?id= 추출 → edit 모드 판단
--------------------------------------*/
function getEditingId() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    return id ? Number(id) : null;
}

/* ------------------------------------
    국가 리스트 불러오기
--------------------------------------*/
async function populateCountries() {
    const el = document.getElementById('dm-add-country');
    el.innerHTML = '<option value="">Select Country</option>';

    const res = await fetchData('common/countries.php');
    if (!res?.success) return;

    let html = '<option value="">Select Country</option>';
    res.data.forEach(c => {
        html += `<option value="${c.id}">${c.name}</option>`;
    });
    el.innerHTML = html;
}

/* ------------------------------------
    재해 타입 불러오기
--------------------------------------*/
async function loadDisasterTypes() {
    const res = await fetchData('common/disaster_types.php');
    if (res?.success) DISASTER_TYPES = res.data;
}

function populateDisasterGroups() {
    const el = document.getElementById('dm-add-disaster-group');
    const groups = [...new Set(DISASTER_TYPES.map(d => d.group))];

    let html = '<option value="">Group</option>';
    groups.forEach(g => html += `<option value="${g}">${g}</option>`);
    el.innerHTML = html;
}

function populateDisasterTypesByGroup(group) {
    const el = document.getElementById('dm-add-disaster-type');
    if (!group) {
        el.innerHTML = '<option value="">Type</option>';
        return;
    }

    const list = DISASTER_TYPES.filter(d => d.group === group);

    let html = '<option value="">Type</option>';
    list.forEach(d => html += `<option value="${d.id}">${d.type}</option>`);
    el.innerHTML = html;
}

/* ------------------------------------------------------
    EDIT MODE: detail.php로 기존 데이터 로딩
-------------------------------------------------------*/
async function loadInitialData(editingId) {

    const res = await fetchData('data_manage/detail.php', { id: editingId });

    if (!res || res.status !== "success") {
        console.error("detail load failed", res);
        return;
    }

    const d = res.data;

    document.getElementById('dm-add-country').value = d.country_id;
    document.getElementById('dm-add-start-year').value = d.start_year;
    document.getElementById('dm-add-end-year').value = d.end_year;
    document.getElementById('dm-add-total-deaths').value = d.total_deaths;
    document.getElementById('dm-add-total-affected').value = d.total_affected;
    document.getElementById('dm-add-total-damage').value = d.total_damage_thousand_usd;

    // group/type 자동 세팅
    const type = DISASTER_TYPES.find(t => t.id == d.disaster_type_id);
    if (type) {
        document.getElementById('dm-add-disaster-group').value = type.group;
        populateDisasterTypesByGroup(type.group);
        document.getElementById('dm-add-disaster-type').value = d.disaster_type_id;
    }

    // UI 텍스트 변경
    document.querySelector('#dm-add-form-root h2').textContent = "Edit Data";
    document.getElementById('dm-add-submit').textContent = "Save Changes";
}

/* ------------------------------------------------------
    ADD / EDIT SUBMIT
-------------------------------------------------------*/
async function handleSubmit() {
    const errorEl = document.getElementById('dm-add-error');
    errorEl.textContent = "";

    const country = document.getElementById('dm-add-country').value;
    const group = document.getElementById('dm-add-disaster-group').value;
    const type = document.getElementById('dm-add-disaster-type').value;

    const startYear = Number(document.getElementById('dm-add-start-year').value);
    const endYear = Number(document.getElementById('dm-add-end-year').value);
    const deaths = Number(document.getElementById('dm-add-total-deaths').value || 0);
    const affected = Number(document.getElementById('dm-add-total-affected').value || 0);
    const damage = Number(document.getElementById('dm-add-total-damage').value || 0);

    if (!country || !group || !type) {
        errorEl.textContent = "필수 항목을 모두 입력하세요.";
        return;
    }

    if (startYear > endYear) {
        errorEl.textContent = "시작 연도는 종료 연도보다 클 수 없습니다.";
        return;
    }

    const editingId = getEditingId();

    // 백엔드 필드명과 100% 맞춤
    const payload = {
        country_id: Number(country),
        disaster_type_id: Number(type),
        start_year: startYear,
        end_year: endYear,
        total_deaths: deaths,
        total_affected: affected,
        total_damage_thousand_usd: damage
    };

    let endpoint = "";

    if (editingId) {
        // UPDATE
        endpoint = `data_manage/update.php?table=disasters&id=${editingId}`;
    } else {
        // CREATE
        endpoint = "data_manage/create.php";
    }

    const res = await postData(endpoint, payload);

    console.log("SUBMIT RESPONSE:", res);

    if (!res || res.status !== "success") {
        errorEl.textContent = res?.error?.message || "서버 오류";
        return;
    }

    alert(editingId ? "데이터가 수정되었습니다." : "데이터가 추가되었습니다.");
    window.location.href = "datamanage.php";
}

/* ------------------------------------------------------
    페이지 초기화
-------------------------------------------------------*/
function initDataManageAddPage() {
    (async () => {
        await Promise.all([loadDisasterTypes(), populateCountries()]);

        populateDisasterGroups();
        populateDisasterTypesByGroup("");

        const editingId = getEditingId();
        if (editingId) {
            await loadInitialData(editingId);
        }

        // 이벤트
        document.getElementById('dm-add-disaster-group')
            .addEventListener('change', e => populateDisasterTypesByGroup(e.target.value));

        document.getElementById('dm-add-submit')
            .addEventListener('click', e => {
                e.preventDefault();
                handleSubmit();
            });

        document.getElementById('dm-add-cancel')
            .addEventListener('click', () => window.location.href = "datamanage.php");
    })();
}

/* ------------------------------------------------------
    렌더링
-------------------------------------------------------*/
export function render() {
    const html = `
        <div class="page-header" style="display:flex; justify-content:space-between;align-items:center; margin-bottom:var(--spacing-lg); padding-bottom:8px; border-bottom:1px solid #ddd;">
            <h1 style="color:var(--color-primary);">
                <i class="fas fa-database" style="margin-right:10px;"></i>
                Data Manage Page
            </h1>
            <div class="js-auth-area"></div>
        </div>

        <div class="card" id="dm-add-form-root" style="max-width:820px;">
            <h2 style="margin-bottom:var(--spacing-md); color:var(--color-primary);">Add New Data</h2>

            <form id="dm-add-form" class="settings-grid" style="
                display:grid;
                grid-template-columns:200px 1fr;
                row-gap:10px;
                column-gap:16px;
                align-items:center;
            ">

                <label>Country</label>
                <select id="dm-add-country" style="padding:6px; max-width:260px;">
                    <option value="">Loading...</option>
                </select>

                <label>Disaster Type</label>
                <div style="display:flex; gap:8px;">
                    <select id="dm-add-disaster-group" style="padding:6px; flex:1;">
                        <option value="">Group</option>
                    </select>
                    <select id="dm-add-disaster-type" style="padding:6px; flex:1;">
                        <option value="">Type</option>
                    </select>
                </div>

                <label>Start Year / End Year</label>
                <div style="display:flex; gap:8px;">
                    <input type="number" id="dm-add-start-year" value="2000" style="width:90px;">
                    <span>~</span>
                    <input type="number" id="dm-add-end-year" value="2000" style="width:90px;">
                </div>

                <label>Total deaths</label>
                <input type="number" id="dm-add-total-deaths" style="padding:6px; max-width:260px;">

                <label>Total affected</label>
                <input type="number" id="dm-add-total-affected" style="padding:6px; max-width:260px;">

                <label>Total damaged (1000 Dollar)</label>
                <input type="number" id="dm-add-total-damage" style="padding:6px; max-width:260px;">

                <div style="grid-column:1 / -1; margin-top:16px;">
                    <p id="dm-add-error" style="color:#DC3545; font-size:0.9rem;"></p>

                    <div style="display:flex; gap:8px;">
                        <button id="dm-add-cancel" class="btn btn-secondary" type="button" style="min-width:120px;">Cancel</button>
                        <button id="dm-add-submit" class="btn btn-nav" type="submit" style="flex:1;">+ ADD NEW</button>
                    </div>
                </div>

            </form>
        </div>
    `;

    setTimeout(() => initDataManageAddPage(), 0);
    return html;
}

export async function loadData() {
    return;
}
