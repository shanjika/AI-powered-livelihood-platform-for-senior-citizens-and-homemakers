/**
 * SilverHands SilverBuddy AI Floating Voice & Text Assistant Component
 * Persistent companion capable of understanding user queries in 6 languages
 * and performing direct application routing actions.
 */

window.SilverBuddyComponent = {
  isOpen: false,
  messages: [
    { role: 'ai', text: 'Hello! I am SilverBuddy. How can I help you today?' }
  ],

  toggle() {
    this.isOpen = !this.isOpen;
    const modal = document.getElementById("silverbuddy-modal");
    if (modal) {
      if (this.isOpen) modal.classList.add("active");
      else modal.classList.remove("active");
    }
  },

  renderModal() {
    return `
      <div id="silverbuddy-modal" class="silverbuddy-modal">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--surface-border); padding-bottom: 0.8rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="font-size: 1.8rem;">🤖</span>
            <div>
              <strong style="color: var(--primary); font-size: 1.15rem;">SilverBuddy AI</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Voice & Text Companion</div>
            </div>
          </div>
          <button style="background: transparent; border: none; color: #fff; font-size: 1.4rem; cursor: pointer;" onclick="window.SilverBuddyComponent.toggle()">✖</button>
        </div>

        <div id="sb-history" style="height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.8rem; padding-right: 0.3rem;">
          ${this.messages.map(m => `
            <div class="chat-bubble ${m.role}" style="font-size: 0.95rem; padding: 0.7rem 1rem;">
              ${m.text}
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          <input type="text" id="sb-input" class="chat-input" style="padding: 0.6rem 0.9rem; font-size: 0.95rem;" placeholder="${window.i18n.t('silverbuddy_prompt')}" onkeypress="if(event.key==='Enter') window.SilverBuddyComponent.sendQuery()">
          <button class="btn btn-primary" style="padding: 0.6rem 1rem;" onclick="window.SilverBuddyComponent.sendQuery()">
            ➔
          </button>
        </div>
      </div>

      <div class="silverbuddy-fab" title="Ask SilverBuddy" onclick="window.SilverBuddyComponent.toggle()">
        🤖
      </div>
    `;
  },

  async sendQuery() {
    const input = document.getElementById("sb-input");
    const queryText = input ? input.value.trim() : "";
    if (!queryText) return;

    if (input) input.value = "";
    this.messages.push({ role: 'user', text: queryText });
    this.updateChatUI();

    const userProfile = window.app && window.app.userProfile ? window.app.userProfile : null;
    const userId = (userProfile && userProfile.id) || localStorage.getItem("silverhands_user_id") || "u-lakshmi-64";

    try {
      const res = await fetch("/api/silverbuddy/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          user_id: userId,
          lang: window.i18n && window.i18n.currentLang ? window.i18n.currentLang : "en"
        })
      });

      if (!res.ok) {
        throw new Error(`SilverBuddy request failed: ${res.status}`);
      }

      const data = await res.json();
      const answer = data && data.answer ? data.answer : "I can help you with earnings, classes, or nearby opportunities.";
      this.messages.push({ role: 'ai', text: answer });
      if (window.audioEngine && typeof window.audioEngine.speak === "function") {
        window.audioEngine.speak(answer, window.i18n && window.i18n.currentLang ? window.i18n.currentLang : "en");
      }
      this.updateChatUI();

      if (data && data.action === "navigate_earnings" && window.app) window.app.navigate("earnings");
      if (data && data.action === "navigate_classes" && window.app) window.app.navigate("classes");
      if (data && data.action === "navigate_radar" && window.app) window.app.navigate("radar");
    } catch (error) {
      console.warn("SilverBuddy query failed:", error);
      this.messages.push({
        role: 'ai',
        text: "I’m unable to reach the assistant right now, but you can still explore nearby opportunities, masterclasses, and earnings from the dashboard."
      });
      this.updateChatUI();
    }
  },

  updateChatUI() {
    const container = document.getElementById("sb-history");
    if (container) {
      container.innerHTML = this.messages.map(m => `
        <div class="chat-bubble ${m.role}" style="font-size: 0.95rem; padding: 0.7rem 1rem;">
          ${m.text}
        </div>
      `).join('');
      container.scrollTop = container.scrollHeight;
    }
  }
};
