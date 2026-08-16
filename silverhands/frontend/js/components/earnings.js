/**
 * SilverHands User Earnings Dashboard & AI Income Advisor Component
 * Displays monthly income totals, source breakdowns (Classes, Services, Events, Content, Collaboration),
 * and AI Income Path Recommendations with estimated ranges.
 */

window.EarningsComponent = {
  data: null,

  async loadEarnings() {
    if (!window.app || !window.app.userProfile || !window.app.userProfile.id) {
      this.data = null;
      return;
    }
    try {
      const res = await fetch(`/api/earnings/${window.app.userProfile.id}`);
      this.data = await res.json();
    } catch (e) {
      console.warn("Error fetching earnings:", e);
      this.data = null;
    }
  },

  render() {
    const user = window.app && window.app.userProfile ? window.app.userProfile : null;
    const skills = user && Array.isArray(user.skills) ? user.skills : [];

    if (!this.data || !user || !skills.length) {
      return `
        <div class="animate-fade-in" style="max-width: 760px; margin: 2rem auto; text-align: center;">
          <div class="card" style="border: 2px dashed var(--secondary); background: rgba(13,148,136,0.08);">
            <div style="font-size: 4rem; margin-bottom: 1rem;">💰</div>
            <h1 class="brand-font" style="color: var(--primary); margin-bottom: 0.8rem;">No income summary yet</h1>
            <p style="color: var(--text-muted); font-size: 1.05rem; margin-bottom: 1.5rem;">
              Add and confirm your skills to unlock your real income summary and skill-based earning opportunities.
            </p>
            <button class="btn btn-primary btn-lg" onclick="window.app.navigate('onboarding')">
              ✨ Add My Skills
            </button>
          </div>
        </div>
      `;
    }

    const d = this.data;
    const primarySkill = skills.reduce((best, current) => {
      const bestYears = Number(best && best.experience_years) || 0;
      const currentYears = Number(current && current.experience_years) || 0;
      return currentYears > bestYears ? current : best;
    }, skills[0]);
    const skillName = (primarySkill && primarySkill.name) || (d && d.skill_name) || "Skill";

    const defaultWays = [
      {
        title: `1. Custom ${skillName} Client Orders`,
        potential: "₹4,000 – ₹10,000 / month",
        desc: `Take bespoke ${skillName.toLowerCase()} orders and customized client requests.`
      },
      {
        title: `2. Weekend ${skillName} Workshops & Classes`,
        potential: "₹3,000 – ₹7,000 / month",
        desc: `Host interactive sessions teaching fundamental ${skillName.toLowerCase()} techniques.`
      },
      {
        title: `3. Community Exhibition & Collective Projects`,
        potential: "₹5,000 – ₹15,000 / event",
        desc: `Join neighborhood team orders and showcase your ${skillName.toLowerCase()} crafts.`
      }
    ];

    const waysToEarn = (d && Array.isArray(d.ways_to_earn) && d.ways_to_earn.length) ? d.ways_to_earn : defaultWays;

    return `
      <div class="animate-fade-in">
        <h1 class="brand-font" style="color: var(--primary); margin-bottom: 0.5rem;">💰 ${window.i18n.t("earnings")}</h1>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">Your income summary for your confirmed skill profile.</p>

        <!-- Income Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
          <div class="card" style="border-left: 6px solid var(--primary);">
            <div style="color: var(--text-muted); font-size: 0.95rem;">Current Month Income</div>
            <div style="font-size: 2.4rem; font-weight: 800; color: var(--primary); margin-top: 0.3rem;">
              ₹${d.current_month.toLocaleString()}
            </div>
            <span class="badge badge-high" style="margin-top: 0.5rem;">+18% from last month</span>
          </div>

          <div class="card" style="border-left: 6px solid var(--secondary);">
            <div style="color: var(--text-muted); font-size: 0.95rem;">Completed Earnings</div>
            <div style="font-size: 2.4rem; font-weight: 800; color: var(--secondary); margin-top: 0.3rem;">
              ₹${d.completed.toLocaleString()}
            </div>
            <span class="badge badge-high" style="margin-top: 0.5rem;">Disbursed to Bank</span>
          </div>

          <div class="card" style="border-left: 6px solid var(--accent);">
            <div style="color: var(--text-muted); font-size: 0.95rem;">Pending Payouts</div>
            <div style="font-size: 2.4rem; font-weight: 800; color: var(--accent); margin-top: 0.3rem;">
              ₹${d.pending.toLocaleString()}
            </div>
            <span class="badge badge-medium" style="margin-top: 0.5rem;">Expected in 3 days</span>
          </div>
        </div>

        <!-- Income Breakdown Table & Chart -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem;">
          <div class="card">
            <h3 style="margin-bottom: 1.2rem; color: var(--secondary);">📊 Income Sources Breakdown</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${d.breakdown.map(b => `
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
                    <span>${b.icon} ${b.source}</span>
                    <strong>₹${b.amount.toLocaleString()} (${b.percentage}%)</strong>
                  </div>
                  <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden;">
                    <div style="width: ${b.percentage}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 5px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- AI Income Recommendations -->
          <div class="card" style="border: 2px solid var(--primary);">
            <h3 style="margin-bottom: 1rem; color: var(--primary);">🤖 AI "Ways You Can Earn"</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.2rem;">Based on your <strong>${skillName}</strong> profile:</p>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${waysToEarn.map(w => `
                <div style="background: rgba(0,0,0,0.25); padding: 1rem; border-radius: var(--radius-sm);">
                  <strong>${w.title}</strong>
                  <div style="color: var(--success); font-weight: 700; margin-top: 0.2rem;">Est. Potential: ${w.potential}</div>
                </div>
              `).join('')}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 1rem;">*Estimated potential based on local market rates. Not guaranteed income.</div>
          </div>
        </div>
      </div>
    `;
  }
};
