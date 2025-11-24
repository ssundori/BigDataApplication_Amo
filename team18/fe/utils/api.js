// fe/utils/api.js

const BASE_URL = '/team18/api/'; 

/**
 * 데이터를 Fetch하는 공통 함수 (GET 요청)
 * - 서버에 파일이 없으면 에러(404)를 그대로 반환함.
 */
export async function fetchData(endpoint, params = {}) { 
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}?${queryString}`; 

    try {
        // console.log(`Requesting: ${url}`); // 디버깅용 로그 (필요시 주석 해제)

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 1. 권한 없음 처리
        if (response.status === 401) {
            return { success: false, error: { message: '로그인이 필요합니다.' } };
        }

        // 2. 파일 없음(404) 또는 서버 에러(500) 처리
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({})); // JSON 에러 메시지가 있으면 읽기
            throw new Error(errorBody.message || `서버 오류 (${response.status})`);
        }

        // 3. 성공 시 JSON 반환
        const result = await response.json();
        return result;

    } catch (error) {
        console.error('API Fetch Error:', error);
        // 화면이 멈추지 않도록 에러 객체 반환
        return { success: false, error: { message: error.message } };
    }
}