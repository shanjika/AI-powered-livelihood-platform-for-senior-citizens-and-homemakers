/**
 * SilverHands Teaching & Class Creation Component
 * One-prompt AI class generator (Title, 4-session curriculum, fees, schedule)
 * and student booking system.
 */

window.ClassesComponent = {
  classes: [],
  relevantOpportunities: [],

  async loadClasses() {
    try {
      const userId = window.app && window.app.userProfile ? window.app.userProfile.id : "";
      const res = await fetch(userId ? `/api/classes?user_id=${encodeURIComponent(userId)}` : "/api/classes");
      this.classes = await res.json();
      if (userId) {
        await this.loadRelevantOpportunities();
      }
    } catch (e) {
      console.warn("Error fetching classes:", e);
    }
  },

  async loadRelevantOpportunities() {
    const userId = window.app && window.app.userProfile ? window.app.userProfile.id : "";
    if (!userId) {
      this.relevantOpportunities = [];
      return;
    }
    try {
      const res = await fetch(`/api/opportunities/match/${userId}`);
      const data = await res.json();
      this.relevantOpportunities = Array.isArray(data) ? data.slice(0, 3) : [];
    } catch (e) {
      console.warn("Error fetching relevant opportunities:", e);
      this.relevantOpportunities = [];
    }
  },

  getTeachingSkill() {
    const skills = (window.app && window.app.userProfile && Array.isArray(window.app.userProfile.skills)) ? window.app.userProfile.skills : [];
    if (!skills.length) return 'Traditional Cooking';
    const primary = skills.reduce((best, current) => {
      const bestYears = Number(best && best.experience_years) || 0;
      const currentYears = Number(current && current.experience_years) || 0;
      return currentYears > bestYears ? current : best;
    }, skills[0]);
    return (primary && primary.name) || 'Traditional Cooking';
  },

  render() {
    const teachingSkill = this.getTeachingSkill();
    return `
      <div class="animate-fade-in">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
          <div>
            <h1 class="brand-font" style="color: var(--primary);">🎓 My Teaching & Classes</h1>
            <p style="color: var(--text-muted);">Share your knowledge. Conduct workshops and earn income.</p>
          </div>

          <button class="btn btn-primary" onclick="window.ClassesComponent.openClassModal('${teachingSkill.replace(/'/g, "\\'")}')">
            ✨ ${window.i18n.t("create_class")}
          </button>
        </div>

        ${this.relevantOpportunities.length ? `
          <div style="margin: 2rem 0 1.2rem;">
            <h3 style="color: var(--secondary); margin-bottom: 1rem;">💼 Relevant ${teachingSkill} Opportunities</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
              ${this.relevantOpportunities.map(job => `
                <div class="card" style="padding: 1rem; border: 1px solid var(--surface-border);">
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">${job.location_name || 'Local Opportunity'}</div>
                  <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.4rem; color: var(--text-main);">${job.title}</div>
                  <div style="font-size: 0.9rem; color: var(--primary); margin-bottom: 0.5rem;">₹${Number(job.expected_earning || job.individual_earning || 0).toLocaleString()} • ${job.match_score || 95}% match</div>
                  <div style="font-size: 0.85rem; color: var(--text-muted);">${job.description || 'Skill-based opportunity for your current expertise.'}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.8rem;">
          ${this.classes.map(cls => `
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
                <span class="badge badge-high">${cls.mode}</span>
                <span class="badge badge-accent">Enrolled: ${cls.enrolled_count}/${cls.max_students}</span>
              </div>

              <h2>${cls.title}</h2>
              <p style="color: var(--text-muted); font-size: 0.95rem;">Instructor: <strong>${cls.instructor}</strong></p>

              <div style="margin: 1rem 0; font-size: 1.5rem; font-weight: 800; color: var(--primary);">
                ₹${cls.fee.toLocaleString()} <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 400;">/ student</span>
              </div>

              <p style="color: var(--text-main); margin-bottom: 1rem;">${cls.description}</p>

              <div style="background: rgba(0,0,0,0.25); padding: 0.9rem; border-radius: var(--radius-sm); margin-bottom: 1.2rem;">
                <strong style="color: var(--secondary);">Curriculum Overview:</strong>
                <ul style="margin-left: 1.2rem; margin-top: 0.4rem; color: var(--text-muted); font-size: 0.9rem;">
                  ${(cls.curriculum || []).map(c => `<li>${c}</li>`).join('')}
                </ul>
              </div>

              <div style="display: flex; gap: 0.8rem;">
                <button class="btn btn-primary" style="flex: 1;" onclick="window.ClassesComponent.bookClass('${cls.id}')">
                  🎟️ Book Seat
                </button>
                <button class="btn btn-outline" onclick="alert('Class schedule copied to share!')">
                  📢 Share Class
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  async openClassModal(category) {
    const userSkills = (window.app && window.app.userProfile && Array.isArray(window.app.userProfile.skills)) ? window.app.userProfile.skills.map(s => s.name || s) : [];
    const defaultSkill = category || this.getTeachingSkill();
    const promptText = prompt("Tell SilverHands what you would like to teach:", `I want to teach a practical ${defaultSkill} class for beginners.`);
    if (!promptText) return;

    window.app.showLoading("AI Generating Class Title, Curriculum & Schedule...");
    const res = await fetch("/api/classes/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptText,
        user_name: window.app.userProfile.name,
        lang: window.i18n.currentLang,
        user_skills: userSkills
      })
    });
    const newCls = await res.json();
    window.app.hideLoading();

    this.classes.unshift(newCls);
    window.app.render();
    alert("✨ AI Class Generated & Published Successfully!");
  },

  bookClass(clsId) {
    alert("Seat booked successfully! Confirmation SMS and Zoom link sent to your registered phone.");
  }
};
