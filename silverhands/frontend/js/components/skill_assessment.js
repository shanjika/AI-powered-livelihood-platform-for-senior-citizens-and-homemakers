/**
 * SilverHands AI Skill Strength Assessment Component
 * Asks targeted domain questions based on user's confirmed skills
 * to analyze experience depth, quality control, and regional technique strength.
 */

window.SkillAssessmentComponent = {
  currentSkill: "Traditional Cooking",
  questionIndex: 0,
  userAnswers: [],
  assessmentCompleted: false,
  resultData: null,

  questions: [
    {
      q: "1. சமையலில் தின்பண்டங்கள் நீண்ட நாட்கள் கெடாமல் மொறுமொறுப்பாக இருக்க நீங்கள் கையாளும் பாரம்பரிய முறை என்ன? (How do you ensure zero-oil moisture preservation?)",
      default_ans: "தினையை மிதமான தீயில் வறுத்து, ஈரப்பதம் இல்லாமல் மாவு பிசைந்து, தரமான சமையல் எண்ணெயில் சரியான சூட்டில் பொரிப்பேன்."
    },
    {
      q: "2. 100 நபர்களுக்கு ஒரே நேரத்தில் தின்பண்டங்கள் செய்யும்போது சுவை மாறாமல் இருக்க அளவுகளை எவ்வாறு நிர்வகிப்பீர்கள்? (How do you scale spicing for 100 people?)",
      default_ans: "எங்கள் குடும்ப பாரம்பரிய அளவு பட்டியலின்படி பெருங்காயம், சீரகம் மற்றும் உப்பின் அளவை துல்லியமாக கணக்கிட்டு சேர்ப்பேன்."
    },
    {
      q: "3. வாடிக்கையாளர்களுக்கு பொருட்களை பாதுகாப்பாக பார்சல் செய்து அனுப்ப நீங்கள் என்ன முறையை பயன்படுத்துவீர்கள்? (How do you handle food packaging?)",
      default_ans: "காற்றடைக்கப்பட்ட சூழல் நட்புப் பைகளில் (Eco-friendly airtight bags) லேபிளிட்டு பாதுகாப்பாக விநியோகம் செய்வேன்."
    }
  ],

  renderModal() {
    if (this.assessmentCompleted && this.resultData) {
      return `
        <div class="animate-fade-in card" style="max-width: 650px; margin: 2rem auto; border: 3px solid var(--success); text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 0.5rem;">🏆</div>
          <h1 class="brand-font" style="color: var(--success);">${this.resultData.badge}</h1>
          <h2 style="margin: 0.5rem 0;">Skill Strength Score: <span style="color: var(--primary); font-size: 2.2rem;">${this.resultData.strength_score}%</span></h2>
          <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1.5rem;">${this.resultData.level}</p>

          <div style="background: rgba(0,0,0,0.3); padding: 1.2rem; border-radius: var(--radius-md); text-align: left; margin-bottom: 1.8rem; line-height: 1.6;">
            <strong style="color: var(--secondary);">AI Analysis Feedback:</strong><br>
            ${this.resultData.feedback}
          </div>

          <button class="btn btn-primary btn-lg" onclick="window.SkillAssessmentComponent.closeAssessment()">
            ✨ Continue to My Personalized Dashboard ➔
          </button>
        </div>
      `;
    }

    const currentQ = this.questions[this.questionIndex];
    return `
      <div class="animate-fade-in card" style="max-width: 680px; margin: 2rem auto; border: 2px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--surface-border); padding-bottom: 0.8rem; margin-bottom: 1.5rem;">
          <div>
            <h2 style="color: var(--primary);">${window.i18n.t("strength_assessment_title")}</h2>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Analyzing strength for: <strong>${this.currentSkill}</strong></p>
          </div>
          <span class="badge badge-accent">Question ${this.questionIndex + 1} of 3</span>
        </div>

        <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.2rem; color: var(--text-main);">
          ${currentQ.q}
        </div>

        <div style="margin-bottom: 1.5rem;">
          <textarea id="assess-answer" class="chat-input" rows="4" style="width: 100%; font-size: 1.05rem; padding: 1rem;" placeholder="Type or speak your expert technique answer here...">${currentQ.default_ans}</textarea>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button class="btn btn-secondary" onclick="window.audioEngine.startListening(window.i18n.currentLang)">
            🎙️ Speak Answer
          </button>
          <button class="btn btn-primary btn-lg" onclick="window.SkillAssessmentComponent.nextQuestion()">
            ${this.questionIndex === 2 ? '📊 Submit & Analyze Strength ➔' : 'Next Question ➔'}
          </button>
        </div>
      </div>
    `;
  },

  async nextQuestion() {
    const ans = document.getElementById("assess-answer").value.trim();
    if (ans) this.userAnswers.push(ans);

    if (this.questionIndex < 2) {
      this.questionIndex++;
      window.app.render();
    } else {
      window.app.showLoading("AI Skill Strength Analyzer Evaluating Responses...");
      const res = await fetch("/api/skills/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: window.app.userProfile.id || "u-lakshmi-64",
          skill_name: this.currentSkill,
          answers: this.userAnswers,
          lang: window.i18n.currentLang
        })
      });
      const data = await res.json();
      window.app.hideLoading();

      this.resultData = data;
      this.assessmentCompleted = true;
      if (window.app.userProfile) window.app.userProfile.skill_strength_score = data.strength_score;
      window.app.render();
    }
  },

  closeAssessment() {
    this.assessmentCompleted = false;
    this.questionIndex = 0;
    this.userAnswers = [];
    window.app.navigate("dashboard");
  }
};
