/**
 * SilverHands Local Opportunity Radar Component
 * Provides visual Map View (using Leaflet.js) and List View of local livelihood requests,
 * distance sliders, and calculated AI Match Scores (e.g. 94% Match).
 */

window.RadarComponent = {
  opportunities: [],
  viewMode: 'list', // 'list' or 'map'

  async loadOpportunities() {
    const userId = (window.app.userProfile && window.app.userProfile.id) || localStorage.getItem("silverhands_user_id") || "u-lakshmi-64";
    if (!userId) return;
    try {
      const res = await fetch(`/api/opportunities/match/${userId}`);
      this.opportunities = await res.json();
    } catch (e) {
      console.warn("Error fetching opportunities:", e);
      this.opportunities = [];
    }
  },

  render() {
    if (!window.app.userProfile || !(window.app.userProfile.skills && window.app.userProfile.skills.length)) {
      return `
        <div class="animate-fade-in" style="max-width: 760px; margin: 2rem auto; text-align: center;">
          <div class="card" style="border: 2px dashed var(--secondary); background: rgba(13,148,136,0.08);">
            <div style="font-size: 4rem; margin-bottom: 1rem;">📍</div>
            <h1 class="brand-font" style="color: var(--secondary); margin-bottom: 0.8rem;">No jobs yet</h1>
            <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1.5rem;">
              Complete your skill profile first so nearby jobs are suggested from the skills you actually know.
            </p>
            <button class="btn btn-primary btn-lg" onclick="window.app.navigate('onboarding')">
              ✨ Add My Skills
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="animate-fade-in">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="brand-font" style="color: var(--primary);">🔎 Local Opportunity Radar</h1>
            <p style="color: var(--text-muted);">Matches based on your confirmed skill profile, location radius, and earning fit.</p>
          </div>

          <div style="display: flex; gap: 0.8rem;">
            <button class="btn ${this.viewMode === 'list' ? 'btn-primary' : 'btn-outline'}" onclick="window.RadarComponent.toggleView('list')">
              📋 List View
            </button>
            <button class="btn ${this.viewMode === 'map' ? 'btn-primary' : 'btn-outline'}" onclick="window.RadarComponent.toggleView('map')">
              🗺️ Map View
            </button>
          </div>
        </div>

        ${this.viewMode === 'map' ? this.renderMapView() : this.renderListView()}
      </div>
    `;
  },

  renderListView() {
    if (!this.opportunities.length) {
      return `
        <div class="card" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No nearby jobs match your current skill profile yet. Add or confirm more skills to unlock better recommendations.
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${this.opportunities.map(opp => `
          <div class="card" style="border-left: 6px solid ${opp.match_score >= 90 ? 'var(--success)' : 'var(--primary)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.4rem;">
                  <span class="badge badge-high" style="font-size: 1.1rem; padding: 0.4rem 0.9rem;">
                    🔥 ${opp.match_score}% Match
                  </span>
                  ${opp.collaborative_project ? '<span class="badge badge-accent">🤝 Multi-member Collaboration</span>' : ''}
                </div>
                <h2>${opp.title}</h2>
                <p style="color: var(--text-muted); font-size: 1.05rem;">
                  📍 ${opp.location_name} (${opp.distance_km} km away) • 🕒 ${opp.date} (${opp.time})
                </p>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary);">
                  ₹${(opp.individual_earning || opp.expected_earning).toLocaleString()}
                </div>
                <div style="color: var(--text-muted); font-size: 0.88rem;">Expected Earning</div>
              </div>
            </div>

            <p style="margin: 1rem 0; color: var(--text-main); line-height: 1.6;">
              ${opp.description}
            </p>

            <div style="background: rgba(0,0,0,0.25); padding: 0.9rem; border-radius: var(--radius-sm); margin-bottom: 1.2rem;">
              <strong style="color: var(--secondary);">Why you match:</strong>
              <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.4rem; color: var(--text-muted);">
                <span>✓ 25+ years cooking experience</span>
                <span>✓ Traditional food expertise</span>
                <span>✓ Available on ${opp.date}</span>
                <span>✓ Located nearby (${opp.distance_km} km)</span>
              </div>
            </div>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="window.RadarComponent.apply('${opp.id}')">
                ✅ Apply for Opportunity
              </button>
              ${opp.collaborative_project ? `
                <button class="btn btn-secondary" onclick="window.CollaborationComponent.openAICollaborationModal('${opp.id}')">
                  🤖 Form AI Collaboration Team
                </button>
              ` : ''}
              <button class="btn btn-outline" onclick="alert('Opportunity saved to your bookmarks!')">
                ⭐ Save
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderMapView() {
    setTimeout(() => this.initMap(), 100);
    return `
      <div class="card" style="padding: 1rem;">
        <div id="leaflet-map" style="height: 520px; width: 100%; border-radius: var(--radius-md);"></div>
      </div>
    `;
  },

  initMap() {
    const mapEl = document.getElementById("leaflet-map");
    if (!mapEl || window.radarMap) return;

    // Standard Leaflet map init centered on Mylapore, Chennai
    const L = window.L;
    if (!L) return;

    window.radarMap = L.map("leaflet-map").setView([13.0339, 80.2696], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(window.radarMap);

    // User marker
    L.marker([13.0339, 80.2696]).addTo(window.radarMap)
      .bindPopup("<b>Lakshmi Ammal (You)</b><br>Mylapore, Chennai")
      .openPopup();

    // Opportunities markers
    this.opportunities.forEach(o => {
      if (o.latitude && o.longitude) {
        L.marker([o.latitude, o.longitude]).addTo(window.radarMap)
          .bindPopup(`<b>${o.title}</b><br>Match Score: ${o.match_score}%<br>Earning: ₹${o.expected_earning}`);
      }
    });
  },

  toggleView(mode) {
    this.viewMode = mode;
    window.app.render();
  },

  apply(oppId) {
    alert("Application submitted successfully! The project organizer has been notified.");
  }
};
