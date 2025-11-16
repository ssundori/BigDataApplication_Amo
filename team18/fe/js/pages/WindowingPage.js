export function render() {
    return `
        <div class="page-header">
            <h1 style="color: var(--color-primary);">Global Climate Windowing</h1>
            <p>Apply Moving Average analysis on global climate data series.</p>
        </div>

        <!-- 1. 분석 설정 (필터링 영역) -->
        <div class="card analysis-settings-card" style="margin-top: var(--spacing-lg);">
            <h2 style="color: var(--color-text-dark); border-bottom: 1px solid #eee; padding-bottom: var(--spacing-sm);">Analysis Settings</h2>
            
            <form id="windowing-filter-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-top: var(--spacing-md);">
                
                <!-- 1. 데이터 시리즈 선택 (data_series) -->
                <div>
                    <label for="data-series" class="form-label">Data Series</label>
                    <select id="data-series" name="data_series">
                        <option value="global_temp">Global Temperature</option>
                        <option value="sst_anomaly">Sea Surface Temperature Anomaly</option>
                        <option value="co2_concentration">CO2 Concentration (ppm)</option>
                    </select>
                </div>

                <!-- 2. 이동평균 구간 (window_size) -->
                <div>
                    <label for="window-size" class="form-label">Window Size (Years)</label>
                    <input type="number" id="window-size" name="window_size" value="5" min="2" max="20">
                </div>

                <!-- 3. 시작 연도 (start_year) -->
                <div>
                    <label for="start-year" class="form-label">Start Year</label>
                    <input type="number" id="start-year" name="start_year" value="1995" min="1900" max="2024">
                </div>

                <!-- 4. 종료 연도 (end_year) -->
                <div>
                    <label for="end-year" class="form-label">End Year</label>
                    <input type="number" id="end-year" name="end_year" value="2010" min="1900" max="2024">
                </div>
                
                <!-- 5. 지역 엔티티 (region_entity - SST Anomaly에 필요) -->
                <div>
                    <label for="region-entity" class="form-label">Region (SST Only)</label>
                    <select id="region-entity" name="region_entity">
                        <option value="World">World</option>
                        <option value="Northern Hemisphere">Northern Hemisphere</option>
                        <option value="Southern Hemisphere">Southern Hemisphere</option>
                    </select>
                </div>

                <!-- Submit Button -->
                <div style="align-self: end;">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <i class="fas fa-sync-alt"></i> Run Windowing
                    </button>
                </div>
            </form>
        </div>

        <!-- 2. 결과 및 시각화 영역 -->
        <div class="card visualization-area" style="margin-top: var(--spacing-lg);">
            <h2 style="color: var(--color-primary);">Temperature Trend (1995-2010)</h2>
            
            <!-- 이동평균 라인 차트가 렌더링될 Canvas -->
            <div id="windowing-chart-container" style="height: 400px; margin-top: var(--spacing-md); background-color: var(--color-surface); border-radius: var(--border-radius);">
                <canvas id="windowing-chart"></canvas>
            </div>
            
            <p style="margin-top: var(--spacing-md);">Description: 5-year moving average of global annual temperatures</p>
        </div>
    `;
}
