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
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        document.dispatchEvent(new CustomEvent("speechStart"));
      };

      this.recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        document.dispatchEvent(new CustomEvent("speechResult", { detail: { transcript } }));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        document.dispatchEvent(new CustomEvent("speechEnd"));
      };

      this.recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        this.isListening = false;
        document.dispatchEvent(new CustomEvent("speechEnd"));
      };
    }
  }

  setSpeed(speedRate) {
    this.voiceSpeed = speedRate;
    localStorage.setItem("silverhands_voice_speed", speedRate.toString());
  }

  startListening(langCode = "ta") {
    if (this.recognition) {
      const langMap = { ta: "ta-IN", hi: "hi-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN", en: "en-IN" };
      this.recognition.lang = langMap[langCode] || "ta-IN";
      try {
        this.recognition.start();
      } catch (e) {
        console.warn("Recognition start exception:", e);
      }
    } else {
      // Simulated listening fallback
      document.dispatchEvent(new CustomEvent("speechStart"));
      setTimeout(() => {
        const sim = "எனக்கு 25 வருடமாக சமையல் தெரியும். பாரம்பரியமான தின்பண்டங்கள் செய்வதில் அனுபவம் உள்ளது.";
        document.dispatchEvent(new CustomEvent("speechResult", { detail: { transcript: sim } }));
        document.dispatchEvent(new CustomEvent("speechEnd"));
      }, 3500);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
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
