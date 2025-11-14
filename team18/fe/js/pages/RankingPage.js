export function render() {
    return `
        <div class="page-header">
            <h1 style="color: var(--color-primary);">Global Disaster Ranking</h1>
            <p>Analyze disaster rankings based on selected metrics and time frames.</p>
        </div>

        <!-- 1. 분석 설정 (필터링 영역) -->
        <div class="card analysis-settings-card" style="margin-top: var(--spacing-lg);">
            <h2 style="color: var(--color-text-dark); border-bottom: 1px solid #eee; padding-bottom: var(--spacing-sm);">Analysis Settings</h2>
            
            <form id="ranking-filter-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-top: var(--spacing-md);">
                
                <!-- 1. 순위 기준 지표 (rank_by) -->
                <div>
                    <label for="rank-by" class="form-label">Rank By (Metric)</label>
                    <select id="rank-by" name="rank_by">
                        <option value="total_deaths">Total Deaths</option>
                        <option value="total_affected">Total Affected</option>
                        <option value="total_damage_thousand_usd">Total Damage (USD)</option>
                    </select>
                </div>

                <!-- 2. 시작 연도 (start_year) -->
                <div>
                    <label for="start-year" class="form-label">Start Year</label>
                    <input type="number" id="start-year" name="start_year" value="2010" min="1900" max="2024">
                </div>

                <!-- 3. 종료 연도 (end_year) -->
                <div>
                    <label for="end-year" class="form-label">End Year</label>
                    <input type="number" id="end-year" name="end_year" value="2022" min="1900" max="2024">
                </div>
                
                <!-- 4. 대륙 필터링 (continent_id) -->
                <div>
                    <label for="continent-id" class="form-label">Continent</label>
                    <select id="continent-id" name="continent_id">
                        <option value="">All Continents</option>
                        <option value="2">Asia (Mock)</option>
                        <!-- 실제 데이터베이스에서 대륙 목록을 가져와야 함 -->
                    </select>
                </div>

                <!-- 5. 재해 유형 필터링 (disaster_type_id) -->
                <div>
                    <label for="disaster-type-id" class="form-label">Disaster Type</label>
                    <select id="disaster-type-id" name="disaster_type_id">
                        <option value="">All Disaster Types</option>
                        <option value="5">Flood (Mock)</option>
                        <!-- 실제 데이터베이스에서 재해 유형 목록을 가져와야 함 -->
                    </select>
                </div>
                
                <!-- Submit Button -->
                <div style="align-self: end;">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <i class="fas fa-chart-bar"></i> Analyze Ranking
                    </button>
                </div>
            </form>
        </div>

        <!-- 2. 결과 및 시각화 영역 -->
        <div class="card visualization-area" style="margin-top: var(--spacing-lg);">
            <h2 style="color: var(--color-primary);">Results & Visualization</h2>
            
            <!-- 그래프가 렌더링될 Canvas -->
            <div id="ranking-chart-container" style="height: 400px; margin-top: var(--spacing-md); background-color: var(--color-background); border-radius: var(--border-radius);">
                <canvas id="ranking-chart"></canvas>
            </div>
            
            <!-- 순위 테이블 -->
            <h3 style="margin-top: var(--spacing-lg);">Top 10 Disasters by Total Deaths (2010-2022)</h3>
            <div id="ranking-table-container" style="overflow-x: auto; margin-top: var(--spacing-md);">
                <!-- 순위 데이터 테이블이 JS에 의해 여기에 생성됩니다 -->
                <p>Loading ranking data...</p>
            </div>
        </div>
    `;
}