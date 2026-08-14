/**
 * SilverHands Skill Video Studio & Content Monetization Component
 * Simulates video upload/recording, AI auto-transcription, bilingual subtitles (Tamil & English),
 * and creator platform monetization analytics.
 */

window.ContentComponent = {
  videos: [],

  async loadVideos() {
    try {
      const res = await fetch("/api/videos");
      this.videos = await res.json();
    } catch (e) {
      console.warn("Error fetching videos:", e);
    }
  },

  render() {
    return `
      <div class="animate-fade-in">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
          <div>
            <h1 class="brand-font" style="color: var(--primary);">🎥 My Skill Videos & Creator Studio</h1>
            <p style="color: var(--text-muted);">Share tutorials. AI generates transcription & subtitles automatically.</p>
          </div>

          <button class="btn btn-primary" onclick="window.ContentComponent.openUploadModal('Traditional Cooking')">
            🎥 ${window.i18n.t("share_knowledge")}
          </button>
        </div>

        <!-- Creator Monetization Metrics Header -->
        <div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, rgba(79,70,229,0.2), rgba(13,148,136,0.2)); border: 2px solid var(--accent);">
          <h3 style="color: var(--accent); margin-bottom: 1rem;">📊 Creator Monetization Analytics</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.5rem; text-align: center;">
            <div>
              <div style="font-size: 1.8rem; font-weight: 800;">12,450</div>
              <div style="font-size: 0.88rem; color: var(--text-muted);">Total Views</div>
            </div>
            <div>
              <div style="font-size: 1.8rem; font-weight: 800;">1,280 hrs</div>
              <div style="font-size: 0.88rem; color: var(--text-muted);">Watch Time</div>
            </div>
            <div>
              <div style="font-size: 1.8rem; font-weight: 800;">850</div>
              <div style="font-size: 0.88rem; color: var(--text-muted);">Followers</div>
            </div>
            <div>
              <div style="font-size: 1.8rem; font-weight: 800; color: var(--success);">₹1,950</div>
              <div style="font-size: 0.88rem; color: var(--text-muted);">Est. Platform Earnings</div>
            </div>
          </div>
        </div>

        <!-- Videos List -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.8rem;">
          ${this.videos.map(v => `
            <div class="card">
              <img src="${v.thumbnail}" style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 1rem;">
              
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <span class="badge badge-accent">${v.category}</span>
                <span class="badge badge-high">👁️ ${v.views.toLocaleString()} views</span>
              </div>

              <h3>${v.title}</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">By ${v.author}</p>

              <!-- AI Generated Subtitles Accordion -->
              <div style="margin: 1rem 0; background: rgba(0,0,0,0.3); padding: 0.9rem; border-radius: var(--radius-sm);">
                <strong style="color: var(--secondary);">🤖 AI Subtitles (Tamil & English):</strong>
                <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.4rem;">
                  <strong>TA:</strong> ${v.subtitles_ta}<br>
                  <strong>EN:</strong> ${v.subtitles_en}
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--surface-border); padding-top: 0.8rem;">
                <span style="color: var(--success); font-weight: 700;">Est. Revenue: ₹${v.estimated_earning}</span>
                <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.88rem;" onclick="alert('Post generated!')">
                  ✨ Generate Social Post
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  async openUploadModal(category) {
    const title = prompt("Enter video title or topic:", "How I prepare traditional millet snacks");
    if (!title) return;

    window.app.showLoading("AI Transcribing Video, Generating Dual Subtitles & Monetization Tags...");
    const res = await fetch("/api/videos/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        author: window.app.userProfile.name,
        lang: window.i18n.currentLang
      })
    });
    const newVid = await res.json();
    window.app.hideLoading();

    this.videos.unshift(newVid);
    window.app.render();
    alert("🎥 Video uploaded! AI generated Tamil & English subtitles automatically.");
  }
};
