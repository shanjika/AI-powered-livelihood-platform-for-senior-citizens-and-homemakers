/**
 * SilverHands Skill Eligibility & Confirmation Component
 * Presents extracted explicit, hidden, and transferable skills with confidence scores,
 * AI reasoning, experience badges, and manual check-box confirmation controls.
 */

window.SkillCardsComponent = {
  extractedSkills: [],
  confirmedSkillIds: new Set(),

  setExtractedSkills(skills) {
    this.extractedSkills = skills;
    this.confirmedSkillIds = new Set(skills.map(s => s.id));
  },

  renderConfirmationScreen() {
    return `
      <div class="animate-fade-in">
        <div style="text-align: center; max-width: 800px; margin: 0 auto 2.5rem auto;">
          <h1 class="brand-font" style="color: var(--primary); font-size: 2.4rem;">
            ${window.i18n.t("confirm_skills_title")}
          </h1>
          <p style="color: var(--text-muted); font-size: 1.25rem; margin-top: 0.5rem;">
            ${window.i18n.t("confirm_skills_sub")}
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.8rem; margin-bottom: 3rem;">
          ${this.extractedSkills.map(s => {
            const isChecked = this.confirmedSkillIds.has(s.id);
            return `
              <div class="card ${isChecked ? 'selected' : ''}" style="border-left: 6px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                  <div>
                    <h2>${this.getCategoryIcon(s.category)} ${s.name}</h2>
                    <span class="badge ${s.confidence === 'High' ? 'badge-high' : 'badge-medium'}" style="margin-top: 0.4rem;">
                      ⭐ ${s.confidence} Confidence
                    </span>
                  </div>

                  <label style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.08); padding: 0.5rem 0.9rem; border-radius: 20px;">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} style="width: 22px; height: 22px; accent-color: var(--primary);" onchange="window.SkillCardsComponent.toggleSkill('${s.id}')">
                    <strong style="font-size: 1.1rem; color: ${isChecked ? 'var(--primary)' : 'var(--text-muted)'};">Confirm</strong>
                  </label>
                </div>

                <div style="margin: 1rem 0; font-size: 1rem; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 0.9rem; border-radius: var(--radius-sm);">
                  <strong>Why AI identified it:</strong> ${s.reasoning}
                </div>

                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                  <div><strong>Experience:</strong> ${s.experience_years} years</div>
                  <div><strong>Level:</strong> ${s.proficiency || 'Expert'}</div>
                </div>

                <div style="margin-top: 1rem;">
                  <strong style="color: var(--secondary);">Potential Earning Paths:</strong>
                  <ul style="margin-left: 1.2rem; margin-top: 0.4rem; color: var(--text-muted);">
                    ${(s.earning_paths || []).map(p => `<li>${p}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="text-align: center;">
          <button class="btn btn-primary btn-lg" onclick="window.SkillCardsComponent.saveAndGoToDashboard()">
            🎉 Confirm & Go To My Skill Dashboard ➔
          </button>
        </div>
      </div>
    `;
  },

  getCategoryIcon(category) {
    const map = { Cooking: '🍳', Tailoring: '🧵', Teaching: '👩‍🏫', Gardening: '🌱', Handicrafts: '🎨', Services: '🛠️' };
    return map[category] || '⭐';
  },

  toggleSkill(id) {
    if (this.confirmedSkillIds.has(id)) {
      this.confirmedSkillIds.delete(id);
    } else {
      this.confirmedSkillIds.add(id);
    }
    window.app.render();
  },

  saveAndGoToDashboard() {
    const selected = this.extractedSkills.filter(s => this.confirmedSkillIds.has(s.id));
    window.app.userProfile.skills = selected;
    window.app.navigate("dashboard");
  }
};
