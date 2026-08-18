/**
 * SilverHands Post Opportunity Component
 * Allows users to post a job requirement/opportunity.
 */

window.PostJobComponent = {
  render() {
    return `
      <div class="animate-fade-in" style="max-width: 800px; margin: 0 auto;">
        <h1 class="brand-font" style="color: var(--primary); margin-bottom: 0.5rem;">💼 Post an Opportunity</h1>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">Fill out the details below to post a job or opportunity to the local community radar.</p>

        <div class="card">
          <form id="post-job-form" onsubmit="window.PostJobComponent.postJob(event)" style="display: grid; gap: 1rem;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">Job Role</label>
                <input type="text" id="job-role" class="form-input" required placeholder="e.g. Senior Cook">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">Category</label>
                <input type="text" id="job-category" class="form-input" required placeholder="e.g. Cooking">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">Company/Organization Name</label>
                <input type="text" id="job-company" class="form-input" required placeholder="e.g. Hexaware">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">Location</label>
                <input type="text" id="job-location" class="form-input" required placeholder="e.g. Chennai">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">Experience Required</label>
                <input type="text" id="job-experience" class="form-input" required placeholder="e.g. 5+ Years">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">Salary (INR)</label>
                <input type="number" id="job-salary" class="form-input" required placeholder="e.g. 25000">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">Working Time</label>
                <input type="text" id="job-time" class="form-input" required placeholder="e.g. 9 AM - 5 PM">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">Contact Email</label>
                <input type="email" id="job-contact" class="form-input" required placeholder="name@company.com">
              </div>
            </div>

            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">Job Description</label>
              <textarea id="job-description" class="form-input" required placeholder="Describe the job responsibilities, requirements, and any other details..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top: 1rem; width: 100%;">Post Job to Nearby Portal</button>
          </form>

          <div id="post-job-result" style="margin-top: 1.5rem; display: none;"></div>
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
      contact: document.getElementById('job-contact').value,
      description: document.getElementById('job-description').value
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
        const resDiv = document.getElementById('post-job-result');
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
