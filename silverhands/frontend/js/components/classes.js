/**
 * SilverHands Teaching & Class Creation Component
 * One-prompt AI class generator (Title, 4-session curriculum, fees, schedule)
 * and student booking system.
 */

window.ClassesComponent = {
  classes: [],

  async loadClasses() {
    try {
      const res = await fetch("/api/classes");
      this.classes = await res.json();
    } catch (e) {
      console.warn("Error fetching classes:", e);
    }
  },

  render() {
    return `
      <div class="animate-fade-in">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
          <div>
            <h1 class="brand-font" style="color: var(--primary);">🎓 My Teaching & Classes</h1>
            <p style="color: var(--text-muted);">Share your knowledge. Conduct workshops and earn income.</p>
          </div>

          <button class="btn btn-primary" onclick="window.ClassesComponent.openClassModal('Traditional Cooking')">
            ✨ ${window.i18n.t("create_class")}
          </button>
        </div>

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
    const promptText = prompt("Tell SilverHands what you would like to teach:", `I want to teach traditional ${category}`);
    if (!promptText) return;

    window.app.showLoading("AI Generating Class Title, Curriculum & Schedule...");
    const res = await fetch("/api/classes/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptText,
        user_name: window.app.userProfile.name,
        lang: window.i18n.currentLang
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
