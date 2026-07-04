/* Logi_Assist - Login / Register / Guest mode logic */

const AuthUI = {

    currentTab: 'login',

    init() {
        document.getElementById('tab-login').addEventListener('click', () => this.switchTab('login'));
        document.getElementById('tab-register').addEventListener('click', () => this.switchTab('register'));

        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));

        document.getElementById('guest-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.enterAsGuest();
        });

        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    },

    switchTab(tab) {
        this.currentTab = tab;
        document.getElementById('tab-login').classList.toggle('active', tab === 'login');
        document.getElementById('tab-register').classList.toggle('active', tab === 'register');
        document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
        this.hideError();
    },

    showError(msg) {
        const el = document.getElementById('auth-error');
        el.textContent = msg;
        el.classList.add('show');
    },

    hideError() {
        document.getElementById('auth-error').classList.remove('show');
    },

    async handleLogin(e) {
        e.preventDefault();
        this.hideError();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');

        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Logging in...';

        try {
            const res = await LogiAPI.login(email, password);
            LogiAPI.setToken(res.token);
            LogiAPI.setUser({ email: res.email, fullName: res.fullName, plan: res.plan });
            App.enterApp();
        } catch (err) {
            this.showError(err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Login';
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        this.hideError();
        const fullName = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const btn = document.getElementById('register-btn');

        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Creating account...';

        try {
            const res = await LogiAPI.register(fullName, email, password);
            LogiAPI.setToken(res.token);
            LogiAPI.setUser({ email: res.email, fullName: res.fullName, plan: res.plan });
            App.enterApp();
        } catch (err) {
            this.showError(err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    },

    enterAsGuest() {
        LogiAPI.clearToken();
        LogiAPI.setUser({ email: null, fullName: 'Guest', plan: 'GUEST' });
        App.enterApp();
    },

    logout() {
        LogiAPI.clearToken();
        location.reload();
    }
};
