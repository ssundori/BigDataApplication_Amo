// fe/utils/api.js

const BASE_URL = 'http://localhost/team18/api';

/**
 * GET 요청용 헬퍼
 *  - path: 'analysis/ranking.php' 처럼 api 이하 경로
 *  - params: { a: 1, b: 2 } => ?a=1&b=2
 */
export async function fetchData(path, params = {}) {
    try {
        const url = new URL(`${BASE_URL}/${path}`, window.location.origin);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.append(key, value);
            }
        });

        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await res.json();
        return data;
    } catch (err) {
        console.error('fetchData error:', err);
        return {
            success: false,
            error: { message: '네트워크 오류가 발생했습니다.' }
        };
    }
}

/**
 * POST 요청용 헬퍼 (DataManageAddPage에서 사용)
 *  - path: 'auth/register.php' 처럼 api 이하 경로
 *  - body: { ... } => JSON
 */
export async function postData(path, body = {}) {
    try {
        const res = await fetch(`${BASE_URL}/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        return data;
    } catch (err) {
        console.error('postData error:', err);
        return {
            success: false,
            error: { message: '네트워크 오류가 발생했습니다.' }
        };
    }
}
