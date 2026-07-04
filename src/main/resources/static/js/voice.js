/* Logi_Assist - Voice input (Web Speech API) - supports English & Tamil */

const VoiceInput = {
    recognition: null,
    isRecording: false,

    init(onResult) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const micBtn = document.getElementById('voice-btn');

        if (!SpeechRecognition) {
            if (micBtn) micBtn.style.display = 'none';
            console.warn('Speech recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = document.getElementById('voice-lang-select')
            ? document.getElementById('voice-lang-select').value
            : 'en-US';

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        this.recognition.onerror = () => {
            this.stop();
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            if (micBtn) micBtn.classList.remove('recording');
        };

        if (micBtn) {
            micBtn.addEventListener('click', () => this.toggle());
        }
    },

    setLanguage(langCode) {
        if (this.recognition) this.recognition.lang = langCode;
    },

    toggle() {
        if (this.isRecording) {
            this.stop();
        } else {
            this.start();
        }
    },

    start() {
        if (!this.recognition) return;
        this.isRecording = true;
        document.getElementById('voice-btn').classList.add('recording');
        try {
            this.recognition.start();
        } catch (e) {
            // recognition may already be running
        }
    },

    stop() {
        if (!this.recognition) return;
        this.isRecording = false;
        document.getElementById('voice-btn').classList.remove('recording');
        try {
            this.recognition.stop();
        } catch (e) { /* ignore */ }
    }
};
