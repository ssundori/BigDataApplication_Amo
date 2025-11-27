// fe/js/pages/RollupPage.js
import { fetchData } from '../../utils/api.js';

/* -------------------------------
   결과 렌더링
-------------------------------- */
function renderRollupResults(result, labels, yearRangeLabel) {
    const container = document.getElementById('rollup-result-container');
    const titleEl = document.getElementById('rollup-results-title');

    if (!container || !titleEl) return;

    if (!result || !result.success) {
        titleEl.textContent = '데이터 조회 실패';
        container.innerHTML = `
            <p style="text-align:center; color:#DC3545; padding:30px;">
                데이터를 불러오는 중 오류가 발생했습니다.
            </p>`;
        return;
    }

    // 백엔드가 어떤 구조를 주는지 정확히 모르니까
    // 가장 일반적인 케이스(배열 데이터) 기준으로 처리
    const rows = Array.isArray(result.data) ? result.data : [];

    titleEl.textContent =
        `Roll-up (${labels.dimensionLabel}) by ${labels.measureLabel} (${yearRangeLabel})`;

    if (!rows.length) {
        container.innerHTML = `
            <p style="text-align:center; color:#6C757D; padding:30px;">
                조회된 Roll-up 데이터가 없습니다.
            </p>`;
        return;
    }

    // 컬럼 이름 추론: 첫 번째 row의 키들을 사용
    const sample = rows[0];
    const keys = Object.keys(sample);

    // dimension 쪽 / measure 쪽을 약간 나눠서 보기 좋게
    // 보통 "group_name / year / measure_value" 이런 형태일 거라서
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    ${keys
            .map((k) => `<th>${k.replace(/_/g, ' ')}</th>`)
            .join('')}
                </tr>
            </thead>
            <tbody>
                ${rows
            .map(
                (row) => `
                    <tr>
                        ${keys
                        .map((k) => {
                            const v = row[k];
                            // 숫자는 3자리 콤마
                            if (typeof v === 'number') {
                                return `<td style="text-align:right;">${v.toLocaleString()}</td>`;
                            }
                            return `<td>${v}</td>`;
                        })
                        .join('')}
                    </tr>`
            )
            .join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

/* -------------------------------
   API 호출
-------------------------------- */
async function fetchRollupData(params, labels) {
    const container = document.getElementById('rollup-result-container');
    if (!container) return;

    container.innerHTML = `
        <p style="text-align:center; color:var(--color-primary); padding:30px;">
            <i class="fas fa-spinner fa-spin"></i> 데이터를 불러오는 중...
        </p>`;

    // ⚠️ 여기 API 경로는 백엔드 명세에 맞게 필요하면 수정
    const result = await fetchData('analysis/temperature_rollup.php', params);

    if (!result || !result.success) {
        container.innerHTML = `
            <p style="text-align:center; color:#DC3545; padding:30px;">
                오류: ${result?.message || '데이터 조회 실패'}
            </p>`;
        return;
    }

    const yearRangeLabel = `${params.start_year} ~ ${params.end_year}`;
    renderRollupResults(result, labels, yearRangeLabel);
}

/* -------------------------------
   공통 필터(대륙/재난유형) 셀렉트 채우기
-------------------------------- */
async function populateFilters() {
    const continentSelect = document.getElementById('rollup-continent-id');
    const disasterSelect = document.getElementById('rollup-disaster-type-id');

    try {
        const contData = await fetchData('common/continents.php');
        if (contData?.success && continentSelect) {
            let html = '<option value="">All Continent</option>';
            contData.data.forEach((c) => {
                html += `<option value="${c.id}">${c.name}</option>`;
            });
            continentSelect.innerHTML = html;
        }

        const typeData = await fetchData('common/disaster_types.php');
        if (typeData?.success && disasterSelect) {
            let html = '<option value="">All Type</option>';
            typeData.data.forEach((d) => {
                html += `<option value="${d.id}">${d.type} (${d.group})</option>`;
            });
            disasterSelect.innerHTML = html;
        }
    } catch (e) {
        console.error('Roll-up filter load error', e);
    }
}

/* -------------------------------
   이벤트 등록
-------------------------------- */
function setupEventListeners() {
    const form = document.getElementById('rollup-filter-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const measure = document.getElementById('rollup-measure').value;
        const dimension = document.getElementById('rollup-dimension').value;

        const startYear = document.getElementById('rollup-start-year').value;
        const endYear = document.getElementById('rollup-end-year').value;
        const continentId = document.getElementById('rollup-continent-id').value;
        const disasterTypeId = document.getElementById('rollup-disaster-type-id').value;

        if (!measure || !dimension || !startYear || !endYear) {
            alert('Measure, Dimension, 기간은 필수입니다.');
            return;
        }

        const params = {
            // 백엔드 명세에 맞춰서 이름을 조정하면 됨
            measure,             // 예: "total_deaths" / "total_affected" / "total_damage_thousand_usd"
            dimension,           // 예: "continent" / "year" / "disaster_type"
            start_year: parseInt(startYear, 10),
            end_year: parseInt(endYear, 10),
            continent_id: continentId ? parseInt(continentId, 10) : undefined,
            disaster_type_id: disasterTypeId ? parseInt(disasterTypeId, 10) : undefined
        };

        const measureLabelMap = {
            total_deaths: 'Total Deaths',
            total_affected: 'Total Affected',
            total_damage_thousand_usd: 'Total Damage (USD)'
        };

        const dimensionLabelMap = {
            continent: 'Continent',
            year: 'Year',
            disaster_type: 'Disaster Type'
        };

        const labels = {
            measureLabel: measureLabelMap[measure] || measure,
            dimensionLabel: dimensionLabelMap[dimension] || dimension
        };

        fetchRollupData(params, labels);
    });
}

/* -------------------------------
   렌더 함수 (HTML 뿌리기)
-------------------------------- */
export function render() {
    const html = `
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--spacing-lg); padding-bottom:8px; border-bottom:1px solid #ddd;">
            <h1 style="color:var(--color-primary);">
                <i class="fas fa-layer-group" style="margin-right:10px;"></i>
                Global Disaster Roll-up
            </h1>
            <div class="btn btn-primary" style="background:none; color:var(--color-primary); font-size:1.1rem; font-weight:bold; padding:0;">
                <i class="fas fa-user-circle"></i> Login
            </div>
        </div>

        <div class="card" style="margin-bottom:var(--spacing-lg);">
            <h2 style="margin-bottom:var(--spacing-md); color:var(--color-primary);">Analysis Settings</h2>

            <form id="rollup-filter-form" style="
                display:grid;
                grid-template-columns: 220px 1fr;
                gap: var(--spacing-sm) var(--spacing-lg);
                margin-top: var(--spacing-md);
                align-items:center;
            ">
                <!-- Measure -->
                <label for="rollup-measure" class="form-label">Measure</label>
                <select id="rollup-measure" name="measure" style="padding:5px; width:220px;">
                    <option value="total_deaths" selected>Total Deaths</option>
                    <option value="total_affected">Total Affected</option>
                    <option value="total_damage_thousand_usd">Total Damage (USD)</option>
                </select>

                <!-- Dimension (Roll-up 기준) -->
                <label for="rollup-dimension" class="form-label">Roll-up Dimension</label>
                <select id="rollup-dimension" name="dimension" style="padding:5px; width:220px;">
                    <option value="continent" selected>Continent</option>
                    <option value="year">Year</option>
                    <option value="disaster_type">Disaster Type</option>
                </select>

                <!-- 기간 -->
                <label class="form-label">Date Range</label>
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="number" id="rollup-start-year" value="2010" min="1990" max="2025" style="padding:5px; width:90px;">
                    <span>~</span>
                    <input type="number" id="rollup-end-year" value="2022" min="1990" max="2025" style="padding:5px; width:90px;">
                </div>

                <!-- Continent Filter (optional) -->
                <label for="rollup-continent-id" class="form-label">Continent Filter</label>
                <select id="rollup-continent-id" name="continent_id" style="padding:5px; width:200px;">
                    <option value="">All Continent</option>
                </select>

                <!-- Disaster Filter (optional) -->
                <label for="rollup-disaster-type-id" class="form-label">Disaster Filter</label>
                <select id="rollup-disaster-type-id" name="disaster_type_id" style="padding:5px; width:220px;">
                    <option value="">All Type</option>
                </select>

                <!-- Run 버튼 -->
                <div style="grid-column:1 / -1; margin-top:var(--spacing-lg);">
                    <button type="submit" class="btn btn-nav" style="width:100px; padding:10px 15px; text-align:center;">
                        Run
                    </button>
                </div>
            </form>
        </div>

        <div class="card">
            <h2 style="margin-bottom:var(--spacing-md); color:var(--color-primary);">Results & Visualization</h2>
            <h3 id="rollup-results-title" style="margin-bottom:var(--spacing-lg); color:#495057;">Analysis Results</h3>

            <div id="rollup-result-container" style="min-height:160px;">
                <p style="text-align:center; color:#6C757D; padding:30px;">
                    상단 필터를 설정하고 'Run' 버튼을 눌러주세요.
                </p>
            </div>
        </div>
    `;

    // 렌더 후 필터/이벤트 세팅
    setTimeout(() => {
        populateFilters();
        setupEventListeners();
    }, 0);

    return html;
}

/* Ranking / Aggregation 과 맞추기 위한 loadData (지금은 아무것도 안함) */
export async function loadData() {
    return;
}
