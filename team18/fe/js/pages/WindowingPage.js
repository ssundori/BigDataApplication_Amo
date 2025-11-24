// WindowingPage.js

import { fetchData } from '../../utils/api.js';

// Chart.js 라이브러리 로드를 가정
// import Chart from 'path/to/chart.js'; 

// 헬퍼 함수: 로딩 상태 표시
function showLoading(isLoading) {
    const placeholder = document.getElementById('windowing-chart-placeholder');
    const title = document.getElementById('windowing-title');
    if (isLoading) {
        placeholder.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 데이터를 불러오는 중입니다...';
        title.textContent = '이동 평균 계산 중...';
        placeholder.style.display = 'flex';
    } else {
    }
}

// 윈도잉 실행 핸들러
async function handleRunWindowing() {
    
    // DOM 요소에서 직접 값 가져오기
    const windowSize = document.getElementById('window-size').value;
    const dataSeries = document.getElementById('data-series').value;
    const startYear = document.getElementById('date-start').value;
    const endYear = document.getElementById('date-end').value;
    const regionEntity = document.getElementById('region-entity').value;
    
    // 쿼리 파라미터 객체 생성
    const params = {
        data_series: dataSeries,
        window_size: parseInt(windowSize),
        start_year: parseInt(startYear),
        end_year: parseInt(endYear),
        region_entity: regionEntity,
    };

    showLoading(true);

    const result = await fetchData('analysis/windowing.php', params);

    // showLoading(false); // 차트 렌더링 함수 내에서 상태 업데이트 예정

    if (result.status === 'success') {
        renderWindowingChart(result); 
    } else {
        const titleElement = document.getElementById('windowing-title');
        const placeholder = document.getElementById('windowing-chart-placeholder');
        
        // 오류 처리
        titleElement.textContent = '데이터 조회 실패';
        placeholder.style.display = 'flex';
        placeholder.innerHTML = `<p style="color: #DC3545; padding: 30px;">오류: ${result.error.message || '알 수 없는 오류'}</p>`;
    }
}

// 차트 렌더링 (Chart.js 필요)
function renderWindowingChart(result) {
    const { data, meta } = result;
    const titleElement = document.getElementById('windowing-title');
    const placeholder = document.getElementById('windowing-chart-placeholder');
    
    titleElement.textContent = meta.description || '이동 평균 계산 결과';
    
    // 차트 데이터가 있을 경우
    if (data && data.length > 0) {
        // 실제 차트 라이브러리 (Chart.js)를 사용하여 데이터를 시각화해야 함.
        // 현재는 차트 라이브러리가 없으므로 메시지만 출력
        placeholder.style.display = 'flex';
        placeholder.textContent = `조회 성공. ${data.length}개 레코드. (차트 라이브러리 필요)`;
        // [Image of Line chart showing 5-year moving average of global annual temperatures]
 
    } else {
        placeholder.style.display = 'flex';
        placeholder.textContent = '조회된 데이터가 없습니다.';
    }
}

// 이벤트 리스너 설정 함수
function setupEventListeners() {
    const runBtn = document.getElementById('run-windowing-btn');
    if (runBtn) {
        runBtn.addEventListener('click', handleRunWindowing);
    }
    
    // SST Entity 필터링 로직: data_series에 따라 region_entity를 활성화/비활성화
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
        toggleRegionEntity(); // 초기 상태 설정
        dataSeriesSelect.addEventListener('change', toggleRegionEntity);
    }
}


export function render() {
    return `
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg); padding-bottom: 8px; border-bottom: 1px solid #ddd;">
            <h1 style="color: var(--color-primary);"><i class="fas fa-chart-line" style="margin-right: 10px;"></i>Time Series Windowing</h1>
            <div class="btn btn-primary" style="background: none; color: var(--color-primary); font-size: 1.1rem; font-weight: bold; padding: 0;">
                <i class="fas fa-user-circle"></i> Login
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

                <label class="form-label">Date Range (1990~2025)</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="number" id="date-start" name="start_year" value="1995" min="1990" max="2024" style="padding: 5px; width: 100px;">
                    <span>~</span>
                    <input type="number" id="date-end" name="end_year" value="2010" min="1990" max="2025" style="padding: 5px; width: 100px;">
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

            <div id="windowing-chart-area" style="height: 400px; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center; position: relative;">
                <canvas id="windowing-chart" style="width: 100%; height: 100%;"></canvas>
                <p id="windowing-chart-placeholder" style="position: absolute; color: #6C757D; font-size: 1.1rem;">'Run' 버튼을 눌러 시계열 데이터를 조회하세요.</p>
            </div>
        </div>
        
    `;
    // 이벤트 리스너 설정 함수를 setTimeout으로 호출하여 DOM 삽입 후 실행 보장
    setTimeout(setupEventListeners, 0);

    return htmlContent;
}