/**
 * SilverHands User Earnings Dashboard & AI Income Advisor Component
 * Displays monthly income totals, source breakdowns (Classes, Services, Events, Content, Collaboration),
 * and AI Income Path Recommendations with estimated ranges.
 */

window.EarningsComponent = {
  data: null,

  async loadEarnings() {
    try {
      const res = await fetch(`/api/earnings/${window.app.userProfile.id || 'u-lakshmi-64'}`);
      this.data = await res.json();
    } catch (e) {
      console.warn("Error fetching earnings:", e);
    }
  },

  render() {
    if (!this.data) return `<div class="card">Loading earnings...</div>`;
    const d = this.data;

    return `
      <div class="animate-fade-in">
        <h1 class="brand-font" style="color: var(--primary); margin-bottom: 0.5rem;">💰 ${window.i18n.t("earnings")}</h1>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">Track your income across all skill services, classes, content, and team collaborations.</p>

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
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.2rem;">Based on your cooking & teaching profile:</p>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div style="background: rgba(0,0,0,0.25); padding: 1rem; border-radius: var(--radius-sm);">
                <strong>1. Homemade Snack Orders</strong>
                <div style="color: var(--success); font-weight: 700; margin-top: 0.2rem;">Est. Potential: ₹3,000 – ₹8,000 / month</div>
              </div>
              <div style="background: rgba(0,0,0,0.25); padding: 1rem; border-radius: var(--radius-sm);">
                <strong>2. Weekend Cooking Workshops</strong>
                <div style="color: var(--success); font-weight: 700; margin-top: 0.2rem;">Est. Potential: ₹2,000 – ₹6,000 / month</div>
              </div>
              <div style="background: rgba(0,0,0,0.25); padding: 1rem; border-radius: var(--radius-sm);">
                <strong>3. Community Event Catering</strong>
                <div style="color: var(--success); font-weight: 700; margin-top: 0.2rem;">Est. Potential: ₹5,000 – ₹15,000 / event</div>
              </div>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 1rem;">*Estimated potential based on local market rates. Not guaranteed income.</div>
          </div>
        </div>
      </div>
    `;
  }
};
