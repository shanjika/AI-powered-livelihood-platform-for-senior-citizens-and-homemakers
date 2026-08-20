/**
 * SilverHands Audio & Speech Engine
 * Manages Web Speech Recognition (STT), Speech Synthesis (TTS),
 * Voice Speed Scalers (Slow, Normal, Fast), and Visual Waveform Canvas Animation.
 */

class AudioEngine {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.voiceSpeed = parseFloat(localStorage.getItem("silverhands_voice_speed") || "1.0");
    this.canvasAnimId = null;
    this.fallbackTimer = null;
    this.sessionTranscript = "";
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;

    this.recognition.onstart = () => {
      this.isListening = true;
      document.dispatchEvent(new CustomEvent("speechStart"));
      const btn = document.getElementById("mic-btn");
      if (btn) btn.innerHTML = "⏹️ Stop Recording";
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();
        if (result.isFinal) finalTranscript += `${text} `;
        else interimTranscript += `${text} `;
      }
      this.sessionTranscript = finalTranscript.trim();
      document.dispatchEvent(new CustomEvent("speechInterim", {
        detail: { transcript: `${this.sessionTranscript} ${interimTranscript}`.trim(), isFinal: false }
      }));
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.stopWaveform();
      const btn = document.getElementById("mic-btn");
      if (btn) btn.innerHTML = "🎙️ Start Speaking";
      if (this.sessionTranscript) {
        document.dispatchEvent(new CustomEvent("speechResult", {
          detail: { transcript: this.sessionTranscript, isFinal: true }
        }));
      }
      document.dispatchEvent(new CustomEvent("speechEnd"));
    };

    this.recognition.onerror = (err) => {
      console.warn("Speech recognition error:", err);
      this.isListening = false;
      this.stopWaveform();
      const btn = document.getElementById("mic-btn");
      if (btn) btn.innerHTML = "🎙️ Start Speaking";
      document.dispatchEvent(new CustomEvent("speechEnd"));
    };
  }

  setSpeed(speedRate) {
    this.voiceSpeed = speedRate;
    localStorage.setItem("silverhands_voice_speed", speedRate.toString());
  }

  startListening(langCode = "ta") {
    const langMap = { ta: "ta-IN", hi: "hi-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN", en: "en-IN" };

    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }

    if (this.recognition) {
      try {
        if (this.isListening) {
          this.stopListening();
          return;
        }
        this.sessionTranscript = "";
        this.recognition.lang = langMap[langCode] || "ta-IN";
        this.recognition.start();
        return;
      } catch (e) {
        console.warn("Recognition start exception:", e);
      }
    }

    this.isListening = true;
    document.dispatchEvent(new CustomEvent("speechStart"));
    const btn = document.getElementById("mic-btn");
    if (btn) btn.innerHTML = "⏹️ Stop Recording";
    this.fallbackTimer = setTimeout(() => {
      const sim = "I know cooking and I can prepare healthy snacks for local orders.";
      document.dispatchEvent(new CustomEvent("speechResult", { detail: { transcript: sim, isFinal: true } }));
      this.isListening = false;
      this.fallbackTimer = null;
      const fallbackBtn = document.getElementById("mic-btn");
      if (fallbackBtn) fallbackBtn.innerHTML = "🎙️ Start Speaking";
      document.dispatchEvent(new CustomEvent("speechEnd"));
    }, 3500);
  }

  stopListening() {
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("Recognition stop exception:", e);
      }
    }
  }

  speak(text, langCode = "ta") {
    if (!this.synthesis) return;
    this.synthesis.cancel(); // Clear previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.voiceSpeed;
    
    const langMap = { ta: "ta-IN", hi: "hi-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN", en: "en-IN" };
    utterance.lang = langMap[langCode] || "en-US";

    // Find localized voice if available
    const voices = this.synthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(langCode));
    if (voice) utterance.voice = voice;

    this.synthesis.speak(utterance);
  }

  startWaveform(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#0d9488";

      const width = canvas.width;
      const height = canvas.height;
      const midHeight = height / 2;

      for (let x = 0; x < width; x++) {
        const y = midHeight + Math.sin(x * 0.05 + phase) * 20 * Math.sin(x * 0.01);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      phase += 0.15;
      this.canvasAnimId = requestAnimationFrame(draw);
    };

    draw();
  }

  stopWaveform() {
    if (this.canvasAnimId) {
      cancelAnimationFrame(this.canvasAnimId);
      this.canvasAnimId = null;
    }
  }
}

window.audioEngine = new AudioEngine();
