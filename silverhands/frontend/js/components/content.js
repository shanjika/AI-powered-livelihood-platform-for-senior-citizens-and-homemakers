/**
 * SilverHands Skill Video Studio & Content Monetization Component
 * Simulates video upload/recording, AI auto-transcription, bilingual subtitles (Tamil & English),
 * and creator platform monetization analytics.
 */

window.ContentComponent = {
  videos: [],
  relevantOpportunities: [],

  async loadVideos() {
    const user = window.app && window.app.userProfile ? window.app.userProfile : null;
    const userId = user && user.id ? user.id : "";
    if (!userId || !Array.isArray(user.skills) || !user.skills.length) {
      this.videos = [];
      this.relevantOpportunities = [];
      return;
    }

    try {
      const res = await fetch(`/api/videos?user_id=${encodeURIComponent(userId)}`);
      this.videos = await res.json();
      await this.loadRelevantOpportunities();
    } catch (e) {
      console.warn("Error fetching videos:", e);
      this.videos = [];
      this.relevantOpportunities = [];
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

  getSkillImage(skillName) {
    const normalized = (skillName || '').toLowerCase();
    const imageMap = {
      pottery: 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=900&q=80',
      clay: 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=900&q=80',
      handicraft: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80',
      tailoring: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=900&q=80',
      cooking: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80',
      gardening: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
      teaching: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80',
      music: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
      art: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80'
    };
    for (const key in imageMap) {
      if (normalized.includes(key)) return imageMap[key];
    }
    return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80';
  },

  render() {
    const user = window.app && window.app.userProfile ? window.app.userProfile : null;
    const skills = user && Array.isArray(user.skills) ? user.skills : [];

    if (!user || !skills.length) {
      return `
        <div class="animate-fade-in" style="max-width: 760px; margin: 2rem auto; text-align: center;">
          <div class="card" style="border: 2px dashed var(--primary); background: rgba(217,119,6,0.08);">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎥</div>
            <h1 class="brand-font" style="color: var(--primary); margin-bottom: 0.8rem;">Add your skill first</h1>
            <p style="color: var(--text-muted); font-size: 1.05rem; margin-bottom: 1.5rem;">
              Your content studio only shows videos and opportunities for the skills you confirm on your profile.
            </p>
            <button class="btn btn-primary btn-lg" onclick="window.app.navigate('onboarding')">
              ✨ Add My Skills
            </button>
          </div>
        </div>
      `;
    }

    const primarySkill = skills.reduce((best, current) => {
      const bestYears = Number(best && best.experience_years) || 0;
      const currentYears = Number(current && current.experience_years) || 0;
      return currentYears > bestYears ? current : best;
    }, skills[0]);

    const summary = this.videos.reduce((acc, v) => {
      const views = Number(v.views || 0);
      const watchHours = Number(v.watch_time_hours || 0);
      const followers = Number(v.followers || 0);
      const earnings = Number(v.estimated_earning || 0);
      acc.views += views;
      acc.watchHours += watchHours;
      acc.followers += followers;
      acc.earnings += earnings;
      return acc;
    }, { views: 0, watchHours: 0, followers: 0, earnings: 0 });

    const skillName = primarySkill.name || 'Your Skill';
    const heroImage = this.getSkillImage(skillName);

    return `
      <div class="animate-fade-in">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
          <div>
            <h1 class="brand-font" style="color: var(--primary);">🎥 My Skill Videos & Creator Studio</h1>
            <p style="color: var(--text-muted);">Share tutorials. AI generates transcription & subtitles automatically.</p>
          </div>

          <button class="btn btn-primary" onclick="window.ContentComponent.openUploadModal('${skillName.replace(/'/g, "\\'")}')">
            🎥 ${window.i18n.t("share_knowledge")}
          </button>
        </div>

        <!-- Creator Monetization Metrics Header -->
        <div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, rgba(79,70,229,0.2), rgba(13,148,136,0.2)); border: 2px solid var(--accent);">
          <h3 style="color: var(--accent); margin-bottom: 1rem;">📊 Creator Monetization Analytics</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.5rem; text-align: center;">
            <div>
              <div style="font-size: 1.8rem; font-weight: 800;">${summary.views.toLocaleString()}</div>
              <div style="font-size: 0.88rem; color: var(--text-muted);">Total Views</div>
            </div>
            <div>
              <div style="font-size: 1.8rem; font-weight: 800;">${summary.watchHours.toLocaleString()} hrs</div>
              <div style="font-size: 0.88rem; color: var(--text-muted);">Watch Time</div>
            </div>
            <div>
              <div style="font-size: 1.8rem; font-weight: 800;">${summary.followers.toLocaleString()}</div>
              <div style="font-size: 0.88rem; color: var(--text-muted);">Followers</div>
            </div>
            <div>
              <div style="font-size: 1.8rem; font-weight: 800; color: var(--success);">₹${summary.earnings.toLocaleString()}</div>
              <div style="font-size: 0.88rem; color: var(--text-muted);">Est. Platform Earnings</div>
            </div>
          </div>
        </div>

        ${this.relevantOpportunities.length ? `
          <div style="margin: 1.8rem 0;">
            <h3 style="color: var(--secondary); margin-bottom: 1rem;">💼 ${primarySkill.name} Skill Opportunities</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
              ${this.relevantOpportunities.map(job => `
                <div class="card" style="padding: 1rem; border: 1px solid var(--surface-border);">
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">${job.location_name || 'Local Market'}</div>
                  <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.4rem; color: var(--text-main);">${job.title}</div>
                  <div style="font-size: 0.9rem; color: var(--primary); margin-bottom: 0.5rem;">₹${Number(job.expected_earning || job.individual_earning || 0).toLocaleString()} • ${job.match_score || 95}% fit</div>
                  <div style="font-size: 0.85rem; color: var(--text-muted);">${job.description || 'Relevant local opportunity for your current skill.'}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Videos List -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.8rem;">
          ${this.videos.map(v => {
            const thumbnail = v.thumbnail || this.getSkillImage(v.category || skillName);
            return `
            <div class="card">
              <img src="${thumbnail}" style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 1rem;">
              
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
          `;
          }).join('')}
        </div>
      </div>
    `;
  },

  async openUploadModal(category) {
    const userSkills = (window.app && window.app.userProfile && Array.isArray(window.app.userProfile.skills)) ? window.app.userProfile.skills.map(s => s.name || s) : [];
    const defaultSkill = category || (userSkills[0] || 'Traditional Cooking');
    const title = prompt("Enter video title or topic:", `How I teach ${defaultSkill} step by step`);
    if (!title) return;

    window.app.showLoading("AI Transcribing Video, Generating Dual Subtitles & Monetization Tags...");
    const res = await fetch("/api/videos/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category: defaultSkill,
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
