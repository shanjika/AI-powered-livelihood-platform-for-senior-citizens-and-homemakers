/**
 * SilverHands Primary Application Controller
 * Manages global view routing, state loading, senior accessibility toolbar,
 * multilingual listeners, and component assembly.
 */

class SilverHandsApp {
  constructor() {
    this.currentView = "onboarding"; // onboarding | confirm_skills | dashboard | radar | collaboration | classes | videos | earnings | admin
    this.userProfile = null;
    this.fontSize = localStorage.getItem("silverhands_font_size") || "md";
    this.isHighContrast = localStorage.getItem("silverhands_contrast") === "true";
  }

  async init() {
    this.applyAccessibilitySettings();
    await this.loadUserProfile("u-lakshmi-64");

    // Load initial data components
    await Promise.all([
      window.RadarComponent.loadOpportunities(),
      window.CollaborationComponent.loadCollaborations(),
      window.ClassesComponent.loadClasses(),
      window.ContentComponent.loadVideos(),
      window.EarningsComponent.loadEarnings(),
      window.AdminComponent.loadStats()
    ]);

    document.addEventListener("languageChanged", () => this.render());
    this.render();
  }

  async loadUserProfile(userId) {
    try {
      const res = await fetch(`/api/users/${userId}`);
      this.userProfile = await res.json();
    } catch (e) {
      console.warn("Failed to load user profile:", e);
    }
  }

  navigate(viewName) {
    this.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    return `
      <header class="top-nav">
        <div class="logo-group" onclick="window.app.navigate('dashboard')">
          <div class="logo-badge">✋</div>
          <div>
            <div class="logo-title">SILVERHANDS</div>
            <div class="logo-tagline">${window.i18n.t('brand_tagline')}</div>
          </div>
        </div>

        <!-- Senior Accessibility Toolbar in Nav -->
        <div class="nav-actions">
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
          <select style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid var(--surface-border); border-radius: 20px; padding: 0.4rem 0.8rem; font-weight: 600; cursor: pointer;" onchange="window.i18n.setLanguage(this.value)">
            <option value="ta" ${window.i18n.currentLang==='ta'?'selected':''}>தமிழ் (Tamil)</option>
            <option value="hi" ${window.i18n.currentLang==='hi'?'selected':''}>हिंदी (Hindi)</option>
            <option value="te" ${window.i18n.currentLang==='te'?'selected':''}>తెలుగు (Telugu)</option>
            <option value="kn" ${window.i18n.currentLang==='kn'?'selected':''}>ಕನ್ನಡ (Kannada)</option>
            <option value="ml" ${window.i18n.currentLang==='ml'?'selected':''}>മലയാളം (Malayalam)</option>
            <option value="en" ${window.i18n.currentLang==='en'?'selected':''}>English</option>
          </select>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <nav class="nav-tabs">
        <button class="nav-tab ${this.currentView==='dashboard'?'active':''}" onclick="window.app.navigate('dashboard')">
          🏠 ${window.i18n.t('my_skills')}
        </button>
        <button class="nav-tab ${this.currentView==='radar'?'active':''}" onclick="window.app.navigate('radar')">
          🔎 ${window.i18n.t('opportunities')}
        </button>
        <button class="nav-tab ${this.currentView==='collaboration'?'active':''}" onclick="window.app.navigate('collaboration')">
          🤝 ${window.i18n.t('collaborations')}
        </button>
        <button class="nav-tab ${this.currentView==='classes'?'active':''}" onclick="window.app.navigate('classes')">
          🎓 ${window.i18n.t('my_classes')}
        </button>
        <button class="nav-tab ${this.currentView==='videos'?'active':''}" onclick="window.app.navigate('videos')">
          🎥 ${window.i18n.t('my_videos')}
        </button>
        <button class="nav-tab ${this.currentView==='earnings'?'active':''}" onclick="window.app.navigate('earnings')">
          💰 ${window.i18n.t('earnings')}
        </button>
        <button class="nav-tab ${this.currentView==='admin'?'active':''}" onclick="window.app.navigate('admin')">
          ⚙️ Admin
        </button>
      </nav>
    `;
  }

  renderView() {
    switch (this.currentView) {
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
      case "admin":
        return window.AdminComponent.render();
      default:
        return window.DashboardComponent.render();
    }
  }

  render() {
    const root = document.getElementById("app-container");
    if (!root) return;

    root.innerHTML = `
      <!-- Top Hackathon Demo Story Bar -->
      <div class="demo-banner">
        <div>🏆 SilverHands Ecosystem Hackathon Live Demo Mode</div>
        <button class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.85rem; border-color: #fff; color: #fff;" onclick="window.DemoStoryComponent.startGuidedDemo()">
          ▶️ ${window.DemoStoryComponent.isRunning ? `Step ${window.DemoStoryComponent.currentStep+1}/15: Next Step ➔` : 'Launch 15-Step Story Demo'}
        </button>
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
