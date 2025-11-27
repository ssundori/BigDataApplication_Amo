// fe/js/pages/DataManageAddPage.js
import { fetchData, postData } from '../../utils/api.js';

/** 국가, 재난유형 셀렉트 채우기 */
async function populateSelects() {
    const countrySelect = document.getElementById('dm-country');
    const groupSelect = document.getElementById('dm-disaster-group');
    const typeSelect = document.getElementById('dm-disaster-type');

    if (!countrySelect || !groupSelect || !typeSelect) return;

    try {
        // 국가 목록 (백엔드 common/contries.php 사용)
        const countryRes = await fetchData('common/contries.php');
        if (countryRes?.success && Array.isArray(countryRes.data)) {
            countrySelect.innerHTML =
                '<option value="">Select Country</option>' +
                countryRes.data
                    .map(c => `<option value="${c.id}">${c.name}</option>`)
                    .join('');
        }

        // 재난 타입 목록 (group + type 같이 옴)
        const typeRes = await fetchData('common/disaster_types.php');
        let disasterTypes = [];
        if (typeRes?.success && Array.isArray(typeRes.data)) {
            disasterTypes = typeRes.data;
        }

        // 그룹 목록 만들기
        const groups = [...new Set(disasterTypes.map(d => d.group))].filter(Boolean);
        groupSelect.innerHTML =
            '<option value="">Group</option>' +
            groups.map(g => `<option value="${g}">${g}</option>`).join('');

        // 그룹 선택에 따라 type 셀렉트 채우기
        groupSelect.addEventListener('change', () => {
            const g = groupSelect.value;
            const filtered = g
                ? disasterTypes.filter(d => d.group === g)
                : disasterTypes;

            typeSelect.innerHTML =
                '<option value="">Type</option>' +
                filtered
                    .map(d => `<option value="${d.id}">${d.type}</option>`)
                    .join('');
        });

        // 초기 type 전체
        typeSelect.innerHTML =
            '<option value="">Type</option>' +
            disasterTypes.map(d => `<option value="${d.id}">${d.type}</option>`).join('');

    } catch (e) {
        console.error('DataManageAdd – select load error', e);
    }
}

/** 폼 submit 이벤트 */
function setupFormSubmit() {
    const form = document.getElementById('dm-add-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dataType = (document.getElementById('dm-data-type')?.value || '').toUpperCase();
        const countryId = document.getElementById('dm-country')?.value || '';
        const disasterTypeId = document.getElementById('dm-disaster-type')?.value || '';
        const startYear = document.getElementById('dm-start-year')?.value || '';
        const endYear = document.getElementById('dm-end-year')?.value || '';
        const totalDeaths = document.getElementById('dm-total-deaths')?.value || '0';
        const totalAffected = document.getElementById('dm-total-affected')?.value || '0';
        const totalDamage = document.getElementById('dm-total-damage')?.value || '0';

        // 기본 validation
        if (!dataType) {
            alert('Data Type을 선택해주세요.');
            return;
        }
        if (dataType === 'COUNTRY' && !countryId) {
            alert('Country를 선택해주세요.');
            return;
        }
        if (!disasterTypeId) {
            alert('Disaster Type을 선택해주세요.');
            return;
        }
        if (!startYear || !endYear) {
            alert('시작/종료 연도를 입력해주세요.');
            return;
        }

        // 백엔드 create.php에서 기대하는 필드들 추정
        const payload = {
            // GLOBAL | COUNTRY (create.php 안에서 유효성 검사에 사용)
            data_type: dataType,

            // 어떤 테이블에 넣을지 (create.php에서 이 값으로 분기)
            table: dataType === 'GLOBAL'
                ? 'global_disasters'
                : 'country_disasters',

            country_id: dataType === 'GLOBAL'
                ? null
                : Number(countryId),

            disaster_type_id: Number(disasterTypeId),
            start_year: Number(startYear),
            end_year: Number(endYear),
            total_deaths: Number(totalDeaths) || 0,
            total_affected: Number(totalAffected) || 0,
            total_damage_thousand_usd: Number(totalDamage) || 0
        };

        try {
            const res = await postData('data_manage/create.php', payload);

            // create.php에서
            // { status: "success", message: "...", data: { id: ... } }
            // 이런 식으로 내려준다고 가정
            if (res?.status === 'success') {
                alert('데이터가 성공적으로 추가되었습니다.');
                // 리스트 페이지로 이동
                window.location.href = 'datamanage.php';
            } else {
                const msg =
                    res?.message ||
                    res?.error ||
                    '데이터 추가 중 오류가 발생했습니다.';
                alert(msg);
            }
        } catch (err) {
            console.error('DataManageAdd – create error', err);
            alert('서버 통신 중 오류가 발생했습니다.');
        }
    });
}

export function render() {
    // datamanageadd.php에서 이 HTML이 app-root에 들어감
    const html = `
    <div class="page-header">
      <h1><i class="fas fa-database"></i> Data Manage Page</h1>
      <div class="login-icon"><i class="fas fa-user-circle"></i> Login</div>
    </div>

    <div class="card">
      <h2>Add New Data</h2>

      <form id="dm-add-form" class="dm-add-grid">
        <div class="dm-field">
          <label for="dm-data-type" class="form-label">Data Type</label>
          <select id="dm-data-type">
            <option value="GLOBAL">Global Disaster</option>
            <option value="COUNTRY">Country Disaster</option>
          </select>
        </div>

        <div class="dm-field">
          <label for="dm-country" class="form-label">Country</label>
          <select id="dm-country">
            <option value="">Select Country</option>
          </select>
        </div>

        <div class="dm-field">
          <label class="form-label">Disaster Type</label>
          <div class="dm-disaster-type-wrapper">
            <select id="dm-disaster-group">
              <option value="">Group</option>
            </select>
            <select id="dm-disaster-type">
              <option value="">Type</option>
            </select>
          </div>
        </div>

        <div class="dm-field">
          <label class="form-label">Start Year</label>
          <input type="number" id="dm-start-year" min="1980" max="2025" value="2000">
        </div>

        <div class="dm-field">
          <label class="form-label">End Year</label>
          <input type="number" id="dm-end-year" min="1980" max="2025" value="2000">
        </div>

        <div class="dm-field">
          <label class="form-label">Total deaths</label>
          <input type="number" id="dm-total-deaths" placeholder="ex) 100">
        </div>

        <div class="dm-field">
          <label class="form-label">Total affected (People)</label>
          <input type="number" id="dm-total-affected" placeholder="ex) 50000">
        </div>

        <div class="dm-field full-width">
          <label class="form-label">Total damaged (1000 Dollar)</label>
          <input type="number" id="dm-total-damage" placeholder="ex) 1000">
        </div>

        <div class="dm-add-actions">
          <button type="button" id="dm-add-cancel" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-plus-circle"></i> ADD NEW
          </button>
        </div>
      </form>
    </div>
  `;

    // 렌더 후 셀렉트/이벤트 세팅
    setTimeout(() => {
        populateSelects();
        setupFormSubmit();

        const cancelBtn = document.getElementById('dm-add-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.location.href = 'datamanage.php';
            });
        }
    }, 0);

    return html;
}
