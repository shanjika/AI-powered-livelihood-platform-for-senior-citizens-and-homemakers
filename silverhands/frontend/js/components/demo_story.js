/**
 * SilverHands Guided Hackathon Demo Story Component
 * Runs through the exact 15-step live scenario specified in Section 35 of the requirements.
 */

window.DemoStoryComponent = {
  currentStep: 0,
  isRunning: false,

  steps: [
    { num: 1, title: "Step 1: Select Language (Tamil)", desc: "Selected Tamil as preferred language.", action: () => window.i18n.setLanguage('ta') },
    { num: 2, title: "Step 2: Select Voice + Text Mode", desc: "Dual audio + text side-by-side mode enabled.", action: () => window.OnboardingComponent.selectMode('both') },
    { num: 3, title: "Step 3: Tamil Speech Input", desc: "User speaks in Tamil: 'எனக்கு 25 வருடமாக சமையல் தெரியும்...'", action: () => window.OnboardingComponent.sendAnswer('எனக்கு 25 வருடமாக சமையல் தெரியும். பாரம்பரியமான தமிழ்நாட்டு தின்பண்டங்கள் செய்வதில் எனக்கு அனுபவம் உள்ளது. வீட்டிலிருந்து வேலை செய்ய விரும்புகிறேன்.') },
    { num: 4, title: "Step 4: AI Skill Extraction", desc: "AI identifies Cooking, Traditional Sweets, 25 Years Experience.", action: () => window.app.navigate('confirm_skills') },
    { num: 5, title: "Step 5: Skill Confirmation", desc: "User confirms Cooking, Teaching, and Events skills.", action: () => window.SkillCardsComponent.saveAndGoToDashboard() },
    { num: 6, title: "Step 6: Dashboard Generated", desc: "Personal Skill Dashboard created with category imagery.", action: () => window.app.navigate('dashboard') },
    { num: 7, title: "Step 7: Cooking Skill Details", desc: "Showing 25 yrs experience, Can Teach ✓, Can Collaborate ✓.", action: () => {} },
    { num: 8, title: "Step 8: AI Opportunities Recommendation", desc: "AI finds 3 nearby opportunities matching skills.", action: () => window.app.navigate('radar') },
    { num: 9, title: "Step 9: 94% Match Event", desc: "Traditional Food Event - 500 Snack Boxes (94% Match, ₹5,000 earning).", action: () => {} },
    { num: 10, title: "Step 10: AI Multi-Member Collaboration", desc: "AI detects large order and splits among 5 skilled SilverHands members.", action: () => window.CollaborationComponent.openAICollaborationModal('opp-fest-500') },
    { num: 11, title: "Step 11: Collaboration Team Confirmed", desc: "Lakshmi, Meenakshi, Saraswati, Kamala, Radha team created.", action: () => window.app.navigate('collaboration') },
    { num: 12, title: "Step 12: Traditional Tamil Class Creation", desc: "AI generates class title, 4-session schedule, and fee.", action: () => window.app.navigate('classes') },
    { num: 13, title: "Step 13: Video Upload & AI Subtitles", desc: "User uploads cooking video; AI auto-generates Tamil & English subtitles.", action: () => window.app.navigate('videos') },
    { num: 14, title: "Step 14: Creator Monetization Performance", desc: "Analytics showing views, watch time, and estimated revenue.", action: () => window.app.navigate('earnings') },
    { num: 15, title: "Step 15: Final Showcase", desc: "'Your experience has value.' SilverHands Ecosystem.", action: () => window.DemoStoryComponent.showFinalScreen() }
  ],

  startGuidedDemo() {
    this.currentStep = 0;
    this.isRunning = true;
    this.nextStep();
  },

  nextStep() {
    if (this.currentStep >= this.steps.length) return;
    const s = this.steps[this.currentStep];
    s.action();
    this.currentStep++;
    window.app.render();
  },

  showFinalScreen() {
    alert("🎉 SILVERHANDS HACKATHON DEMO COMPLETE!\n\n'Your experience has value.'\nSilverHands: Discover your skills. Connect. Collaborate. Earn.");
  }
};
