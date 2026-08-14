/**
 * SilverHands Ecosystem Administrator Dashboard Component
 * Metrics overview of registered seniors & homemakers, active skills,
 * community collaborations, total transaction revenue generated, and location distribution.
 */

window.AdminComponent = {
  stats: null,

  async loadStats() {
    try {
      const res = await fetch("/api/admin/stats");
      this.stats = await res.json();
    } catch (e) {
      console.warn("Error fetching admin stats:", e);
    }
  },

  render() {
    if (!this.stats) return `<div class="card">Loading ecosystem analytics...</div>`;
    const s = this.stats;

    return `
      <div class="animate-fade-in">
        <h1 class="brand-font" style="color: var(--primary); margin-bottom: 0.5rem;">⚙️ Platform Ecosystem Admin</h1>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">Real-time statistics across senior citizens, homemakers, and livelihood impact.</p>

        <!-- KPI Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
          <div class="card" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--primary);">${s.total_users}</div>
            <div style="color: var(--text-muted); font-size: 0.9rem;">Total Ecosystem Users</div>
          </div>

          <div class="card" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--secondary);">${s.senior_citizens}</div>
            <div style="color: var(--text-muted); font-size: 0.9rem;">Senior Citizens</div>
          </div>

          <div class="card" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--accent);">${s.homemakers}</div>
            <div style="color: var(--text-muted); font-size: 0.9rem;">Homemakers</div>
          </div>

          <div class="card" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--success);">₹${s.total_income_generated_inr.toLocaleString()}</div>
            <div style="color: var(--text-muted); font-size: 0.9rem;">Total Income Generated</div>
          </div>
        </div>

        <!-- Breakdown Analytics -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div class="card">
            <h3 style="color: var(--secondary); margin-bottom: 1rem;">🔥 Most Popular Skills</h3>
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
              ${s.top_skills.map(sk => `
                <div style="display: flex; justify-content: space-between; padding: 0.8rem; background: rgba(0,0,0,0.2); border-radius: var(--radius-sm);">
                  <span>${sk.skill}</span>
                  <strong style="color: var(--primary);">${sk.count} active profiles</strong>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="card">
            <h3 style="color: var(--primary); margin-bottom: 1rem;">📊 Platform Activity Summary</h3>
            <div style="display: flex; flex-direction: column; gap: 0.8rem; color: var(--text-muted);">
              <div>• Active Livelihood Opportunities: <strong>${s.active_opportunities}</strong></div>
              <div>• Active AI Collaborations: <strong>${s.collaborations_active}</strong></div>
              <div>• Published Classes & Workshops: <strong>${s.classes_published}</strong></div>
              <div>• Skill Videos Uploaded: <strong>${s.videos_uploaded}</strong></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
