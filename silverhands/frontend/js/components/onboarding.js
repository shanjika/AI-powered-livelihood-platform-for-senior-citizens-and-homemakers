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
  essentialDetails: {
    name: "Lakshmi Ammal",
    age: 64,
    district: "Chennai",
    taluk: "Mylapore",
    state: "Tamil Nadu",
    education: "Higher Secondary School",
    skills_known: "Cooking, Festival Snacks, Traditional Sweets",
    phone: "+91 98401 23456"
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

  renderAIInterview() {
    const ed = this.essentialDetails;
    return `
      <div class="animate-fade-in">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          <div>
            <h2>${window.i18n.t("ai_voice_interview")}</h2>
            <p style="color: var(--text-muted);">Step ${this.interviewStep} of 5 - Tell us about your journey</p>
          </div>
          <button class="btn btn-secondary" onclick="window.OnboardingComponent.skipInterview()">
            ✨ Discover My Skills & Create Dashboard
          </button>
        </div>

        <!-- ESSENTIAL DETAILS LIVE PANEL DISPLAY -->
        <div class="card" style="margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(13,148,136,0.15), rgba(79,70,229,0.15)); border: 2px solid var(--secondary);">
          <h3 style="color: var(--secondary); margin-bottom: 0.8rem;">
            ${window.i18n.t("essential_details_title")}
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.95rem;">
            <div>👤 <strong>Name:</strong> ${ed.name}</div>
            <div>🎂 <strong>Age:</strong> ${ed.age} yrs</div>
            <div>📍 <strong>District:</strong> ${ed.district}</div>
            <div>🏡 <strong>Taluk:</strong> ${ed.taluk}</div>
            <div>🏛️ <strong>State:</strong> ${ed.state}</div>
            <div>📞 <strong>Contact:</strong> ${ed.phone}</div>
            <div>🎓 <strong>Education:</strong> ${ed.education || 'High School (Optional)'}</div>
            <div style="grid-column: span 2;">🛠️ <strong>Extracted Skills:</strong> <span class="badge badge-high">${ed.skills_known}</span></div>
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

            <div style="display: flex; justify-content: center; gap: 1rem;">
              <button id="mic-btn" class="btn btn-primary btn-lg" onclick="window.OnboardingComponent.toggleMic()">
                🎙️ Start Speaking
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
    window.app.render();
  },

  selectMode(mode) {
    this.selectedMode = mode;
    this.step = 3;
    this.startInterview();
  },

  async startInterview() {
    this.chatHistory = [];
    if (window.app.userProfile) {
      this.essentialDetails.name = window.app.userProfile.name || "Lakshmi Ammal";
      this.essentialDetails.district = window.app.userProfile.district || "Chennai";
      this.essentialDetails.taluk = window.app.userProfile.taluk || "Mylapore";
      this.essentialDetails.state = window.app.userProfile.state || "Tamil Nadu";
      this.essentialDetails.phone = window.app.userProfile.phone || "+91 98401 23456";
      this.essentialDetails.education = window.app.userProfile.education || "Higher Secondary School";
    }
    window.app.render();

    const res = await fetch("/api/onboard/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: 1, user_input: "", history: [], lang: window.i18n.currentLang })
    });
    const data = await res.json();
    this.chatHistory.push({ role: "ai", text: data.question });
    window.audioEngine.speak(data.question, window.i18n.currentLang);
    window.app.render();
  },

  toggleMic() {
    const btn = document.getElementById("mic-btn");
    if (window.audioEngine.isListening) {
      window.audioEngine.stopListening();
      window.audioEngine.stopWaveform();
      if (btn) btn.innerHTML = "🎙️ Start Speaking";
    } else {
      window.audioEngine.startListening(window.i18n.currentLang);
      window.audioEngine.startWaveform("waveform-canvas");
      if (btn) btn.innerHTML = "⏹️ Stop Recording";
    }
  },

  async sendAnswer(overrideText = null) {
    const input = document.getElementById("user-input");
    const userText = overrideText || (input ? input.value.trim() : "");
    if (!userText) return;

    if (input) input.value = "";
    this.chatHistory.push({ role: "user", text: userText });
    this.interviewStep++;

    // Update Live Essential Details extracted from input
    if (userText.includes("சமையல்") || userText.includes("cook")) {
      this.essentialDetails.skills_known = "Traditional Cooking, Snack Preparation";
    }
    if (userText.includes("தையல்") || userText.includes("tailor")) {
      this.essentialDetails.skills_known += ", Tailoring & Embroidery";
    }

    window.app.render();

    const res = await fetch("/api/onboard/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: this.interviewStep,
        user_input: userText,
        history: this.chatHistory,
        lang: window.i18n.currentLang
      })
    });
    const data = await res.json();

    if (data.is_complete || this.interviewStep >= 4) {
      this.skipInterview();
    } else {
      this.chatHistory.push({ role: "ai", text: data.question });
      window.audioEngine.speak(data.question, window.i18n.currentLang);
      window.app.render();
    }
  },

  async skipInterview() {
    const userText = this.chatHistory.map(m => m.text).join(" ");
    window.app.showLoading("AI Extracting Skills & Saving Essential Profile Details to Database...");

    // Update essential profile details in SQLite DB
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

    const res = await fetch("/api/skills/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_text: userText || "25 years cooking South Indian traditional snacks and tailoring",
        history: this.chatHistory,
        lang: window.i18n.currentLang
      })
    });
    const extractedSkills = await res.json();
    window.app.hideLoading();

    window.SkillCardsComponent.setExtractedSkills(extractedSkills);
    window.app.navigate("confirm_skills");
  }
};

// Listen to STT recognition results
document.addEventListener("speechResult", (e) => {
  if (e.detail && e.detail.transcript) {
    window.OnboardingComponent.sendAnswer(e.detail.transcript);
  }
});
