/**
 * SilverHands Onboarding Component
 * Step 1: Language Selection (ta, hi, te, kn, ml, en)
 * Step 2: Interaction Mode Selection (Speak / Type / Both)
 * Step 3: Adaptive AI Conversation with LIVE ESSENTIAL DETAILS DISPLAY (Name, Age, District, Taluk, State, Education, Skills, Phone)
 */

window.OnboardingComponent = {
  step: 1, // 1: Language, 2: Mode, 3: AI Interview
  selectedMode: "both",
  interviewStep: 1,
  chatHistory: [],
  introQuestionShown: false,
  essentialDetails: {
    name: "",
    age: "",
    district: "",
    taluk: "",
    state: "",
    education: "",
    skills_known: "",
    phone: ""
  },

  renderLanguageSelection() {
    return `
      <div class="onboarding-hero animate-fade-in">
        <h1 class="brand-font" style="margin-bottom: 0.5rem;">${window.i18n.t("select_language")}</h1>
        <p style="color: var(--text-muted); font-size: 1.2rem; margin-bottom: 2.5rem;">
          SilverHands adapts completely to your preferred language.
        </p>

        <div class="option-grid">
          <div class="option-card ${window.i18n.currentLang === 'ta' ? 'selected' : ''}" onclick="window.OnboardingComponent.selectLang('ta')">
            <div class="option-icon">🇮🇳</div>
            <h2 style="color: var(--primary);">தமிழ் (Tamil)</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">முழுமையான தமிழ் அனுபவம்</p>
          </div>

          <div class="option-card ${window.i18n.currentLang === 'hi' ? 'selected' : ''}" onclick="window.OnboardingComponent.selectLang('hi')">
            <div class="option-icon">🇮🇳</div>
            <h2 style="color: var(--secondary);">हिंदी (Hindi)</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">संपूर्ण हिंदी अनुभव</p>
          </div>

          <div class="option-card ${window.i18n.currentLang === 'te' ? 'selected' : ''}" onclick="window.OnboardingComponent.selectLang('te')">
            <div class="option-icon">🇮🇳</div>
            <h2 style="color: var(--accent);">తెలుగు (Telugu)</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">పూర్తి తెలుగు అనుభవం</p>
          </div>

          <div class="option-card ${window.i18n.currentLang === 'kn' ? 'selected' : ''}" onclick="window.OnboardingComponent.selectLang('kn')">
            <div class="option-icon">🇮🇳</div>
            <h2 style="color: var(--primary);">ಕನ್ನಡ (Kannada)</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">ಸಂಪೂರ್ಣ ಕನ್ನಡ ಅನುಭವ</p>
          </div>

          <div class="option-card ${window.i18n.currentLang === 'ml' ? 'selected' : ''}" onclick="window.OnboardingComponent.selectLang('ml')">
            <div class="option-icon">🇮🇳</div>
            <h2 style="color: var(--secondary);">മലയാളം (Malayalam)</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">സമ്പൂർണ്ണ മലയാളം അനുഭവം</p>
          </div>

          <div class="option-card ${window.i18n.currentLang === 'en' ? 'selected' : ''}" onclick="window.OnboardingComponent.selectLang('en')">
            <div class="option-icon">🌐</div>
            <h2 style="color: var(--text-main);">English</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">Full English Experience</p>
          </div>
        </div>
      </div>
    `;
  },

  renderModeSelection() {
    return `
      <div class="onboarding-hero animate-fade-in">
        <h1 class="brand-font" style="margin-bottom: 0.5rem;">${window.i18n.t("select_mode")}</h1>
        <p style="color: var(--text-muted); font-size: 1.2rem; margin-bottom: 2.5rem;">
          No long resumes. Speak or type comfortably with your AI interviewer.
        </p>

        <div class="option-grid">
          <div class="option-card" onclick="window.OnboardingComponent.selectMode('speak')">
            <div class="option-icon">🎙️</div>
            <h2 style="color: var(--primary);">${window.i18n.t("speak_ai")}</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">${window.i18n.t("speak_sub")}</p>
          </div>

          <div class="option-card" onclick="window.OnboardingComponent.selectMode('type')">
            <div class="option-icon">📝</div>
            <h2 style="color: var(--secondary);">${window.i18n.t("type_ai")}</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">${window.i18n.t("type_sub")}</p>
          </div>
        </div>

        <div style="margin-top: 2.5rem; text-align: center;">
          <button class="btn btn-outline btn-lg" onclick="window.OnboardingComponent.selectMode('both')">
            ✨ ${window.i18n.t("use_both")}
          </button>
        </div>
      </div>
    `;
  },

  clearInterviewState() {
    this.chatHistory = [];
    this.interviewStep = 1;
    this.introQuestionShown = false;
    this.essentialDetails = {
      ...this.essentialDetails,
      name: "",
      age: "",
      district: "",
      taluk: "",
      state: "",
      education: "",
      skills_known: "",
      phone: ""
    };
    if (window.SkillCardsComponent && typeof window.SkillCardsComponent.clearExtractedSkills === "function") {
      window.SkillCardsComponent.clearExtractedSkills();
    }
  },

  renderAIInterview() {
    return `
      <div class="animate-fade-in">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.8rem;">
          <div>
            <h2>Skill Discovery</h2>
            <p style="color: var(--text-muted);">Tell us the skill(s) you know best and can confidently do</p>
          </div>
          <div style="display: flex; gap: 0.7rem; flex-wrap: wrap;">
            <button class="btn btn-outline" onclick="window.app.goBack()">
              ← Back
            </button>
            <button class="btn btn-secondary" onclick="window.OnboardingComponent.skipInterview()">
              ✨ Use My Skill Profile
            </button>
          </div>
        </div>

        <div class="dual-interview-container">
          <!-- LEFT PANEL: Audio Voice Controls -->
          <div class="audio-panel">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎙️</div>
            <h3>SilverHands AI Voice Assistant</h3>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">
              Click record and speak naturally in your chosen language
            </p>

            <canvas id="waveform-canvas" class="waveform-canvas" width="400" height="100"></canvas>

            <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
              <button id="mic-btn" class="btn btn-primary btn-lg" onclick="window.OnboardingComponent.toggleMic()">
                🎙️ Start Speaking
              </button>
              <button class="btn btn-secondary btn-lg" onclick="window.OnboardingComponent.sendAnswer()">
                ➤ Send
              </button>
            </div>
          </div>

          <!-- RIGHT PANEL: Live Transcription & Text Chat -->
          <div class="chat-panel">
            <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--surface-border); padding-bottom: 0.5rem;">
              📝 ${window.i18n.t("live_transcript")}
            </h3>

            <div id="chat-history" class="chat-history">
              ${this.chatHistory.map(msg => `
                <div class="chat-bubble ${msg.role}">
                  <strong>${msg.role === 'ai' ? 'SilverHands AI 🤖' : 'You 👤'}</strong>
                  <div>${msg.text}</div>
                </div>
              `).join('')}
            </div>

            <div class="chat-input-group">
              <input type="text" id="user-input" class="chat-input" placeholder="Type your answer here..." onkeypress="if(event.key==='Enter') window.OnboardingComponent.sendAnswer()">
              <button class="btn btn-primary" onclick="window.OnboardingComponent.sendAnswer()">Send ➔</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectLang(lang) {
    window.i18n.setLanguage(lang);
    this.step = 2;
    this.clearInterviewState();
    window.app.render();
  },

  selectMode(mode) {
    this.selectedMode = mode;
    this.step = 3;
    this.clearInterviewState();
    this.startInterview();
  },

  async startInterview() {
    this.chatHistory = [];
    this.interviewStep = 1;
    this.introQuestionShown = false;
    this.essentialDetails.skills_known = "";
    if (window.SkillCardsComponent && typeof window.SkillCardsComponent.clearExtractedSkills === "function") {
      window.SkillCardsComponent.clearExtractedSkills();
    }
    if (window.app.userProfile) {
      this.essentialDetails.name = window.app.userProfile.name || "";
      this.essentialDetails.district = window.app.userProfile.district || "";
      this.essentialDetails.taluk = window.app.userProfile.taluk || "";
      this.essentialDetails.state = window.app.userProfile.state || "";
      this.essentialDetails.phone = window.app.userProfile.phone || "";
      this.essentialDetails.education = window.app.userProfile.education || "";
    }

    const question = "What is the skill you know best and can confidently do for work or income? Tell me only one or two skills, such as cooking, tailoring, tutoring, gardening, or handicrafts.";
    if (!this.introQuestionShown) {
      this.chatHistory.push({ role: "ai", text: question });
      this.introQuestionShown = true;
    }
    if (window.audioEngine && typeof window.audioEngine.speak === "function") {
      window.audioEngine.speak(question, window.i18n.currentLang);
    }
    window.app.render();
  },

  toggleMic() {
    const btn = document.getElementById("mic-btn");
    if (window.audioEngine && window.audioEngine.isListening) {
      window.audioEngine.stopListening();
      if (btn) btn.innerHTML = "🎙️ Start Speaking";
      return;
    }

    if (window.audioEngine) {
      window.audioEngine.startListening(window.i18n.currentLang);
      window.audioEngine.startWaveform("waveform-canvas");
    }
    if (btn) btn.innerHTML = "⏹️ Stop Recording";
  },

  syncMicButtonState() {
    const btn = document.getElementById("mic-btn");
    if (!btn) return;
    btn.innerHTML = window.audioEngine.isListening ? "⏹️ Stop Recording" : "🎙️ Start Speaking";
  },

  async sendAnswer(overrideText = null) {
    const input = document.getElementById("user-input");
    const userText = overrideText || (input ? input.value.trim() : "");
    if (!userText) return;

    if (input) input.value = "";
    this.chatHistory.push({ role: "user", text: userText });
    this.interviewStep++;
    this.essentialDetails.skills_known = "";

    window.app.showLoading("Extracting your skills...");
    try {
      const res = await fetch("/api/skills/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_text: userText,
          history: this.chatHistory,
          lang: window.i18n.currentLang,
          user_id: window.app.userProfile ? window.app.userProfile.id : null
        })
      });
      const extractedSkills = await res.json();

      if (!Array.isArray(extractedSkills) || !extractedSkills.length) {
        this.chatHistory.push({ role: "ai", text: "I could not detect a clear skill yet. Please tell me one or two skills you do best, such as cooking, tailoring, tutoring, gardening, or handicrafts." });
        window.app.hideLoading();
        window.app.render();
        return;
      }

      this.essentialDetails.skills_known = extractedSkills.map(skill => skill.name).slice(0, 3).join(", ");
      window.app.hideLoading();
      window.SkillCardsComponent.setExtractedSkills(extractedSkills);
      window.app.navigate("confirm_skills");
    } catch (e) {
      window.app.hideLoading();
      this.chatHistory.push({ role: "ai", text: "I had trouble understanding your skill profile. Please tell me your strongest skill in one sentence." });
      window.app.render();
    }
  },

  async skipInterview() {
    const userText = this.chatHistory.filter(m => m.role === "user").map(m => m.text).join(" ") || "I am skilled in cooking, tailoring, and teaching.";
    window.app.showLoading("Extracting your skill profile...");

    if (window.app.userProfile && window.app.userProfile.id) {
      await fetch("/api/users/update_essential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: window.app.userProfile.id,
          name: this.essentialDetails.name,
          age: this.essentialDetails.age,
          phone: this.essentialDetails.phone,
          district: this.essentialDetails.district,
          taluk: this.essentialDetails.taluk,
          state: this.essentialDetails.state,
          education: this.essentialDetails.education
        })
      });
    }

    try {
      const res = await fetch("/api/skills/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_text: userText,
          history: this.chatHistory,
          lang: window.i18n.currentLang,
          user_id: window.app.userProfile ? window.app.userProfile.id : null
        })
      });
      const extractedSkills = await res.json();
      window.app.hideLoading();

      if (!Array.isArray(extractedSkills) || !extractedSkills.length) {
        this.chatHistory.push({ role: "ai", text: "I could not detect a clear skill. Please tell me your strongest skill again." });
        window.app.render();
        return;
      }

      window.SkillCardsComponent.setExtractedSkills(extractedSkills);
      window.app.navigate("confirm_skills");
    } catch (e) {
      window.app.hideLoading();
      alert("We could not extract skills. Please try again.");
    }
  }
};

// Listen to STT recognition results
document.addEventListener("speechInterim", (e) => {
  const transcript = e.detail && e.detail.transcript ? e.detail.transcript : "";
  const input = document.getElementById("user-input");
  if (transcript && input && !input.value.trim()) {
    input.value = transcript;
  }
});

document.addEventListener("speechResult", (e) => {
  if (e.detail && e.detail.transcript && e.detail.isFinal) {
    window.OnboardingComponent.sendAnswer(e.detail.transcript);
  }
});
