/**
 * SilverHands AI Collaboration Hub Component
 * Solves large community orders (e.g. 500 snack boxes for cultural events)
 * by forming multi-member AI teams across complementary skilled SilverHands members.
 */

window.CollaborationComponent = {
  activeCollaborations: [],

  async loadCollaborations() {
    try {
      const userId = window.app.userProfile ? window.app.userProfile.id : "";
      const res = await fetch(`/api/collaborations${userId ? '?user_id=' + userId : ''}`);
      this.activeCollaborations = await res.json();
    } catch (e) {
      console.warn("Error fetching collaborations:", e);
    }
  },

  render() {
    return `
      <div class="animate-fade-in">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="brand-font" style="color: var(--primary);">🤝 Collaboration Hub</h1>
            <p style="color: var(--text-muted);">Form teams, accept community project shares, and earn together in your domain.</p>
          </div>

          <button class="btn btn-primary" onclick="window.CollaborationComponent.openAICollaborationModal()">
            🤖 Create AI Team Project
          </button>
        </div>

        <!-- Active Collaborations Grid -->
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          ${(!this.activeCollaborations || this.activeCollaborations.length === 0) ? `
            <div class="card" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
              <div style="font-size: 3rem; margin-bottom: 0.8rem;">🤝</div>
              <h2 style="color: var(--secondary); margin-bottom: 0.5rem;">No Active Team Collaborations Yet</h2>
              <p>Click <strong>Create AI Team Project</strong> to automatically assemble a matched collaboration team for your skills.</p>
            </div>
          ` : this.activeCollaborations.map(c => `
            <div class="card" style="border: 2px solid var(--secondary);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--surface-border); padding-bottom: 1rem;">
                <div>
                  <span class="badge badge-accent" style="margin-bottom: 0.4rem;">Status: ${c.status}</span>
                  <h2>${c.project_name}</h2>
                  <p style="color: var(--text-muted);">Total Project Value: <strong>₹${(c.total_value || 0).toLocaleString()}</strong> • Target: <strong>${c.target_capacity} ${c.unit_type || 'Members'}</strong></p>
                </div>

                <div style="text-align: right; background: rgba(13, 148, 136, 0.15); padding: 0.8rem 1.4rem; border-radius: var(--radius-md); border: 1px solid var(--secondary);">
                  <div style="font-size: 1.6rem; font-weight: 800; color: var(--secondary);">₹${(c.my_share || 0).toLocaleString()}</div>
                  <div style="font-size: 0.85rem; color: var(--text-muted);">Your Expected Earning</div>
                </div>
              </div>

              <!-- AI Assembled Team Members -->
              <h3 style="margin: 1.2rem 0 0.8rem 0; color: var(--primary);">🤖 AI Assembled Team Members (${(c.members || []).length}/${c.target_capacity || (c.members || []).length})</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
                ${(c.members || []).map(m => `
                  <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: 1rem; display: flex; align-items: center; gap: 0.9rem;">
                    <img src="${m.avatar}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                    <div>
                      <strong style="font-size: 1.05rem; display: block;">${m.name}</strong>
                      <span style="font-size: 0.85rem; color: var(--secondary);">${m.role}</span>
                      <div style="font-size: 0.8rem; color: var(--text-muted);">Share: ${m.capacity} units (₹${m.share})</div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button class="btn btn-primary" onclick="alert('Project confirmed! Work materials dispatch scheduled.')">
                  ✅ Confirm My Participation
                </button>
                <button class="btn btn-outline" onclick="alert('Opening Team Chatroom...')">
                  💬 Group Chatroom
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  async openAICollaborationModal(oppId) {
    window.app.showLoading("AI Collaboration Engine Analyzing Skills, Distances & Team Capacity...");
    const userId = window.app.userProfile ? window.app.userProfile.id : "";
    const skills = window.app.userProfile && window.app.userProfile.skills ? window.app.userProfile.skills : [];
    const primarySkill = skills.length > 0 ? skills[0].name : "";

    const payload = {
      user_id: userId,
      skill_name: primarySkill
    };
    if (oppId) {
      payload.opportunity_id = oppId;
    }

    try {
      const res = await fetch("/api/collaborations/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const rec = await res.json();
      window.app.hideLoading();

      if (rec && rec.project_name) {
        const existingIdx = this.activeCollaborations.findIndex(c => c.project_name === rec.project_name || (rec.opportunity_id && c.opportunity_id === rec.opportunity_id));
        if (existingIdx >= 0) {
          this.activeCollaborations[existingIdx] = rec;
        } else {
          this.activeCollaborations.unshift(rec);
        }
        window.app.render();
        alert(`✨ AI Team Assembled for ${rec.project_name}! Matching SilverHands members recommended based on skills and location.`);
      }
    } catch (e) {
      window.app.hideLoading();
      console.warn("Error recommending collaboration:", e);
    }
  }
};
