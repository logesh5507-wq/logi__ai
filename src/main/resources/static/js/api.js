/* Logi_Assist - API communication layer */

const API_BASE = '/api';

const LogiAPI = {

    getToken() {
        return localStorage.getItem('logi_token');
    },

    setToken(token) {
        localStorage.setItem('logi_token', token);
    },

    clearToken() {
        localStorage.removeItem('logi_token');
        localStorage.removeItem('logi_user');
    },

    setUser(user) {
        localStorage.setItem('logi_user', JSON.stringify(user));
    },

    getUser() {
        const raw = localStorage.getItem('logi_user');
        return raw ? JSON.parse(raw) : null;
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    async request(path, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(API_BASE + path, { ...options, headers });
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : await response.text();

        if (!response.ok) {
            const message = (data && data.error) || (data && data.message) || 'Request failed';
            throw new Error(message);
        }
        return data;
    },

    // ---------- Auth ----------
    register(fullName, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password })
        });
    },

    login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    // ---------- SQL ----------
    processSql(input, mode) {
        const path = this.isLoggedIn() ? '/sql/process' : '/sql/guest/process';
        return this.request(path, {
            method: 'POST',
            body: JSON.stringify({ input, mode })
        });
    },

    // ---------- History ----------
    getHistory() {
        return this.request('/history', { method: 'GET' });
    },

    deleteHistory(id) {
        return this.request(`/history/${id}`, { method: 'DELETE' });
    },

    // ---------- File query (multipart, handled separately since it's not JSON) ----------
    async queryFile(file, question) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('question', question);

        const headers = {};
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(API_BASE + '/file/query', {
            method: 'POST',
            headers,
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || data.message || 'File query failed');
        return data;
    }
};
