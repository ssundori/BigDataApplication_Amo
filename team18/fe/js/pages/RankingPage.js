// fe/js/pages/RankingPage.js

import { fetchData } from '../../utils/api.js';

/**
 * 랭킹 테이블을 렌더링합니다.
 */
function renderRankingResults(data, rankByLabel, title) {
    const container = document.getElementById('ranking-table-container');
    const titleElement = document.getElementById('ranking-results-title');

    titleElement.textContent = title;
    
    try {
        const tableHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.95rem;">
                <thead>
                    <tr style="background-color: #e9ecef;">
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left; width: 50px;">Rank</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Country</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Disaster Type</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Value (${rankByLabel})</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => {
                        const value = item.measure_value ? Number(item.measure_value) : 0;
                        return `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${item.rank}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${item.country_name || '-'}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${item.disaster_type || '-'}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${value.toLocaleString()}</td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = tableHtml;
    } catch (e) {
        console.error("Rendering Error:", e);
        container.innerHTML = `<p style="color: red; text-align: center;">데이터 렌더링 중 오류가 발생했습니다.<br>(${e.message})</p>`;
    }
}

async function fetchRankingData(params, rankByLabel) {
    const container = document.getElementById('ranking-table-container');
    container.innerHTML = '<p style="text-align: center; color: var(--color-primary); padding: 30px;"><i class="fas fa-spinner fa-spin"></i> 데이터를 불러오는 중...</p>';
    
    try {
        const result = await fetchData('analysis/ranking.php', params);

        if (result.success) { 
            const rangeText = `${params.start_year} ~ ${params.end_year}`;
            const title = `Top ${result.meta.total_records} Disasters by ${rankByLabel} (${rangeText})`;
            
            renderRankingResults(result.data, rankByLabel, title);
        } else {
            container.innerHTML = `<p style="text-align: center; color: #DC3545; padding: 30px;">오류: ${result.error?.message || '데이터 조회 실패'}</p>`;
            const titleEl = document.getElementById('ranking-results-title');
            if(titleEl) titleEl.textContent = '데이터 조회 실패';
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        container.innerHTML = `<p style="text-align: center; color: #DC3545; padding: 30px;">치명적 오류 발생: ${error.message}</p>`;
    }
}

function setupEventListeners() {
    const form = document.getElementById('ranking-filter-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const rankBy = document.getElementById('rank-by').value;
            const startYear = document.getElementById('start-year').value;
            const endYear = document.getElementById('end-year').value;
            const continentId = document.getElementById('continent-id').value;
            const disasterTypeId = document.getElementById('disaster-type-id').value;

            const params = {
                rank_by: rankBy,
                start_year: parseInt(startYear),
                end_year: parseInt(endYear),
                continent_id: continentId ? parseInt(continentId) : undefined,
                disaster_type_id: disasterTypeId ? parseInt(disasterTypeId) : undefined,
            };

            const rankByLabelMap = {
                'total_deaths': 'Total Deaths',
                'total_affected': 'Total Affected',
                'total_damage_thousand_usd': 'Total Damage (USD)'
            };
            const rankByLabel = rankByLabelMap[rankBy] || rankBy;

            fetchRankingData(params, rankByLabel);
        });
    }
}

export async function populateFilters() {
    const continentSelect = document.getElementById('continent-id');
    const disasterSelect = document.getElementById('disaster-type-id');

    try {
        const contData = await fetchData('common/continents.php');
        if (contData && contData.success) {
            let html = '<option value="">All Continent</option>';
            contData.data.forEach(c => {
                html += `<option value="${c.id}">${c.name}</option>`;
            });
            if(continentSelect) continentSelect.innerHTML = html;
        }

        const typeData = await fetchData('common/disaster_types.php');
        if (typeData && typeData.success) {
            let html = '<option value="">All Type</option>';
            typeData.data.forEach(d => {
                const typeName = d.subtype || d.type || "Unknown";
                html += `<option value="${d.id}">${typeName} (${d.group})</option>`;
            });
            if(disasterSelect) disasterSelect.innerHTML = html;
        }

    } catch (e) {
        console.error("Filter Load Error", e);
    }
}

export function render() {
    const htmlContent = `
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg); padding-bottom: 8px; border-bottom: 1px solid #ddd;">
            <h1 style="color: var(--color-primary);"><i class="fas fa-trophy" style="margin-right: 10px;"></i>Global Disaster Ranking</h1>
            <!-- ✅ 공통 로그인/닉네임/로그아웃 영역 -->
            <div class="js-auth-area"></div>
            </div>
        </div>

        <div class="analysis-settings-card card" style="margin-bottom: var(--spacing-lg);">
            <h2 style="margin-bottom: var(--spacing-md); color: var(--color-primary);">Analysis Settings</h2>
            
            <form id="ranking-filter-form" style="
                display: grid; 
                grid-template-columns: 200px 1fr; 
                gap: var(--spacing-sm) var(--spacing-lg); 
                margin-top: var(--spacing-md);
                align-items: center; 
            ">
                
                <label for="rank-by" class="form-label">Rank By (Metric)</label>
                <select id="rank-by" name="rank_by" style="padding: 5px; width: 250px;">
                    <option value="total_deaths" selected>Total Deaths</option>
                    <option value="total_affected">Total Affected</option>
                    <option value="total_damage_thousand_usd">Total Damage (USD)</option>
                </select>

                <label for="start-year" class="form-label">Start Year</label>
                <input type="number" id="start-year" name="start_year" value="2010" min="1900" max="2025" style="padding: 5px; width: 100px;">

                <label for="end-year" class="form-label">End Year</label>
                <input type="number" id="end-year" name="end_year" value="2022" min="1900" max="2025" style="padding: 5px; width: 100px;">
                
                 <label for="continent-id" class="form-label">Continent Filter</label>
                <select id="continent-id" name="continent_id" style="padding: 5px; width: 200px;">
                    <option value="" selected>All Continent</option>
                    <option value="2">Asia (Mock)</option>
                </select>

                 <label for="disaster-type-id" class="form-label">Disaster Filter</label>
                <select id="disaster-type-id" name="disaster_type_id" style="padding: 5px; width: 200px;">
                    <option value="" selected>All Type</option>
                    <option value="5">Flood (Mock)</option>
                </select>
                
                <div style="grid-column: 1 / -1; margin-top: var(--spacing-lg);">
                    <button type="submit" class="btn btn-nav" style="width: 100px; padding: 10px 15px; text-align: center;">Run</button>
                </div>
            </form>
        </div>

        <div class="ranking-results-card card">
            <h2 style="margin-bottom: var(--spacing-md); color: var(--color-primary);">Results & Visualization</h2>
            <h3 id="ranking-results-title" style="margin-bottom: var(--spacing-lg); color: #495057;">Analysis Results</h3>

            <div id="ranking-table-container" style="overflow-x: auto; margin-top: var(--spacing-md);">
                <p style="text-align: center; color: #6C757D; padding: 30px;">순위 분석을 위해 상단 필터를 설정하고 'Run' 버튼을 눌러주세요.</p>
            </div>
        </div>
    `;

    // 이벤트 리스너와 필터 데이터 로딩을 동시에 실행
    setTimeout(() => {
        setupEventListeners();
        populateFilters();
    }, 0);

    return htmlContent;
}
