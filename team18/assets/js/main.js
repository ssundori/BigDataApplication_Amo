function getToken() {
    return localStorage.getItem('jwt_token') || '';
}

function authHeaders() {
    const token = getToken();
    return token
        ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };
}
