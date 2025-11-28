// fe/js/pages/AggregationPage.js
import { fetchData } from '../../utils/api.js';

/**
 * 결과 영역 렌더링
 */
function renderAggregationResults(result, measureLabel, yearRangeLabel) {
    const container = document.getElementById('aggregation-result-container');
    const titleEl = document.getElementById('aggregation-results-title');

    if (!container || !titleEl) return;

    if (!result || !result.success) {
        titleEl.textContent = '데이터 조회 실패';
        container.innerHTML = `
            <p style="text-align: center; color: #DC3545; padding: 30px;">
                데이터를 불러오는 중 오류가 발생했습니다.
            </p>
        `;
        return;
    }

    const overall = result.overall || {};
    const byYear = Array.isArray(result.byYear) ? result.byYear : [];

    titleEl.textContent = `Aggregated Results (${yearRangeLabel}) - ${measureLabel}`;

    const sumVal = (overall.sum ?? 0).toLocaleString();
    const avgVal = (overall.avg ?? 0).toLocaleString();

    let html = `
        <div style="
            display: flex;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
            flex-wrap: wrap;
        ">
            <div class="card" style="flex: 1 1 220px; padding: 16px;">
                <div style="font-size: 0.9rem; color: #6C757D;">Total ${measureLabel}</div>
                <div style="font-size: 1.6rem; font-weight: 700; margin-top: 6px;">${sumVal}</div>
            </div>
            <div class="card" style="flex: 1 1 220px; padding: 16px;">
                <div style="font-size: 0.9rem; color: #6C757D;">Average per Year</div>
                <div style="font-size: 1.6rem; font-weight: 700; margin-top: 6px;">${avgVal}</div>
            </div>
        </div>
    `;

    if (byYear.length > 0) {
        html += `
            <h4 style="margin: 8px 0 4px; color: #495057;">Yearly Trend</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 0.9rem;">
                <thead>
                    <tr style="background-color: #e9ecef;">
                        <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left;">Year</th>
                        <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">Sum</th>
                        <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">Average</th>
                    </tr>
                </thead>
                <tbody>
                    ${byYear.map(row => `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #dee2e6;">${row.year}</td>
                            <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">${(row.sum ?? 0).toLocaleString()}</td>
                            <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">${(row.avg ?? 0).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        html += `
            <p style="text-align: center; color: #6C757D; padding: 24px;">
                연도별 상세 데이터가 없습니다.
            </p>
        `;
    }

    container.innerHTML = html;
}

/**
 * Aggregation API 호출
 */
async function fetchAggregationData(params, measureLabel) {
    const container = document.getElementById('aggregation-result-container');
    const titleEl = document.getElementById('aggregation-results-title');

    if (!container || !titleEl) return;

    container.innerHTML = `
        <p style="text-align: center; color: var(--color-primary); padding: 30px;">
            <i class="fas fa-spinner fa-spin"></i> 데이터를 불러오는 중...
        </p>
    `;

    const result = await fetchData('analysis/aggregation.php', params);

    if (!result || !result.success) {
        titleEl.textContent = '데이터 조회 실패';
        container.innerHTML = `
            <p style="text-align: center; color: #DC3545; padding: 30px;">
                오류: ${result?.message || '데이터 조회 실패'}
            </p>
        `;
        return;
    }

    const yearRangeLabel = `${params.fromYear} ~ ${params.toYear}`;
    renderAggregationResults(result, measureLabel, yearRangeLabel);
}

/**
 * 필터 select 박스 채우기
 */
async function populateFilters() {
    const continentSelect = document.getElementById('agg-continent-id');
    const disasterSelect = document.getElementById('agg-disaster-type-id');

    if (!continentSelect || !disasterSelect) return;

    try {
        const contData = await fetchData('common/continents.php');
        if (contData?.success) {
            let html = '<option value="">Select Continent</option>';
            contData.data.forEach(c => {
                html += `<option value="${c.id}">${c.name}</option>`;
            });
            continentSelect.innerHTML = html;
        }

        const typeData = await fetchData('common/disaster_types.php');
        if (typeData?.success) {
            let html = '<option value="">Select Disaster Type</option>';
            typeData.data.forEach(d => {
                html += `<option value="${d.id}">${d.type} (${d.group})</option>`;
            });
            disasterSelect.innerHTML = html;
        }
    } catch (err) {
        console.error('Aggregation filter error:', err);
    }
}

/**
 * 폼 이벤트 등록
 */
function setupEventListeners() {
    const form = document.getElementById('agg-filter-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const measure = document.getElementById('agg-measure').value;
        const fromYear = document.getElementById('agg-start-year').value;
        const toYear = document.getElementById('agg-end-year').value;
        const continentVal = document.getElementById('agg-continent-id').value;
        const disasterVal = document.getElementById('agg-disaster-type-id').value;

        if (!measure || !fromYear || !toYear || !continentVal || !disasterVal) {
            alert('모든 필터를 선택해주세요.');
            return;
        }

        const params = {
            measure, // deaths | affected | damage
            fromYear: parseInt(fromYear, 10),
            toYear: parseInt(toYear, 10),
            continentId: parseInt(continentVal, 10),
            disasterTypeId: parseInt(disasterVal, 10)
        };

        const measureLabelMap = {
            deaths: 'Total Deaths',
            affected: 'Total Affected',
            damage: 'Total Damage (USD)'
        };

        const measureLabel = measureLabelMap[measure] || measure;

        fetchAggregationData(params, measureLabel);
    });
}

/**
 * 페이지 렌더링
 * - Ranking / Roll-up 이랑 스타일 맞춰서 작성
 */
export function render() {
    const htmlContent = `
        <div class="page-header" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-lg);
            padding-bottom: 8px;
            border-bottom: 1px solid #ddd;
        ">
            <h1 style="color: var(--color-primary);">
                <i class="fas fa-layer-group" style="margin-right: 10px;"></i>
                Global Disaster Aggregation
            </h1>
            <!-- ✅ 공통 로그인/닉네임/로그아웃 영역 -->
            <div class="js-auth-area"></div>
        </div>

        <div class="analysis-settings-card card" style="margin-bottom: var(--spacing-lg);">
            <h2 style="margin-bottom: var(--spacing-md); color: var(--color-primary);">Analysis Settings</h2>

            <form id="agg-filter-form" style="
                display: grid;
                grid-template-columns: 200px 1fr;
                gap: var(--spacing-sm) var(--spacing-lg);
                margin-top: var(--spacing-md);
                align-items: center;
            ">
                <label for="agg-measure" class="form-label">Measure</label>
                <select id="agg-measure" name="measure" style="padding: 5px; width: 200px;">
                    <option value="deaths" selected>Total Deaths</option>
                    <option value="affected">Total Affected</option>
                    <option value="damage">Total Damage (USD)</option>
                </select>

                <label class="form-label">Date Range (1999~2025)</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="number" id="agg-start-year" value="2022" min="1999" max="2025" style="padding: 5px; width: 90px;">
                    <span>~</span>
                    <input type="number" id="agg-end-year" value="2022" min="1999" max="2025" style="padding: 5px; width: 90px;">
                </div>

                <label for="agg-continent-id" class="form-label">Continent Filter</label>
                <select id="agg-continent-id" name="continent_id" style="padding: 5px; width: 200px;">
                    <option value="">Select Continent</option>
                </select>

                <label for="agg-disaster-type-id" class="form-label">Disaster Filter</label>
                <select id="agg-disaster-type-id" name="disaster_type_id" style="padding: 5px; width: 220px;">
                    <option value="">Select Disaster Type</option>
                </select>

                <div style="grid-column: 1 / -1; margin-top: var(--spacing-lg);">
                    <button type="submit" class="btn btn-nav" style="width: 100px; padding: 10px 15px; text-align: center;">Run</button>
                </div>
            </form>
        </div>

        <div class="card">
            <h2 style="margin-bottom: var(--spacing-md); color: var(--color-primary);">Results & Visualization</h2>
            <h3 id="aggregation-results-title" style="margin-bottom: var(--spacing-lg); color: #495057;">Analysis Results</h3>

            <div id="aggregation-result-container" style="min-height: 160px;">
                <p style="text-align: center; color: #6C757D; padding: 30px;">
                    집계 분석을 위해 상단 필터를 설정하고 'Run' 버튼을 눌러주세요.
                </p>
            </div>
        </div>
    `;

    // DOM에 붙은 다음에 필터/이벤트 세팅
    setTimeout(() => {
        populateFilters();
        setupEventListeners();
    }, 0);

    return htmlContent;
}
