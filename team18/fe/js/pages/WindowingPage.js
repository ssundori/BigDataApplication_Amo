// fe/js/pages/WindowingPage.js

import { fetchData } from '../../utils/api.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/auto/+esm';

let myChart = null;

function showLoading(isLoading) {
    const placeholder = document.getElementById('windowing-chart-placeholder');
    const title = document.getElementById('windowing-title');
    const canvas = document.getElementById('windowing-chart');

    if (isLoading) {
        if(placeholder) {
            placeholder.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 데이터를 불러오는 중입니다...';
            placeholder.style.display = 'flex';
        }
        if(title) title.textContent = '이동 평균 계산 중...';
        if(canvas) canvas.style.display = 'none'; 
    }
}

async function handleRunWindowing() {
    console.log("Run 버튼 클릭됨!");

    const windowSize = document.getElementById('window-size').value;
    const dataSeries = document.getElementById('data-series').value;
    const startYear = document.getElementById('date-start').value;
    const endYear = document.getElementById('date-end').value;
    const regionEntity = document.getElementById('region-entity').value;
    
    const params = {
        data_series: dataSeries,
        window_size: parseInt(windowSize),
        start_year: parseInt(startYear),
        end_year: parseInt(endYear),
        region_entity: regionEntity,
    };

    showLoading(true);

    const result = await fetchData('analysis/windowing.php', params);

    if (result.success) {
        renderWindowingChart(result); 
    } else {
        const titleElement = document.getElementById('windowing-title');
        const placeholder = document.getElementById('windowing-chart-placeholder');
        
        if(titleElement) titleElement.textContent = '데이터 조회 실패';
        if(placeholder) {
            placeholder.style.display = 'flex';
            placeholder.innerHTML = `<p style="color: #DC3545; padding: 30px;">오류: ${result.error?.message || '알 수 없는 오류'}</p>`;
        }
    }
}

// ★★★ 차트 그리는 핵심 함수 ★★★
function renderWindowingChart(result) {
    const { data, meta } = result;
    const titleElement = document.getElementById('windowing-title');
    const placeholder = document.getElementById('windowing-chart-placeholder');
    const canvas = document.getElementById('windowing-chart');
    
    if(titleElement) titleElement.textContent = meta.description || '이동 평균 계산 결과';
    
    // 데이터가 없으면 안내 문구 표시
    if (!data || data.length === 0) {
        if(placeholder) {
            placeholder.style.display = 'flex';
            placeholder.textContent = '조회된 데이터가 없습니다.';
        }
        if(canvas) canvas.style.display = 'none';
        return;
    }

    if(placeholder) placeholder.style.display = 'none';
    if(canvas) canvas.style.display = 'block';

    // 1. 기존 차트가 있으면 삭제
    if (myChart) {
        myChart.destroy();
    }

    // 2. 데이터 가공 (X축: 연도, Y축: 값)
    const labels = data.map(item => item.year);
    const originalValues = data.map(item => item.original_value);
    const movingAvgValues = data.map(item => item.moving_avg);

    // 3. 차트 그리기
    const ctx = canvas.getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Original Value',
                    data: originalValues,
                    borderColor: 'rgba(200, 200, 200, 0.5)', // 연한 회색
                    backgroundColor: 'rgba(200, 200, 200, 0.1)',
                    borderWidth: 1,
                    pointRadius: 2,
                    tension: 0.1
                },
                {
                    label: `Moving Average (${meta.query.window_size}-year)`,
                    data: movingAvgValues,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            scales: {
                x: { title: { display: true, text: 'Year' } },
                y: { title: { display: true, text: `Value (${meta.unit})` } }
            }
        }
    });
}

// 이벤트 리스너 설정 함수
function setupEventListeners() {
    console.log("이벤트 리스너 설정 시작");
    const runBtn = document.getElementById('run-windowing-btn');
    if (runBtn) {
        runBtn.addEventListener('click', handleRunWindowing);
    }
    
    const dataSeriesSelect = document.getElementById('data-series');
    const regionEntitySelect = document.getElementById('region-entity');
    const regionEntityLabel = regionEntitySelect ? regionEntitySelect.previousElementSibling : null;

    const toggleRegionEntity = () => {
        const isSstAnomaly = dataSeriesSelect.value === 'sst_anomaly';
        if (regionEntitySelect) {
            regionEntitySelect.disabled = !isSstAnomaly;
            regionEntitySelect.style.opacity = isSstAnomaly ? '1' : '0.5';
        }
        if (regionEntityLabel) {
             regionEntityLabel.style.opacity = isSstAnomaly ? '1' : '0.5';
        }
    };

    if (dataSeriesSelect) {
        toggleRegionEntity();
        dataSeriesSelect.addEventListener('change', toggleRegionEntity);
    }
}

export function render() {
    const htmlContent = `
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg); padding-bottom: 8px; border-bottom: 1px solid #ddd;">
            <h1 style="color: var(--color-primary);"><i class="fas fa-chart-line" style="margin-right: 10px;"></i>Time Series Windowing</h1>
            <!-- ✅ 공통 로그인/닉네임/로그아웃 영역 -->
            <div class="js-auth-area"></div>
            </div>
        </div>

        <div class="card analysis-settings-card" style="margin-bottom: var(--spacing-lg);">
            <h2 style="margin-bottom: var(--spacing-md); color: var(--color-primary);">Analysis Settings</h2>
            
            <form id="windowing-filter-form" style="display: grid; grid-template-columns: 200px 1fr; gap: var(--spacing-sm) var(--spacing-lg); align-items: center;">
                
                <label for="window-size" class="form-label">Window Size (Years)</label>
                <select id="window-size" name="window_size" style="padding: 5px; width: 100px;">
                    <option value="5" selected>5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                </select>

                <label class="form-label" style="align-self: flex-start; margin-top: 5px;">Data Series</label>
                <select id="data-series" name="data_series" style="padding: 5px; width: 250px;">
                    <option value="global_temp" selected>Global Avg. Temperature</option>
                    <option value="sst_anomaly">Sea Surface Temperature Anomaly (SST)</option>
                    <option value="co2_concentration">CO2 Concentration (ppm)</option>
                </select>

                <label class="form-label">Date Range (1940~2025)</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="number" id="date-start" name="start_year" value="1940" min="1940" max="2024" style="padding: 5px; width: 100px;">
                    <span>~</span>
                    <input type="number" id="date-end" name="end_year" value="2025" min="1950" max="2025" style="padding: 5px; width: 100px;">
                </div>
                
                <label for="region-entity" class="form-label">Region (SST Only)</label>
                <select id="region-entity" name="region_entity" style="padding: 5px; width: 200px;">
                    <option value="World" selected>World</option>
                    <option value="Northern Hemisphere">Northern Hemisphere</option>
                    <option value="Southern Hemisphere">Southern Hemisphere</option>
                </select>
                
            </form>
            
            <button type="button" class="btn btn-nav" id="run-windowing-btn" style="margin-top: var(--spacing-lg); width: 100px; padding: 10px 15px; text-align: center;">Run</button>
        </div>

        <div class="windowing-results-card card">
            <h2 style="margin-bottom: var(--spacing-md); color: var(--color-primary);">Results & Visualization</h2>
            <h3 id="windowing-title" style="margin-bottom: var(--spacing-lg); color: #495057;">이동 평균 결과 (데이터 없음)</h3>

            <div id="windowing-chart-area" style="height: 400px; background-color: #fff; border: 1px solid #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center; position: relative;">
                <canvas id="windowing-chart" style="width: 100%; height: 100%; display: none;"></canvas>
                <p id="windowing-chart-placeholder" style="position: absolute; color: #6C757D; font-size: 1.1rem;">'Run' 버튼을 눌러 시계열 데이터를 조회하세요.</p>
            </div>
        </div>
    `;

    setTimeout(setupEventListeners, 0);
    return htmlContent;
}
