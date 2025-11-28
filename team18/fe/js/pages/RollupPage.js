// fe/js/pages/RollupPage.js
import { fetchData } from '../../utils/api.js';

let rollupChart = null;

/* -------------------------------
   결과 렌더링 (국가→대륙→전세계 기온 롤업)
-------------------------------- */
function renderRollupResults(result) {
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

    const rows = Array.isArray(result.data) ? result.data : [];
    const countryName = result.countryName ?? '';
    const continentName = result.continentName ?? '';
    const fromYear = result.fromYear;
    const toYear = result.toYear;

    titleEl.textContent =
        `국가 → 대륙 → 전세계 연평균 기온 변화 (${fromYear} ~ ${toYear})`;

    // ⬇️ 대륙은 temperature_rollup.php 응답을 이용해 자동 세팅
    const continentSelect = document.getElementById('rollup-continent');
    if (continentSelect) {
        continentSelect.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = continentName || '';
        opt.textContent = continentName || 'N/A';
        continentSelect.appendChild(opt);
        continentSelect.disabled = true;
    }

    if (!rows.length) {
        container.innerHTML = `
            <p style="margin-bottom:12px; color:#495057;">
                선택한 국가는 <strong>${countryName}</strong>,
                해당 국가는 <strong>${continentName}</strong> 대륙에 속합니다.
            </p>
            <p style="text-align:center; color:#6C757D; padding:30px;">
                조회된 Roll-up 데이터가 없습니다.
            </p>`;
        return;
    }

    // 연도별 country / continent / global 묶기
    const yearMap = {};
    rows.forEach((r) => {
        const y = r.year;
        if (!yearMap[y]) {
            yearMap[y] = { year: y, country: null, continent: null, global: null };
        }
        const temp = r.avgTemp != null ? Number(r.avgTemp) : null;
        if (r.level === 'country') yearMap[y].country = temp;
        if (r.level === 'continent') yearMap[y].continent = temp;
        if (r.level === 'global') yearMap[y].global = temp;
    });

    const yearRows = Object.values(yearMap).sort((a, b) => a.year - b.year);

    // ⬇️ 표 삭제 → 차트만 출력
    const html = `
        <p style="margin-bottom:12px; color:#495057;">
            선택한 국가는 <strong>${countryName}</strong>,
            해당 국가는 <strong>${continentName}</strong> 대륙에 속합니다.
            아래는 각 연도별 <strong>국가 → 대륙 → 전세계</strong>로 롤업된 평균 기온(°C)의 추세입니다.
        </p>

        <div style="margin-bottom:24px; height:260px;">
            <canvas id="rollup-chart"></canvas>
        </div>
    `;

    container.innerHTML = html;

    // 차트 렌더링
    renderChart(yearRows, countryName, continentName);
}

/* -------------------------------
   라인 차트
-------------------------------- */
function renderChart(yearRows, countryName, continentName) {
    const canvas = document.getElementById('rollup-chart');
    if (!canvas || !window.Chart) return;
    const ctx = canvas.getContext('2d');

    const labels = yearRows.map((r) => r.year);
    const toNumOrNull = (v) => (v == null || Number.isNaN(Number(v)) ? null : Number(v));

    const country = yearRows.map((r) => toNumOrNull(r.country));
    const continent = yearRows.map((r) => toNumOrNull(r.continent));
    const global = yearRows.map((r) => toNumOrNull(r.global));

    if (rollupChart) rollupChart.destroy();

    rollupChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: countryName,
                    data: country,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0,123,255,0.1)',
                    tension: 0.2,
                    spanGaps: true
                },
                {
                    label: continentName,
                    data: continent,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40,167,69,0.1)',
                    tension: 0.2,
                    spanGaps: true
                },
                {
                    label: 'Global',
                    data: global,
                    borderColor: '#ff6b35',
                    backgroundColor: 'rgba(255,107,53,0.1)',
                    tension: 0.2,
                    spanGaps: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: {
                x: { title: { display: true, text: 'Year' } },
                y: { title: { display: true, text: 'Average Temperature (°C)' } }
            }
        }
    });
}

/* -------------------------------
   API 호출
-------------------------------- */
async function fetchRollupData(params) {
    const container = document.getElementById('rollup-result-container');
    container.innerHTML = `
        <p style="text-align:center; color:var(--color-primary); padding:30px;">
            <i class="fas fa-spinner fa-spin"></i> 데이터를 불러오는 중...
        </p>`;

    const result = await fetchData('analysis/temperature_rollup.php', params);

    if (!result || !result.success) {
        container.innerHTML = `
            <p style="text-align:center; color:#DC3545; padding:30px;">
                오류: ${result?.message || '데이터 조회 실패'}
            </p>`;
        return;
    }

    renderRollupResults(result);
}

/* -------------------------------
   국가 목록 로딩 (공통 API)
-------------------------------- */
async function populateCountrySelect() {
    const countrySelect = document.getElementById('rollup-country-id');
    const continentSelect = document.getElementById('rollup-continent');

    countrySelect.innerHTML = '<option value="">Select Country</option>';
    continentSelect.innerHTML = '<option value="">N/A</option>';
    continentSelect.disabled = true;

    const res = await fetchData('common/countries.php');

    if (res?.success && Array.isArray(res.data)) {
        res.data.forEach((c) => {
            const id = c.country_id ?? c.id;
            const name = c.country_name ?? c.name;
            if (!id || !name) return;

            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = name;
            countrySelect.appendChild(opt);
        });
    }
}

/* -------------------------------
   이벤트 등록
-------------------------------- */
function setupEventListeners() {
    const form = document.getElementById('rollup-filter-form');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const countryId = document.getElementById('rollup-country-id').value;
        const fromYear = document.getElementById('rollup-start-year').value;
        const toYear = document.getElementById('rollup-end-year').value;

        if (!countryId || !fromYear || !toYear) {
            alert('Country, From Year, To Year는 필수입니다.');
            return;
        }

        fetchRollupData({
            countryId: Number(countryId),
            fromYear: Number(fromYear),
            toYear: Number(toYear)
        });
    });
}

/* -------------------------------
   렌더
-------------------------------- */
export function render() {
    const html = `
        <div class="page-header" style="
            display:flex; justify-content:space-between; align-items:center;
            margin-bottom:var(--spacing-lg); padding-bottom:8px; border-bottom:1px solid #ddd;
        ">
            <h1 style="color:var(--color-primary);">
                <i class="fas fa-temperature-high" style="margin-right:10px;"></i>
                Global Temperature Roll-up
            </h1>
            <div class="btn btn-primary" style="background:none; color:var(--color-primary); font-size:1.1rem;">
                <i class="fas fa-user-circle"></i> Login
            </div>
        </div>

        <div class="card" style="margin-bottom:var(--spacing-lg);">
            <h2 style="margin-bottom:var(--spacing-md); color:var(--color-primary);">
                Analysis Settings
            </h2>

            <form id="rollup-filter-form" style="
                display:grid; grid-template-columns: 220px 1fr;
                gap: var(--spacing-sm) var(--spacing-lg);
                margin-top: var(--spacing-md); align-items:center;
            ">
                <label class="form-label">Country</label>
                <select id="rollup-country-id" style="padding:5px; width:260px;">
                    <option value="">Loading...</option>
                </select>

                <label class="form-label">Continent</label>
                <select id="rollup-continent" style="padding:5px; width:260px;" disabled>
                    <option value="">N/A</option>
                </select>

                <label class="form-label">Year Range</label>
                <div style="display:flex; gap:8px;">
                    <input type="number" id="rollup-start-year" value="1990" style="padding:5px; width:90px;" />
                    <span>~</span>
                    <input type="number" id="rollup-end-year" value="2020" style="padding:5px; width:90px;" />
                </div>

                <div style="grid-column:1 / -1; margin-top:var(--spacing-lg);">
                    <button type="submit" class="btn btn-nav" style="width:120px;">
                        Run
                    </button>
                </div>
            </form>
        </div>

        <div class="card">
            <h2 style="margin-bottom:var(--spacing-md); color:var(--color-primary);">
                Results & Visualization
            </h2>
            <h3 id="rollup-results-title" style="margin-bottom:var(--spacing-lg); color:#495057;">
                Analysis Results
            </h3>

            <div id="rollup-result-container" style="min-height:160px;">
                <p style="text-align:center; color:#6C757D; padding:30px;">
                    Country와 연도 범위를 설정하고 'Run' 버튼을 눌러주세요.
                </p>
            </div>
        </div>
    `;

    setTimeout(() => {
        populateCountrySelect();
        setupEventListeners();
    }, 0);

    return html;
}

export async function loadData() { return; }
