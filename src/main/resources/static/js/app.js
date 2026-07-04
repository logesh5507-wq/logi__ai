/* Logi_Assist - Main application controller */

const App = {

    selectedLang: 'auto',
    lastResult: null,
    stats: { totalQueries: 0, solved: 0 },

    init() {
        this.runSplashSequence();
        AuthUI.init();
        this.bindNav();
        this.bindAskLogi();
        this.bindLangPills();
        this.bindFileUpload();
        this.bindSettings();
        this.loadLocalStats();

        VoiceInput.init((transcript) => {
            const textarea = document.getElementById('ask-input');
            textarea.value = transcript;
            textarea.focus();
        });

        // If already logged in (token in storage), skip auth screen after splash
        setTimeout(() => {
            if (LogiAPI.isLoggedIn() || LogiAPI.getUser()) {
                this.enterApp();
            } else {
                document.getElementById('auth-screen').classList.add('active');
            }
        }, 2600);
    },

    runSplashSequence() {
        setTimeout(() => {
            document.getElementById('splash-screen').classList.add('hide');
        }, 2600);
    },

    // ================= APP ENTRY =================
    enterApp() {
        document.getElementById('splash-screen').classList.add('hide');
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('app-shell').classList.add('active');
        this.renderUserInfo();
        this.loadHistory();
        this.updateStatDisplay();
    },

    renderUserInfo() {
        const user = LogiAPI.getUser();
        if (!user) return;
        const nameEl = document.getElementById('sidebar-user-name');
        const planEl = document.getElementById('sidebar-user-plan');
        const avatarEl = document.getElementById('sidebar-user-avatar');

        const displayName = user.fullName || 'Guest';
        nameEl.textContent = displayName;
        planEl.textContent = user.plan === 'GUEST' ? 'Guest Mode' : (user.plan === 'PREMIUM' ? 'Premium Plan' : 'Free Plan');
        avatarEl.textContent = displayName.charAt(0).toUpperCase();

        // Hide features that require login
        const guestLocked = document.querySelectorAll('.requires-login');
        guestLocked.forEach(el => {
            el.style.opacity = user.plan === 'GUEST' ? '0.4' : '1';
            el.style.pointerEvents = user.plan === 'GUEST' ? 'none' : 'auto';
        });
    },

    // ================= NAVIGATION =================
    bindNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const target = item.dataset.view;
                if (!target) return;

                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
                const view = document.getElementById('view-' + target);
                if (view) view.classList.add('active');

                if (target === 'history') this.loadHistory();
            });
        });
    },

    // ================= LANGUAGE PILLS =================
    bindLangPills() {
        document.querySelectorAll('.lang-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.lang-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.selectedLang = pill.dataset.lang;

                const voiceLangMap = { en: 'en-US', ta: 'ta-IN', auto: 'en-US' };
                VoiceInput.setLanguage(voiceLangMap[this.selectedLang] || 'en-US');
            });
        });
    },

    // ================= ASK LOGI =================
    bindAskLogi() {
        const form = document.getElementById('ask-form');
        const textarea = document.getElementById('ask-input');

        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
        });

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.requestSubmit();
            }
        });

        form.addEventListener('submit', (e) => this.handleAskSubmit(e));

        document.getElementById('clear-btn').addEventListener('click', () => {
            textarea.value = '';
            textarea.style.height = 'auto';
            this.resetOutput();
        });

        document.getElementById('copy-sql-btn').addEventListener('click', () => this.copySql());
        document.getElementById('download-sql-btn').addEventListener('click', () => this.downloadSql());
        document.getElementById('run-again-btn').addEventListener('click', () => {
            if (this.lastResult && this.lastResult.sql) {
                textarea.value = this.lastResult.sql;
                document.getElementById('mode-select').value = 'EXPLAIN';
                form.requestSubmit();
            }
        });

        // Quick action shortcuts (right panel)
        document.querySelectorAll('.quick-action-item[data-quick]').forEach(item => {
            item.addEventListener('click', () => {
                const quick = item.dataset.quick;
                const modeMap = { generate: 'GENERATE', fix: 'FIX', explain: 'EXPLAIN', optimize: 'EXPLAIN' };
                document.getElementById('mode-select').value = modeMap[quick] || 'GENERATE';
                textarea.focus();
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                document.querySelector('.nav-item[data-view="dashboard"]').classList.add('active');
                document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
                document.getElementById('view-dashboard').classList.add('active');
            });
        });
    },

    async handleAskSubmit(e) {
        e.preventDefault();
        const textarea = document.getElementById('ask-input');
        const input = textarea.value.trim();
        if (!input) return;

        const mode = document.getElementById('mode-select').value;
        const sendBtn = document.getElementById('send-btn');
        const outputBox = document.getElementById('query-output');

        sendBtn.disabled = true;
        outputBox.classList.add('placeholder');
        outputBox.textContent = 'Logi is thinking...';
        document.getElementById('explanation-box').classList.remove('show');
        document.getElementById('query-meta-row').style.display = 'none';
        document.getElementById('query-actions-row').style.display = 'none';

        try {
            const result = await LogiAPI.processSql(input, mode);

            if (!result.success) {
                throw new Error(result.errorMessage || 'Something went wrong');
            }

            this.lastResult = result;
            this.renderResult(result, mode);
            this.bumpStats();

        } catch (err) {
            outputBox.classList.add('placeholder');
            outputBox.textContent = 'Error: ' + err.message;
            this.showToast(err.message, true);
        } finally {
            sendBtn.disabled = false;
        }
    },

    renderResult(result, mode) {
        const outputBox = document.getElementById('query-output');
        outputBox.classList.remove('placeholder');
        outputBox.textContent = result.sql && result.sql.trim() ? result.sql : '(no SQL produced)';

        document.getElementById('meta-lang').textContent = result.detectedLanguage || '-';
        document.getElementById('meta-corrected').textContent = result.correctedInput || '-';
        document.getElementById('query-meta-row').style.display = 'flex';
        document.getElementById('query-actions-row').style.display = 'flex';

        if (result.explanation) {
            document.getElementById('explanation-text').textContent = result.explanation;
            document.getElementById('explanation-box').classList.add('show');
        }
    },

    resetOutput() {
        const outputBox = document.getElementById('query-output');
        outputBox.classList.add('placeholder');
        outputBox.textContent = 'Your generated SQL query will appear here...';
        document.getElementById('explanation-box').classList.remove('show');
        document.getElementById('query-meta-row').style.display = 'none';
        document.getElementById('query-actions-row').style.display = 'none';
        this.lastResult = null;
    },

    copySql() {
        if (!this.lastResult || !this.lastResult.sql) return;
        navigator.clipboard.writeText(this.lastResult.sql);
        this.showToast('SQL copied to clipboard');
    },

    downloadSql() {
        if (!this.lastResult || !this.lastResult.sql) return;
        const blob = new Blob([this.lastResult.sql], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'logi_assist_query.sql';
        a.click();
        URL.revokeObjectURL(url);
    },

    // ================= HISTORY =================
    async loadHistory() {
        const user = LogiAPI.getUser();
        const container = document.getElementById('history-list');
        const recentContainer = document.getElementById('recent-queries-list');

        if (!user || user.plan === 'GUEST' || !LogiAPI.isLoggedIn()) {
            container.innerHTML = `<div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4l3 3M12 21a9 9 0 100-18 9 9 0 000 18z"/></svg>
                <p>Login to save and view your query history</p>
            </div>`;
            return;
        }

        try {
            const history = await LogiAPI.getHistory();

            if (history.length === 0) {
                container.innerHTML = `<div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4l3 3M12 21a9 9 0 100-18 9 9 0 000 18z"/></svg>
                    <p>No queries yet. Ask Logi something to get started!</p>
                </div>`;
                recentContainer.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;">No recent activity</p>';
                return;
            }

            container.innerHTML = history.map(h => `
                <div class="history-item">
                    <div class="history-item-top">
                        <span class="badge-mode">${h.mode}</span>
                        <span style="font-size:0.72rem;color:var(--text-muted);">${this.formatTime(h.createdAt)}</span>
                    </div>
                    <div class="history-item-input">${this.escapeHtml(h.userInput)}</div>
                    <div class="history-item-sql">${this.escapeHtml(h.generatedSql || '')}</div>
                    <div class="query-actions">
                        <button class="action-btn" onclick="App.copyText(\`${this.escapeForJs(h.generatedSql)}\`)">Copy</button>
                        <button class="action-btn" onclick="App.deleteHistoryItem(${h.id})">Delete</button>
                    </div>
                </div>
            `).join('');

            recentContainer.innerHTML = history.slice(0, 4).map(h => `
                <div class="recent-item">
                    <span>${this.escapeHtml(this.truncate(h.userInput, 26))}</span>
                    <span class="time">${this.formatTime(h.createdAt)}</span>
                </div>
            `).join('');

        } catch (err) {
            container.innerHTML = `<div class="empty-state"><p>Failed to load history</p></div>`;
        }
    },

    async deleteHistoryItem(id) {
        try {
            await LogiAPI.deleteHistory(id);
            this.loadHistory();
            this.showToast('Deleted from history');
        } catch (err) {
            this.showToast(err.message, true);
        }
    },

    copyText(text) {
        navigator.clipboard.writeText(text);
        this.showToast('Copied to clipboard');
    },

    // ================= FILE UPLOAD =================
    bindFileUpload() {
        const zone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');
        const form = document.getElementById('file-query-form');

        if (!zone) return;

        zone.addEventListener('click', () => fileInput.click());
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                this.showSelectedFile(e.dataTransfer.files[0]);
            }
        });
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) this.showSelectedFile(fileInput.files[0]);
        });

        form.addEventListener('submit', (e) => this.handleFileQuery(e));
    },

    showSelectedFile(file) {
        const chip = document.getElementById('selected-file-chip');
        chip.style.display = 'inline-flex';
        chip.querySelector('span').textContent = file.name;
    },

    async handleFileQuery(e) {
        e.preventDefault();
        const fileInput = document.getElementById('file-input');
        const question = document.getElementById('file-question').value.trim();
        const resultBox = document.getElementById('file-query-result');
        const btn = document.getElementById('file-query-submit');

        if (!fileInput.files.length) {
            this.showToast('Please choose a file first', true);
            return;
        }
        if (!question) {
            this.showToast('Please type a question about your file', true);
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
        resultBox.style.display = 'block';
        resultBox.textContent = 'Reading your file and asking Logi...';

        try {
            const res = await LogiAPI.queryFile(fileInput.files[0], question);
            resultBox.textContent = res.success ? res.answer : ('Error: ' + res.errorMessage);
        } catch (err) {
            resultBox.textContent = 'Error: ' + err.message;
        } finally {
            btn.disabled = false;
            btn.textContent = 'Ask Logi About This File';
        }
    },

    // ================= SETTINGS =================
    bindSettings() {
        const logoutBtn2 = document.getElementById('settings-logout-btn');
        if (logoutBtn2) logoutBtn2.addEventListener('click', () => AuthUI.logout());
    },

    // ================= STATS (local, cosmetic) =================
    loadLocalStats() {
        const saved = localStorage.getItem('logi_stats');
        if (saved) this.stats = JSON.parse(saved);
    },

    bumpStats() {
        this.stats.totalQueries += 1;
        this.stats.solved += 1;
        localStorage.setItem('logi_stats', JSON.stringify(this.stats));
        this.updateStatDisplay();
    },

    updateStatDisplay() {
        const totalEl = document.getElementById('stat-total-queries');
        const solvedEl = document.getElementById('stat-solved');
        if (totalEl) totalEl.textContent = this.stats.totalQueries;
        if (solvedEl) solvedEl.textContent = this.stats.solved;
    },

    // ================= UTIL =================
    showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.toggle('error', isError);
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    },

    formatTime(iso) {
        if (!iso) return '';
        const date = new Date(iso);
        const now = new Date();
        const diffMin = Math.round((now - date) / 60000);
        if (diffMin < 1) return 'just now';
        if (diffMin < 60) return diffMin + ' min ago';
        const diffHr = Math.round(diffMin / 60);
        if (diffHr < 24) return diffHr + ' hr ago';
        return date.toLocaleDateString();
    },

    truncate(str, len) {
        if (!str) return '';
        return str.length > len ? str.slice(0, len) + '...' : str;
    },

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    escapeForJs(str) {
        if (!str) return '';
        return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
