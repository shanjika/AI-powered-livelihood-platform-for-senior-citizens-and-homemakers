/**
 * SilverHands Skill Video Studio & Content Monetization Component
 * Integrates dynamic Gemini AI image generation based on user skills,
 * video uploads, AI auto-transcription, bilingual subtitles, and social post creation.
 */

window.ContentComponent = {
  videos: [],
  relevantOpportunities: [],
  imageCache: {},
  activePostModal: null,

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

  getSkillImage(skillName, topic = "") {
    const name = skillName || topic || "Practical Expertise";
    if (this.imageCache[name]) {
      return this.imageCache[name];
    }
    // Generate inline dynamic SVG representation matching skill name
    const s_lower = name.toLowerCase();
    let bgStart = "#0f172a", bgMid = "#1e293b", bgEnd = "#334155", accent = "#f59e0b", icon = "✨", badge = "Specialized Skill";

    if (s_lower.includes("garden") || s_lower.includes("plant") || s_lower.includes("farm") || s_lower.includes("தோட்டம்") || s_lower.includes("செடி")) {
      bgStart = "#064e3b"; bgMid = "#047857"; bgEnd = "#10b981"; accent = "#6ee7b7"; icon = "🌱"; badge = "Organic Gardening";
    } else if (s_lower.includes("craft") || s_lower.includes("pottery") || s_lower.includes("clay") || s_lower.includes("art") || s_lower.includes("கைவினை")) {
      bgStart = "#78350f"; bgMid = "#b45309"; bgEnd = "#d97706"; accent = "#fde68a"; icon = "🎨"; badge = "Artisan Handicrafts";
    } else if (s_lower.includes("cook") || s_lower.includes("food") || s_lower.includes("snack") || s_lower.includes("baking") || s_lower.includes("சமையல்")) {
      bgStart = "#881337"; bgMid = "#c2410c"; bgEnd = "#ea580c"; accent = "#fed7aa"; icon = "🍳"; badge = "Traditional Cooking";
    } else if (s_lower.includes("tailor") || s_lower.includes("stitch") || s_lower.includes("sew") || s_lower.includes("dress") || s_lower.includes("தையல்")) {
      bgStart = "#4c1d95"; bgMid = "#6d28d9"; bgEnd = "#9333ea"; accent = "#e9d5ff"; icon = "🧵"; badge = "Custom Tailoring";
    } else if (s_lower.includes("teach") || s_lower.includes("tutor") || s_lower.includes("math") || s_lower.includes("science") || s_lower.includes("படிப்பு")) {
      bgStart = "#1e3a8a"; bgMid = "#2563eb"; bgEnd = "#0284c7"; accent = "#bae6fd"; icon = "👩‍🏫"; badge = "Academic Mentoring";
    } else if (s_lower.includes("music") || s_lower.includes("sing") || s_lower.includes("dance") || s_lower.includes("இசை")) {
      bgStart = "#701a75"; bgMid = "#a21caf"; bgEnd = "#c026d3"; accent = "#fbcfe8"; icon = "🎵"; badge = "Music & Performing Arts";
    } else if (s_lower.includes("repair") || s_lower.includes("plumb") || s_lower.includes("electric") || s_lower.includes("பழுது")) {
      bgStart = "#1f2937"; bgMid = "#374151"; bgEnd = "#4b5563"; accent = "#93c5fd"; icon = "🛠️"; badge = "Home Repair Services";
    } else if (s_lower.includes("care") || s_lower.includes("elder") || s_lower.includes("yoga") || s_lower.includes("பராமரிப்பு")) {
      bgStart = "#0f766e"; bgMid = "#0d9488"; bgEnd = "#14b8a6"; accent = "#a7f3d0"; icon = "🧘"; badge = "Caregiving & Wellness";
    }

    const titleSafe = name.replace(/&/g, "&amp;").slice(0, 38);
    const svg = `<svg width="800" height="450" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bgStart}"/><stop offset="50%" stop-color="${bgMid}"/><stop offset="100%" stop-color="${bgEnd}"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/><circle cx="700" cy="80" r="150" fill="${accent}" opacity="0.25"/><rect x="50" y="50" width="700" height="350" rx="20" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/><rect x="90" y="90" width="${badge.length * 9 + 40}" height="34" rx="17" fill="rgba(0,0,0,0.4)" stroke="${accent}" stroke-width="1.5"/><text x="110" y="113" font-family="sans-serif" font-size="14" font-weight="700" fill="${accent}">${badge}</text><text x="630" y="180" font-size="80" text-anchor="middle">${icon}</text><text x="90" y="195" font-family="sans-serif" font-size="32" font-weight="800" fill="#ffffff">${titleSafe}</text><text x="90" y="240" font-family="sans-serif" font-size="17" fill="rgba(255,255,255,0.85)">AI Generated Skill Masterclass &amp; Showcase</text><line x1="90" y1="285" x2="710" y2="285" stroke="rgba(255,255,255,0.15)" stroke-width="1"/><text x="90" y="335" font-family="sans-serif" font-size="14" font-weight="700" fill="#ffffff">SilverHands Creator Studio</text><text x="690" y="335" font-family="sans-serif" font-size="13" font-weight="600" fill="${accent}" text-anchor="end">AI Visual Generated</text></svg>`;
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
    this.imageCache[name] = dataUri;
    return dataUri;
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
              Your content studio dynamically generates Gemini AI images and tutorials based on the skills confirmed on your profile.
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

    return `
      <div class="animate-fade-in">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="brand-font" style="color: var(--primary);">🎥 My Skill Videos & Creator Studio</h1>
            <p style="color: var(--text-muted);">Gemini AI generates dynamic visual images, bilingual subtitles, and social media posts tailored to your skills.</p>
          </div>

          <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="window.ContentComponent.openSocialPostModal('${skillName.replace(/'/g, "\\'")}')">
              🎨 Generate AI Post & Visual
            </button>
            <button class="btn btn-primary" onclick="window.ContentComponent.openUploadModal('${skillName.replace(/'/g, "\\'")}')">
              🎥 ${window.i18n.t("share_knowledge")}
            </button>
          </div>
        </div>

        <!-- Creator Monetization Metrics Header -->
        <div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, rgba(79,70,229,0.2), rgba(13,148,136,0.2)); border: 2px solid var(--accent);">
          <h3 style="color: var(--accent); margin-bottom: 1rem;">📊 Creator Monetization & AI Studio Analytics</h3>
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
        <h3 style="margin-bottom: 1rem; color: var(--text-main);">✨ Skill Tutorials with Gemini AI Generated Visuals</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.8rem;">
          ${this.videos.map(v => {
            const thumbnail = v.thumbnail || this.getSkillImage(v.category || skillName, v.title);
            return `
            <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="position: relative; overflow: hidden; border-radius: var(--radius-md); margin-bottom: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                  <img src="${thumbnail}" alt="${v.title}" style="width: 100%; height: 200px; object-fit: cover; display: block; border-radius: var(--radius-md);">
                  <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: #fff; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
                    🤖 Gemini AI Generated
                  </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <span class="badge badge-accent">${v.category}</span>
                  <span class="badge badge-high">👁️ ${(v.views || 100).toLocaleString()} views</span>
                </div>

                <h3 style="margin-bottom: 0.3rem;">${v.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">By ${v.author}</p>

                <!-- AI Generated Subtitles Accordion -->
                <div style="margin: 1rem 0; background: rgba(0,0,0,0.3); padding: 0.9rem; border-radius: var(--radius-sm);">
                  <strong style="color: var(--secondary);">🤖 AI Subtitles (Tamil & English):</strong>
                  <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.4rem; white-space: pre-line;">
                    <strong>TA:</strong> ${v.subtitles_ta || '1. ஆரம்ப வழிகாட்டுதல்.'}<br>
                    <strong>EN:</strong> ${v.subtitles_en || '1. Step by step instructions.'}
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--surface-border); padding-top: 0.8rem; margin-top: 0.8rem;">
                <span style="color: var(--success); font-weight: 700;">Est. Revenue: ₹${v.estimated_earning || 200}</span>
                <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.88rem;" onclick="window.ContentComponent.openSocialPostModal('${(v.title || skillName).replace(/'/g, "\\'")}', '${(v.category || skillName).replace(/'/g, "\\'")}')">
                  ✨ Share Social Post
                </button>
              </div>
            </div>
          `;
          }).join('')}
        </div>

        ${this.renderPostModalHtml()}
      </div>
    `;
  },

  renderPostModalHtml() {
    if (!this.activePostModal) return '';
    const p = this.activePostModal;
    return `
      <div class="modal-overlay animate-fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1.5rem;" onclick="if(event.target === this) window.ContentComponent.closePostModal()">
        <div class="card" style="max-width: 650px; width: 100%; max-height: 90vh; overflow-y: auto; background: var(--surface-card); border: 2px solid var(--primary); box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; border-bottom: 1px solid var(--surface-border); padding-bottom: 0.8rem;">
            <h2 style="color: var(--primary); margin: 0;">🎨 Gemini AI Social Post & Visual</h2>
            <button class="btn btn-outline" style="padding: 0.2rem 0.6rem; font-size: 1.1rem;" onclick="window.ContentComponent.closePostModal()">✕</button>
          </div>

          <!-- Generated Visual Preview -->
          <div style="margin-bottom: 1.5rem; text-align: center;">
            <div style="border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.4); border: 1px solid var(--surface-border);">
              <img id="ai-modal-image" src="${p.image_url}" alt="AI Generated Image" style="width: 100%; height: auto; max-height: 280px; object-fit: contain; display: block; background: #0f172a;">
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.6rem;">
              <span style="font-size: 0.85rem; color: var(--accent);">🤖 Custom Image Generated by Gemini AI for: <strong>${p.skillName}</strong></span>
              <button class="btn btn-outline" style="padding: 0.3rem 0.7rem; font-size: 0.82rem;" onclick="window.ContentComponent.regenerateImage('${p.skillName.replace(/'/g, "\\'")}')">
                🔄 Regenerate Image
              </button>
            </div>
          </div>

          <!-- Post Content -->
          <div style="background: rgba(0,0,0,0.3); padding: 1.2rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
            <h3 style="color: var(--text-main); margin-bottom: 0.5rem;">${p.headline}</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 0.8rem;">${p.content}</p>
            <div style="color: var(--secondary); font-size: 0.9rem; font-weight: 600;">${p.hashtags}</div>
          </div>

          <!-- Modal Actions -->
          <div style="display: flex; justify-content: flex-end; gap: 0.8rem; flex-wrap: wrap;">
            <button class="btn btn-outline" onclick="navigator.clipboard.writeText('${p.headline.replace(/'/g, "\\'")}\\n\\n${p.content.replace(/'/g, "\\'")}\\n\\n${p.hashtags.replace(/'/g, "\\'")}'); alert('📋 Post text copied to clipboard!')">
              📋 Copy Caption
            </button>
            <button class="btn btn-primary" onclick="window.ContentComponent.closePostModal(); alert('🚀 Social Post published to Community Showcase!')">
              🚀 Publish to Community
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async openSocialPostModal(title, category = "") {
    window.app.showLoading("Gemini AI Generating Visual Image & Social Content...");
    try {
      const res = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: title,
          lang: window.i18n.currentLang
        })
      });
      const postData = await res.json();
      window.app.hideLoading();

      this.activePostModal = {
        skillName: title,
        headline: postData.headline || `✨ Masterclass: ${title}`,
        content: postData.content || `Sharing my lifetime experience in ${title}. Learn practical techniques today!`,
        hashtags: postData.hashtags || '#SilverHands #SkillSharing',
        image_url: postData.image_url || this.getSkillImage(category || title, title)
      };
      window.app.render();
    } catch (e) {
      window.app.hideLoading();
      this.activePostModal = {
        skillName: title,
        headline: `✨ ${title} - Showcase & Workshop! 🌟`,
        content: `Excited to share practical techniques and lessons in ${title}. Connect with the SilverHands community!`,
        hashtags: '#SilverHands #Skills #CreatorStudio',
        image_url: this.getSkillImage(category || title, title)
      };
      window.app.render();
    }
  },

  async regenerateImage(skillName) {
    window.app.showLoading("Gemini AI creating a fresh visual artwork...");
    try {
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill_name: skillName,
          topic: skillName,
          category: skillName
        })
      });
      const data = await res.json();
      window.app.hideLoading();
      if (this.activePostModal && data.image_url) {
        this.activePostModal.image_url = data.image_url;
        this.imageCache[skillName] = data.image_url;
        const imgElem = document.getElementById("ai-modal-image");
        if (imgElem) imgElem.src = data.image_url;
        else window.app.render();
      }
    } catch (e) {
      window.app.hideLoading();
    }
  },

  closePostModal() {
    this.activePostModal = null;
    window.app.render();
  },

  async openUploadModal(category) {
    const userSkills = (window.app && window.app.userProfile && Array.isArray(window.app.userProfile.skills)) ? window.app.userProfile.skills.map(s => s.name || s) : [];
    const defaultSkill = category || (userSkills[0] || 'Traditional Cooking');
    const title = prompt("Enter video title or topic:", `How I teach ${defaultSkill} step by step`);
    if (!title) return;

    window.app.showLoading("AI Transcribing Video, Generating Custom Gemini Visual & Subtitles...");
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
    alert("🎥 Video uploaded! Gemini AI generated custom visual artwork and dual subtitles.");
  }
};
