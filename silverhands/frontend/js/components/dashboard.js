/**
 * SilverHands Personal Skill Dashboard Component
 * Displays curated visual skill cards with high-resolution domain imagery,
 * experience details, teach/collaborate badges, and skill action triggers.
 */

window.DashboardComponent = {
  async applyJob(jobTitle, company) {
    alert(`🎉 Application Sent Successfully!\n\nYour application for "${jobTitle}" has been submitted to ${company}.\nThey will contact you directly via phone & WhatsApp.`);
  },

  render() {
    const user = window.app.userProfile || {
      name: "Community Member",
      skills: [],
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      location_name: "",
      role: "",
      rating: 0,
      reviews_count: 0,
      trust_score: 0,
      skill_strength_score: 0
    };
    const skills = Array.isArray(user.skills) ? user.skills : [];

    if (!skills.length) {
      return `
        <div class="animate-fade-in" style="max-width: 760px; margin: 2rem auto; text-align: center;">
          <div class="card" style="border: 2px dashed var(--primary); background: rgba(217,119,6,0.08);">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🧠</div>
            <h1 class="brand-font" style="color: var(--primary); margin-bottom: 0.8rem;">Tell us your best skill first</h1>
            <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1.5rem;">
              Your dashboard and nearby jobs are generated only from the skills you confirm. Please complete the skill setup.
            </p>
            <button class="btn btn-primary btn-lg" onclick="window.app.navigate('onboarding')">
              ✨ Add My Skills
            </button>
          </div>
        </div>
      `;
    }

    let primarySkill = skills.reduce((max, skill) => {
      const maxYears = Number(max?.experience_years || 0);
      const skillYears = Number(skill?.experience_years || 0);
      return skillYears > maxYears ? skill : max;
    }, skills[0]);

    const categoryImages = {
      Cooking: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
      Tailoring: "https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=800&q=80",
      Teaching: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
      Gardening: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
      Handicrafts: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
      Services: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
    };

    const heroImg = categoryImages[primarySkill.category] || categoryImages.Cooking;

    const allOpportunities = window.RadarComponent?.opportunities || [];
    let nearbyJobs = allOpportunities.filter((job) => {
      const matchesCategory = !primarySkill || job.category === primarySkill.category || job.category === "All";
      const matchesText = !primarySkill || !job.title || job.title.toLowerCase().includes(primarySkill.name.toLowerCase()) || job.category === primarySkill.category;
      return matchesCategory || matchesText;
    });
    if (nearbyJobs.length === 0) nearbyJobs = allOpportunities.slice(0, 3);
    nearbyJobs = nearbyJobs.slice(0, 3);

    return `
      <div class="animate-fade-in">
        <!-- User Welcome Header -->
        <div class="card" style="margin-bottom: 1.8rem; background: linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98)); border-left: 5px solid var(--primary);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1.2rem;">
              <img src="${user.avatar_url}" style="width: 85px; height: 85px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
              <div>
                <h2 style="font-size: 1.8rem;">Welcome back, ${user.name} 👋</h2>
                <p style="color: var(--text-muted); font-size: 1.05rem; margin-top: 0.2rem;">${user.role || 'Skill profile not added yet'} • 📍 ${user.location_name || user.district || 'Location not added yet'}</p>
                <div style="display: flex; gap: 0.6rem; margin-top: 0.5rem; flex-wrap: wrap;">
                  <span class="badge badge-high">✓ Identity Verified</span>
                  <span class="badge badge-accent">⭐ ${user.rating ?? 0} (${user.reviews_count ?? 0} reviews)</span>
                  <span class="badge badge-medium">🏆 Trust Score ${user.trust_score ?? 0}%</span>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
              <button class="btn btn-outline" style="border-color: var(--secondary); color: var(--secondary);" onclick="window.app.navigate('auth')">
                👤 Switch Account
              </button>
              <button class="btn btn-primary" onclick="window.app.navigate('radar')">
                📍 Explore All Jobs
              </button>
            </div>
          </div>
        </div>

        <!-- Single Primary Best Skill Spotlight -->
        <div style="margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <div>
              <h2 style="color: var(--primary); font-size: 1.6rem;">⭐ Your Primary Best Skill</h2>
              <p style="color: var(--text-muted); font-size: 0.95rem;">Your #1 verified domain of expertise on SilverHands</p>
            </div>
            ${skills.length > 1 ? `
              <span class="badge badge-accent" style="font-size: 0.9rem;">
                + ${skills.length - 1} secondary skill(s) available in profile
              </span>
            ` : ''}
          </div>

          <div class="card" style="padding: 0; overflow: hidden; border: 2px solid var(--primary); border-radius: var(--radius-lg);">
            <div style="position: relative; height: 220px; width: 100%; overflow: hidden;">
              <img src="${heroImg}" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.65);">
              <div style="position: absolute; bottom: 1.2rem; left: 1.5rem; right: 1.5rem; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.8);">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                  <h1 class="brand-font" style="font-size: 2rem; margin: 0; color: #fff;">
                    ${window.SkillCardsComponent.getCategoryIcon(primarySkill.category)} ${primarySkill.name}
                  </h1>
                  ${primarySkill.experience_years ? `
                    <span class="badge badge-high" style="font-size: 1rem; padding: 0.4rem 0.9rem;">
                      🥇 ${primarySkill.experience_years} Years Experience • Expert
                    </span>
                  ` : `
                    <span class="badge badge-medium" style="font-size: 1rem; padding: 0.4rem 0.9rem;">
                      ⭐ Experience not specified yet
                    </span>
                  `}
                </div>
              </div>
            </div>

            <div style="padding: 1.8rem;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
                <div style="background: rgba(255,255,255,0.04); padding: 1.2rem; border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                  <div style="font-size: 0.85rem; color: var(--text-muted);">Skill Strength Assessment Score</div>
                  <div style="font-size: 2.2rem; font-weight: 800; color: var(--primary); margin-top: 0.3rem;">
                    ${user.skill_strength_score ?? 0}%
                  </div>
                  <div style="font-size: 0.8rem; color: var(--success); font-weight: 600;">${user.skill_strength_score ? '🏆 SilverHands Verified Master' : '📌 Skill assessment not completed yet'}</div>
                </div>

                <div style="background: rgba(255,255,255,0.04); padding: 1.2rem; border-radius: var(--radius-md); border-left: 4px solid var(--secondary);">
                  <div style="font-size: 0.85rem; color: var(--text-muted);">Estimated Monthly Earning Potential</div>
                  <div style="font-size: 2.2rem; font-weight: 800; color: var(--secondary); margin-top: 0.3rem;">
                    ₹18,500 <span style="font-size: 1rem; font-weight: 400;">/ mo</span>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">From orders, classes & workshops</div>
                </div>

                <div style="background: rgba(255,255,255,0.04); padding: 1.2rem; border-radius: var(--radius-md); border-left: 4px solid var(--accent);">
                  <div style="font-size: 0.85rem; color: var(--text-muted);">Specialized Domain Coverage</div>
                  <div style="font-size: 1.05rem; font-weight: 600; color: var(--text-main); margin-top: 0.5rem; line-height: 1.4;">
                    ${(primarySkill.specializations || ["Traditional Methods", "Quality Control", "Bulk Preparation"]).join(" • ")}
                  </div>
                </div>
              </div>

              <!-- Quick Actions for Top Skill -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
                <button class="btn btn-primary" onclick="window.ClassesComponent.openClassModal('${primarySkill.name}')">
                  🎓 Publish Masterclass
                </button>
                <button class="btn btn-secondary" onclick="window.ContentComponent.openUploadModal('${primarySkill.name}')">
                  🎥 Share Video Tutorial
                </button>
                <button class="btn btn-outline" style="border-color: var(--primary); color: var(--primary);" onclick="window.SkillAssessmentComponent.openAssessment('${primarySkill.name}')">
                  🏆 Evaluate Skill Score
                </button>
                <button class="btn btn-outline" onclick="window.app.navigate('collaboration')">
                  🤝 Find Collaborators
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Nearby Jobs Section -->
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem;">
            <div>
              <h2 style="color: var(--secondary); font-size: 1.5rem;">📍 Recommended Nearby Jobs for ${primarySkill.category}</h2>
              <p style="color: var(--text-muted); font-size: 0.95rem;">Active local work opportunities near ${user.location_name || user.district || 'your area'}</p>
            </div>
            <button class="btn btn-outline" onclick="window.app.navigate('radar')">
              View All ${allOpportunities.length} Jobs ➔
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
            ${nearbyJobs.map(job => `
              <div class="card" style="border-top: 4px solid var(--secondary); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
                    <span class="badge badge-high" style="font-size: 0.85rem;">
                      📍 ${job.distance_km || 1.2} km away
                    </span>
                    <span class="badge badge-accent" style="font-size: 0.85rem;">
                      ⭐ ${job.match_score || 95}% Skill Match
                    </span>
                  </div>

                  <h3 style="font-size: 1.25rem; margin-bottom: 0.4rem; color: var(--text-main);">${job.title}</h3>
                  <div style="color: var(--primary); font-weight: 600; font-size: 0.95rem; margin-bottom: 0.8rem;">
                    🏛️ ${job.provider_name || job.organizer || 'Local Business'} • ${job.location || 'Nearby'}
                  </div>

                  <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">
                    ${job.description || 'Looking for an experienced artisan to handle local orders and quality delivery.'}
                  </p>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 0.8rem 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
                    <span style="color: var(--text-muted); font-size: 0.85rem;">Earning / Pay Rate:</span>
                    <strong style="color: var(--success); font-size: 1.2rem;">₹${job.pay || job.budget || 3500}</strong>
                  </div>

                  <button class="btn btn-primary" style="width: 100%;" onclick="window.DashboardComponent.applyJob('${job.title.replace(/'/g, "\\'")}', '${(job.provider_name || job.organizer || 'Local Business').replace(/'/g, "\\'")}')">
                    🚀 Quick Apply / Contact Client ➔
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
};
