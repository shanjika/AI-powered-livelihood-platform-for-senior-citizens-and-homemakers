/**
 * SilverHands Ecosystem Administrator Dashboard Component
 * Metrics overview of registered seniors & homemakers, active skills,
 * community collaborations, total transaction revenue generated, and location distribution.
 */

window.AdminComponent = {
  stats: null,

  async loadStats() {
    try {
      const res = await fetch("/api/admin/stats");
      this.stats = await res.json();
    } catch (e) {
      console.warn("Error fetching admin stats:", e);
    }
  },

  render() {
    if (!this.stats) return `<div class="card">Loading ecosystem analytics...</div>`;
    const s = this.stats;

    return `
      <div class="animate-fade-in">
        <h1 class="brand-font" style="color: var(--primary); margin-bottom: 0.5rem;">⚙️ Platform Ecosystem Admin</h1>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">Real-time statistics across senior citizens, homemakers, and livelihood impact.</p>

        <!-- KPI Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
          <div class="card" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--primary);">${s.total_users}</div>
            <div style="color: var(--text-muted); font-size: 0.9rem;">Total Ecosystem Users</div>
          </div>

          <div class="card" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--secondary);">${s.senior_citizens}</div>
            <div style="color: var(--text-muted); font-size: 0.9rem;">Senior Citizens</div>
          </div>

          <div class="card" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--accent);">${s.homemakers}</div>
            <div style="color: var(--text-muted); font-size: 0.9rem;">Homemakers</div>
          </div>

          <div class="card" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--success);">₹${s.total_income_generated_inr.toLocaleString()}</div>
            <div style="color: var(--text-muted); font-size: 0.9rem;">Total Income Generated</div>
          </div>
        </div>

        <!-- Breakdown Analytics -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div class="card">
            <h3 style="color: var(--secondary); margin-bottom: 1rem;">🔥 Most Popular Skills</h3>
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
              ${s.top_skills.map(sk => `
                <div style="display: flex; justify-content: space-between; padding: 0.8rem; background: rgba(0,0,0,0.2); border-radius: var(--radius-sm);">
                  <span>${sk.skill}</span>
                  <strong style="color: var(--primary);">${sk.count} active profiles</strong>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="card">
            <h3 style="color: var(--primary); margin-bottom: 1rem;">📊 Platform Activity Summary</h3>
            <div style="display: flex; flex-direction: column; gap: 0.8rem; color: var(--text-muted);">
              <div>• Active Livelihood Opportunities: <strong>${s.active_opportunities}</strong></div>
              <div>• Active AI Collaborations: <strong>${s.collaborations_active}</strong></div>
              <div>• Published Classes & Workshops: <strong>${s.classes_published}</strong></div>
              <div>• Skill Videos Uploaded: <strong>${s.videos_uploaded}</strong></div>
            </div>
          </div>
        </div>

        <!-- Job Posting Form -->
        <div class="card" style="margin-top: 2rem;">
          <h2 style="color: var(--primary); margin-bottom: 1rem;">📢 Post a Job / Opportunity</h2>
          <form id="admin-job-form" onsubmit="window.AdminComponent.postJob(event)" style="display: grid; gap: 1rem;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; margin-bottom: 0.3rem;">Job Role</label>
                <input type="text" id="job-role" class="input-field" required placeholder="e.g. Senior Cook">
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.3rem;">Category</label>
                <input type="text" id="job-category" class="input-field" required placeholder="e.g. Cooking">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; margin-bottom: 0.3rem;">Company/Organization Name</label>
                <input type="text" id="job-company" class="input-field" required placeholder="e.g. Hexaware">
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.3rem;">Location</label>
                <input type="text" id="job-location" class="input-field" required placeholder="e.g. Chennai">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; margin-bottom: 0.3rem;">Experience Required</label>
                <input type="text" id="job-experience" class="input-field" required placeholder="e.g. 5+ Years">
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.3rem;">Salary (INR)</label>
                <input type="number" id="job-salary" class="input-field" required placeholder="e.g. 25000">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; margin-bottom: 0.3rem;">Working Time</label>
                <input type="text" id="job-time" class="input-field" required placeholder="e.g. 9 AM - 5 PM">
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.3rem;">Contact Details</label>
                <input type="text" id="job-contact" class="input-field" required placeholder="Email or Phone">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Post Job to Nearby Portal</button>
          </form>

          <div id="admin-job-result" style="margin-top: 1.5rem; display: none;"></div>
        </div>

      </div>
    `;
  },

  async postJob(e) {
    e.preventDefault();
    const payload = {
      title: document.getElementById('job-role').value,
      category: document.getElementById('job-category').value,
      company: document.getElementById('job-company').value,
      location_name: document.getElementById('job-location').value,
      experience: document.getElementById('job-experience').value,
      expected_earning: parseInt(document.getElementById('job-salary').value, 10),
      time: document.getElementById('job-time').value,
      contact: document.getElementById('job-contact').value
    };

    try {
      const btn = e.target.querySelector('button');
      btn.textContent = "Posting...";
      btn.disabled = true;

      const res = await fetch("/api/opportunities/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        e.target.reset();
        const resDiv = document.getElementById('admin-job-result');
        resDiv.style.display = "block";
        resDiv.innerHTML = `
          <div style="padding: 1rem; background: rgba(34, 197, 94, 0.1); border-left: 4px solid var(--success); border-radius: var(--radius-sm);">
            <h3 style="color: var(--success); margin-bottom: 0.5rem;">✅ Job Posted Successfully!</h3>
            <p><strong>Role:</strong> ${result.opportunity.title}</p>
            <p><strong>Company:</strong> ${payload.company}</p>
            <p><strong>Location:</strong> ${result.opportunity.location_name}</p>
            <p><strong>Salary:</strong> ₹${result.opportunity.expected_earning}</p>
            <p><strong>Time:</strong> ${result.opportunity.time}</p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-muted);">This job is now visible in the Nearby Jobs portal.</p>
          </div>
        `;
      } else {
        alert("Error posting job: " + (result.detail || "Unknown error"));
      }
    } catch(err) {
      console.error(err);
      alert("Failed to post job.");
    } finally {
      const btn = e.target.querySelector('button');
      btn.textContent = "Post Job to Nearby Portal";
      btn.disabled = false;
    }
  }
};
