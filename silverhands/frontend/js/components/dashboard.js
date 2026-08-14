/**
 * SilverHands Personal Skill Dashboard Component
 * Displays curated visual skill cards with high-resolution domain imagery,
 * experience details, teach/collaborate badges, and skill action triggers.
 */

window.DashboardComponent = {
  render() {
    const user = window.app.userProfile;
    const skills = user.skills || [];

    const categoryImages = {
      Cooking: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
      Tailoring: "https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80",
      Teaching: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80",
      Gardening: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80",
      Handicrafts: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
      Services: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"
    };

    return `
      <div class="animate-fade-in">
        <!-- User Greeting & Trust Snapshot -->
        <div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95));">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1.2rem;">
              <img src="${user.avatar_url}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary);">
              <div>
                <h2>Good Morning, ${user.name} 👋</h2>
                <p style="color: var(--text-muted); font-size: 1.1rem;">${user.role} • ${user.location_name}</p>
                <div style="display: flex; gap: 0.8rem; margin-top: 0.4rem;">
                  <span class="badge badge-high">✓ Identity Verified</span>
                  <span class="badge badge-accent">⭐ ${user.rating} (${user.reviews_count} reviews)</span>
                  <span class="badge badge-medium">🏆 Trust Score ${user.trust_score}%</span>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 1rem;">
              <button class="btn btn-primary" onclick="window.app.navigate('radar')">
                🔎 Find Local Opportunities
              </button>
              <button class="btn btn-secondary" onclick="window.app.navigate('collaboration')">
                🤝 View Collaborations
              </button>
            </div>
          </div>
        </div>

        <!-- Section Title: My Skills -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          <h2>⭐ ${window.i18n.t("my_skills")}</h2>
          <button class="btn btn-outline" onclick="window.app.navigate('onboarding')">
            ➕ Discover More Skills
          </button>
        </div>

        <!-- Grid of Skill Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.8rem;">
          ${skills.map(s => {
            const img = categoryImages[s.category] || categoryImages.Cooking;
            return `
              <div class="card">
                <img src="${img}" class="skill-card-img" alt="${s.name}">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h3>${window.SkillCardsComponent.getCategoryIcon(s.category)} ${s.name}</h3>
                  <span class="badge badge-high">${s.experience_years} Years Exp</span>
                </div>

                <div style="display: flex; gap: 0.6rem; margin: 0.8rem 0;">
                  ${s.can_teach ? '<span class="badge badge-accent">Can Teach ✓</span>' : ''}
                  ${s.can_collaborate ? '<span class="badge badge-medium">Can Collaborate ✓</span>' : ''}
                </div>

                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1rem;">
                  <strong>Specializations:</strong> ${(s.specializations || ["Traditional South Indian Recipes"]).join(', ')}
                </p>

                <!-- Skill Action Buttons -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-top: 1rem;">
                  <button class="btn btn-primary" style="padding: 0.5rem; font-size: 0.9rem;" onclick="window.app.navigate('radar')">
                    🔎 Opportunities
                  </button>
                  <button class="btn btn-secondary" style="padding: 0.5rem; font-size: 0.9rem;" onclick="window.app.navigate('collaboration')">
                    🤝 Collaborators
                  </button>
                  <button class="btn btn-outline" style="padding: 0.5rem; font-size: 0.9rem;" onclick="window.ClassesComponent.openClassModal('${s.name}')">
                    🎓 Create Class
                  </button>
                  <button class="btn btn-outline" style="padding: 0.5rem; font-size: 0.9rem;" onclick="window.ContentComponent.openUploadModal('${s.name}')">
                    🎥 Share Video
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
};
