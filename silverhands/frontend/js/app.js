/**
 * SilverHands Primary Application Controller
 * Manages global view routing, state loading, senior accessibility toolbar,
 * multilingual listeners, and component assembly.
 */

class SilverHandsApp {
  constructor() {
    this.currentView = "auth"; // dashboard | auth | onboarding | confirm_skills | radar | collaboration | classes | videos | earnings | admin
    this.userProfile = null;
    this.fontSize = localStorage.getItem("silverhands_font_size") || "md";
    this.isHighContrast = localStorage.getItem("silverhands_contrast") === "true";
  }

  async init() {
    this.applyAccessibilitySettings();
    this.navigationHistory = [];
    if (window.SkillCardsComponent && typeof window.SkillCardsComponent.clearExtractedSkills === "function") {
      window.SkillCardsComponent.clearExtractedSkills();
    }
    
    // Always open directly on the login page every time opening/refreshing
    this.currentView = "auth";
    this.userProfile = null;
    localStorage.removeItem("silverhands_user_id");

    // Load public components
    await Promise.all([
      window.CollaborationComponent.loadCollaborations(),
      window.ClassesComponent.loadClasses(),
      window.AdminComponent.loadStats()
    ]);

    document.addEventListener("languageChanged", () => this.render());
    this.render();
  }

  logout() {
    this.userProfile = null;
    localStorage.removeItem("silverhands_user_id");
    this.navigationHistory = [];
    if (window.SkillCardsComponent && typeof window.SkillCardsComponent.clearExtractedSkills === "function") {
      window.SkillCardsComponent.clearExtractedSkills();
    }
    this.currentView = "auth";
    this.render();
  }

  async loadUserProfile(userId) {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        this.userProfile = await res.json();
        localStorage.setItem("silverhands_user_id", this.userProfile.id);
        if (window.ClassesComponent) {
          await window.ClassesComponent.loadClasses();
        }
      }
    } catch (e) {
      console.warn("Failed to load user profile:", e);
    }
  }

  async navigate(viewName) {
    if (!this.userProfile && viewName !== "auth") {
      this.currentView = "auth";
      this.render();
      return;
    }
    if (this.currentView !== viewName && this.currentView) {
      this.navigationHistory.push(this.currentView);
    }
    this.currentView = viewName;
    if (viewName === "classes" && window.ClassesComponent) {
      await window.ClassesComponent.loadClasses();
    }
    if (viewName === "earnings" && window.EarningsComponent) {
      await window.EarningsComponent.loadEarnings();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  }

  goBack() {
    if (this.navigationHistory.length === 0) {
      if (this.userProfile) {
        this.currentView = "dashboard";
      } else {
        this.currentView = "auth";
      }
      this.render();
      return;
    }

    const previous = this.navigationHistory.pop();
    this.currentView = previous || "dashboard";
    this.render();
  }

  setFontSize(size) {
    this.fontSize = size;
    localStorage.setItem("silverhands_font_size", size);
    this.applyAccessibilitySettings();
  }

  toggleHighContrast() {
    this.isHighContrast = !this.isHighContrast;
    localStorage.setItem("silverhands_contrast", this.isHighContrast.toString());
    this.applyAccessibilitySettings();
  }

  applyAccessibilitySettings() {
    document.body.className = `font-${this.fontSize} ${this.isHighContrast ? 'high-contrast' : ''}`;
  }

  showLoading(msg = "AI Processing...") {
    let overlay = document.getElementById("loading-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "loading-overlay";
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(10px);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: 9999; color: #fff; font-size: 1.4rem; font-weight: 700;
      `;
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div style="font-size: 3.5rem; animation: spin 1s linear infinite;">🌟</div>
      <div style="margin-top: 1rem;">${msg}</div>
    `;
    overlay.style.display = "flex";
  }

  hideLoading() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.style.display = "none";
  }

  renderNav() {
    const u = this.userProfile || { name: "Guest User", avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" };

    return `
      <header class="top-nav">
        <div class="logo-group" onclick="window.app.navigate('dashboard')" style="cursor: pointer;" title="Back to Dashboard">
          <div class="logo-badge">✋</div>
          <div>
            <div class="logo-title">SILVERHANDS</div>
            <div class="logo-tagline">${window.i18n.t('brand_tagline')}</div>
          </div>
        </div>

        <div class="nav-actions">
          <!-- Senior Accessibility Toolbar in Nav -->
          <div class="accessibility-bar" title="Senior Accessibility Controls">
            <span style="font-size: 0.85rem; color: var(--text-muted);">Text Size:</span>
            <button class="acc-btn ${this.fontSize==='sm'?'active':''}" onclick="window.app.setFontSize('sm')">A-</button>
            <button class="acc-btn ${this.fontSize==='md'?'active':''}" onclick="window.app.setFontSize('md')">A</button>
            <button class="acc-btn ${this.fontSize==='lg'?'active':''}" onclick="window.app.setFontSize('lg')">A+</button>
            <button class="acc-btn ${this.fontSize==='xl'?'active':''}" onclick="window.app.setFontSize('xl')">A++</button>
            <span style="color: var(--surface-border);">|</span>
            <button class="acc-btn ${this.isHighContrast?'active':''}" onclick="window.app.toggleHighContrast()" title="High Contrast Senior Mode">
              👁️ High Contrast
            </button>
          </div>

          <!-- Language Selector Pill -->
          <button class="btn btn-outline" style="padding: 0.4rem; border-radius: 50%; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-color: var(--surface-border); margin-right: 0.5rem;" onclick="window.app.navigate('admin')" title="Admin Dashboard">
            ⚙️
          </button>
          <select style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid var(--surface-border); border-radius: 20px; padding: 0.4rem 0.8rem; font-weight: 600; cursor: pointer;" onchange="window.i18n.setLanguage(this.value)">
            <option value="ta" ${window.i18n.currentLang==='ta'?'selected':''}>தமிழ் (Tamil)</option>
            <option value="hi" ${window.i18n.currentLang==='hi'?'selected':''}>हिंदी (Hindi)</option>
            <option value="te" ${window.i18n.currentLang==='te'?'selected':''}>తెలుగు (Telugu)</option>
            <option value="kn" ${window.i18n.currentLang==='kn'?'selected':''}>ಕನ್ನಡ (Kannada)</option>
            <option value="ml" ${window.i18n.currentLang==='ml'?'selected':''}>മലയാളം (Malayalam)</option>
            <option value="en" ${window.i18n.currentLang==='en'?'selected':''}>English</option>
          </select>

          <!-- Current User Session Profile Pill -->
          <div style="display: flex; align-items: center; gap: 0.6rem; background: rgba(255,255,255,0.08); padding: 0.3rem 0.8rem; border-radius: 30px; border: 1px solid var(--surface-border);">
            <img src="${u.avatar_url}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">
            <div style="font-size: 0.9rem; font-weight: 700; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-main);">
              ${u.name}
            </div>
            <button class="btn btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; border-color: #f87171; color: #f87171;" onclick="window.app.logout()" title="Logout">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Primary Navigation Tabs Bar -->
      <nav class="nav-tabs">
        <button class="nav-tab ${this.currentView==='dashboard'?'active':''}" onclick="window.app.navigate('dashboard')">
          🏠 My Dashboard
        </button>
        <button class="nav-tab ${this.currentView==='radar'?'active':''}" onclick="window.app.navigate('radar')">
          📍 Nearby Jobs
        </button>
        <button class="nav-tab ${this.currentView==='post_job'?'active':''}" onclick="window.app.navigate('post_job')">
          💼 Post Opportunity
        </button>
        <button class="nav-tab ${this.currentView==='collaboration'?'active':''}" onclick="window.app.navigate('collaboration')">
          🤝 Collaborations
        </button>
        <button class="nav-tab ${this.currentView==='classes'?'active':''}" onclick="window.app.navigate('classes')">
          🎓 Masterclasses
        </button>
        <button class="nav-tab ${this.currentView==='videos'?'active':''}" onclick="window.app.navigate('videos')">
          🎥 Content Studio
        </button>
        <button class="nav-tab ${this.currentView==='earnings'?'active':''}" onclick="window.app.navigate('earnings')">
          💰 Earnings
        </button>
        <button class="nav-tab ${this.currentView==='onboarding'?'active':''}" onclick="window.app.navigate('onboarding')">
          ✨ Discover Skills
        </button>
      </nav>
    `;
  }

  renderView() {
    switch (this.currentView) {
      case "auth":
        return window.AuthComponent.render();
      case "onboarding":
        if (window.OnboardingComponent.step === 1) return window.OnboardingComponent.renderLanguageSelection();
        if (window.OnboardingComponent.step === 2) return window.OnboardingComponent.renderModeSelection();
        return window.OnboardingComponent.renderAIInterview();
      case "confirm_skills":
        return window.SkillCardsComponent.renderConfirmationScreen();
      case "dashboard":
        return window.DashboardComponent.render();
      case "radar":
        return window.RadarComponent.render();
      case "collaboration":
        return window.CollaborationComponent.render();
      case "classes":
        return window.ClassesComponent.render();
      case "videos":
        return window.ContentComponent.render();
      case "earnings":
        return window.EarningsComponent.render();
      case "post_job":
        return window.PostJobComponent.render();
      case "admin":
        return window.AdminComponent.render();
      default:
        return window.DashboardComponent.render();
    }
  }

  render() {
    const root = document.getElementById("app-container");
    if (!root) return;

    const showBack = this.currentView !== "auth" && this.currentView !== "dashboard";

    root.innerHTML = `
      <div class="demo-banner" style="justify-content: space-between;">
        <div>🏦 SilverHands Community Prototype</div>
        <div style="display: flex; align-items: center; gap: 0.7rem;">
          ${showBack ? `<button class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.85rem; border-color: #fff; color: #fff;" onclick="window.app.goBack()">← Back</button>` : ``}
          <span style="font-size: 0.82rem; opacity: 0.9;">Real user flow prototype</span>
        </div>
      </div>

      ${this.renderNav()}

      <main class="main-view">
        ${this.renderView()}
      </main>

      <!-- Persistent SilverBuddy Assistant -->
      ${window.SilverBuddyComponent.renderModal()}
    `;
  }
}

window.app = new SilverHandsApp();
document.addEventListener("DOMContentLoaded", () => window.app.init());
