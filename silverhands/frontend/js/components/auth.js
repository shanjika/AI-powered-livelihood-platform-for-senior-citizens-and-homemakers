/**
 * SilverHands Email Login & First-Time User Registration Component
 * Automatically creates/updates records in the SQLite database.
 */

window.AuthComponent = {
  isSignUpMode: false,

  render() {
    return `
      <div class="animate-fade-in" style="max-width: 580px; margin: 2rem auto;">
        <div class="card" style="border: 2px solid var(--primary); padding: 2.2rem;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">✋</div>
            <h1 class="brand-font" style="color: var(--primary); font-size: 2rem;">
              ${this.isSignUpMode ? window.i18n.t("signup_title") : window.i18n.t("login_title")}
            </h1>
            <p style="color: var(--text-muted); font-size: 1rem; margin-top: 0.4rem;">
              ${window.i18n.t("login_sub")}
            </p>
          </div>

          <div style="background: rgba(255,255,255,0.05); padding: 1.2rem; border-radius: var(--radius-md); margin-bottom: 1.8rem; border: 1px dashed var(--surface-border);">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.6rem; color: var(--secondary); text-align: center;">
              🔐 Secure community access
            </div>
            <div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">
              Sign in with your email and password to access your personalized dashboard, skill onboarding, job matches, and progress tracking.
            </div>
          </div>

          <form onsubmit="event.preventDefault(); window.AuthComponent.handleSubmit();">
            ${this.isSignUpMode ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.2rem;">
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">
                    👤 ${window.i18n.t("full_name")}
                  </label>
                  <input type="text" id="auth-name" class="chat-input" placeholder="e.g. Lakshmi Ammal" required style="width: 100%;">
                </div>

                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">
                    🎂 Age
                  </label>
                  <input type="number" id="auth-age" class="chat-input" min="18" max="100" placeholder="e.g. 58" required style="width: 100%;">
                </div>
              </div>
            ` : ''}

            <div style="margin-bottom: 1.2rem;">
              <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">
                ✉️ ${window.i18n.t("email_label")}
              </label>
              <input type="email" id="auth-email" class="chat-input" placeholder="lakshmi@example.com" required style="width: 100%;">
            </div>

            <div style="margin-bottom: 1.2rem;">
              <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">
                🔒 ${window.i18n.t("password_label")}
              </label>
              <input type="password" id="auth-password" class="chat-input" placeholder="••••••••" required style="width: 100%;">
            </div>

            ${this.isSignUpMode ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.2rem;">
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">
                    📞 ${window.i18n.t("phone_label")}
                  </label>
                  <input type="tel" id="auth-phone" class="chat-input" placeholder="+91 98401 23456" required style="width: 100%;">
                </div>

                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">
                    📍 ${window.i18n.t("district_label")}
                  </label>
                  <input type="text" id="auth-district" class="chat-input" placeholder="Chennai" required style="width: 100%;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.2rem;">
                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">
                    🏡 ${window.i18n.t("taluk_label")}
                  </label>
                  <input type="text" id="auth-taluk" class="chat-input" placeholder="Mylapore" required style="width: 100%;">
                </div>

                <div>
                  <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">
                    🏛️ ${window.i18n.t("state_label")}
                  </label>
                  <input type="text" id="auth-state" class="chat-input" value="Tamil Nadu" required style="width: 100%;">
                </div>
              </div>

              <div style="margin-bottom: 1.5rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">
                  🎓 ${window.i18n.t("education_label")}
                </label>
                <input type="text" id="auth-education" class="chat-input" placeholder="e.g. High School / Diploma (Optional)" style="width: 100%;">
              </div>
            ` : ''}

            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-bottom: 1rem;">
              ${this.isSignUpMode ? '🚀 Register & Continue ➔' : '🔑 Log In ➔'}
            </button>
          </form>

          <div style="text-align: center; border-top: 1px solid var(--surface-border); padding-top: 1rem;">
            <button class="btn btn-outline" style="font-size: 0.95rem;" onclick="window.AuthComponent.toggleMode()">
              ${this.isSignUpMode ? 'Already have an account? Log In' : 'First time user? Create an account'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  toggleMode() {
    this.isSignUpMode = !this.isSignUpMode;
    window.app.render();
  },

  async quickSwitch(userId) {
    window.app.showLoading("Switching user account...");
    await window.app.loadUserProfile(userId);
    localStorage.setItem("silverhands_user_id", userId);
    if (window.RadarComponent) {
      await window.RadarComponent.loadOpportunities();
    }
    window.app.hideLoading();
    window.app.navigate("dashboard");
  },

  async handleSubmit() {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;

    window.app.showLoading(this.isSignUpMode ? "Registering account & saving profile..." : "Authenticating email...");

    try {
      if (this.isSignUpMode) {
        const name = document.getElementById("auth-name").value.trim();
        const age = document.getElementById("auth-age").value.trim();
        const phone = document.getElementById("auth-phone").value.trim();
        const district = document.getElementById("auth-district").value.trim();
        const taluk = document.getElementById("auth-taluk").value.trim();
        const state = document.getElementById("auth-state").value.trim();
        const education = document.getElementById("auth-education").value.trim();

        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, age: age ? Number(age) : null, phone, district, taluk, state, education, language: window.i18n.currentLang })
        });
        const data = await res.json();
        window.app.hideLoading();

        if (res.ok && data.user) {
          alert(`✅ Registration Successful for ${data.user.name}!\n\nYour profile has been saved to the database. Please log in with your email and password to proceed.`);
          this.isSignUpMode = false;
          window.app.render();
          setTimeout(() => {
            const emailInput = document.getElementById("auth-email");
            if (emailInput) emailInput.value = email;
          }, 50);
        } else {
          alert(data.detail || "Registration failed.");
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        window.app.hideLoading();

        if (res.ok && data.user) {
          window.app.userProfile = data.user;
          localStorage.setItem("silverhands_user_id", data.user.id);
          localStorage.setItem("silverhands_email", email);

          if (window.RadarComponent) {
            await window.RadarComponent.loadOpportunities();
          }
          if (window.ClassesComponent) {
            await window.ClassesComponent.loadClasses();
          }

          if (Array.isArray(data.user.skills) && data.user.skills.length > 0) {
            window.app.navigate("dashboard");
          } else {
            alert(`👋 Welcome ${data.user.name}! Please enter your #1 best skill to set up your personalized AI dashboard.`);
            window.OnboardingComponent.step = 3;
            window.app.navigate("onboarding");
          }
        } else {
          alert(data.detail || "Authentication failed. Please check your credentials.");
        }
      }
    } catch (e) {
      window.app.hideLoading();
      alert("Network error during operation. Please try again.");
    }
  }
};
