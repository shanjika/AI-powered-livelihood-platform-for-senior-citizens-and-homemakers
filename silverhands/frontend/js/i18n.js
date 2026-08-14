/**
 * SilverHands Multilingual Dictionary & i18n Translation Engine
 * Supports Tamil (ta), Hindi (hi), Telugu (te), Kannada (kn), Malayalam (ml), English (en).
 */

const DICTIONARY = {
  ta: {
    brand_tagline: "உங்கள் அனுபவம். உங்கள் திறமைகள். உங்கள் வாய்ப்பு.",
    login_title: "மின்னஞ்சல் மூலம் உள்நுழைக / பதிவு செய்க",
    login_sub: "SilverHands குடும்பத்தில் இணைந்து உங்கள் திறமைகளை வருமானமாக மாற்றவும்",
    email_label: "மின்னஞ்சல் முகவரி",
    password_label: "கடவுச்சொல்",
    login_btn: "உள்நுழைக",
    signup_btn: "புதிய கணக்கு பதிவு செய்க",
    signup_title: "முதல் முறை பயனருக்கான பதிவு",
    full_name: "முழு பெயர்",
    phone_label: "தொடர்பு எண்",
    district_label: "மாவட்டம் (District)",
    taluk_label: "தாலுகா (Taluk)",
    state_label: "மாநிலம் (State)",
    education_label: "கல்வித் தகுதி (விருப்பத்தேர்வு)",
    essential_details_title: "📋 அத்தியாவசிய சுயவிவர விவரங்கள்",
    select_language: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    select_mode: "நீங்கள் எவ்வாறு நம்மிடம் பேச விரும்புகிறீர்கள்?",
    speak_ai: "🎙️ AI உடன் பேசுங்கள்",
    speak_sub: "இயல்பாகப் பேசுங்கள்",
    type_ai: "📝 AI உடன் தட்டச்சு செய்யுங்கள்",
    type_sub: "உங்கள் பதில்களை எழுதுங்கள்",
    use_both: "இரண்டையும் பயன்படுத்துங்கள்",
    live_transcript: "நேரலை படியெடுத்தல் / உரை உரையாடல்",
    ai_voice_interview: "🎙️ AI குரல் நேர்காணல்",
    confirm_skills_title: "உங்கள் அனுபவத்திலிருந்து இந்தத் திறன்களைக் கண்டறிந்துள்ளோம்",
    confirm_skills_sub: "நீங்கள் எந்தத் திறன்களைப் பயன்படுத்த விரும்புகிறீர்கள்?",
    strength_assessment_title: "🎯 AI திறன் வலிமை ஆய்வு (Skill Strength Analysis)",
    strength_sub: "உங்கள் திறமையின் ஆழத்தை அறிய சில கேள்விகளுக்கு பதிலளியுங்கள்",
    my_skills: "எனது திறமைகள்",
    opportunities: "வாய்ப்புகள்",
    collaborations: "கூட்டுப்பணிகள்",
    my_classes: "எனது வகுப்புகள்",
    my_videos: "எனது வீடியோக்கள்",
    earnings: "வருமானம்",
    settings: "அமைப்புகள்",
    trust_profile: "நம்பகத்தன்மை சுயவிவரம்",
    hackathon_demo: "🏆 ஹேக்கத்தான் நேரடி செயல்முறை",
    start_demo: "செயல்முறை கதையைத் தொடங்கு",
    create_class: "வகுப்பை உருவாக்கு",
    share_knowledge: "🎥 உங்களுக்குத் தெரிந்ததைப் பகிருங்கள்",
    ways_to_earn: "நீங்கள் சம்பாதிப்பதற்கான வழிகள்",
    silverbuddy_prompt: "SilverBuddy இடம் ஏதேனும் கேளுங்கள்...",
    find_work: "வேலையைக் கண்டுபிடி",
    verified: "சரிபார்க்கப்பட்டது",
    apply_now: "விண்ணப்பிக்கவும்",
    view_details: "விவரங்களைப் பார்க்கவும்"
  },
  hi: {
    brand_tagline: "आपका अनुभव। आपका कौशल। आपका अवसर।",
    login_title: "ईमेल आईडी द्वारा लॉगिन या साइन अप करें",
    login_sub: "SilverHands परिवार में शामिल हों और अपने कौशल से कमाई करें",
    email_label: "ईमेल पता",
    password_label: "पासवर्ड",
    login_btn: "लॉग इन करें",
    signup_btn: "नया खाता बनाएं",
    signup_title: "नए उपयोगकर्ता का पंजीकरण",
    full_name: "पूरा नाम",
    phone_label: "संपर्क नंबर",
    district_label: "जिला (District)",
    taluk_label: "तहसील / तालुका (Taluk)",
    state_label: "राज्य (State)",
    education_label: "शिक्षा (वैकल्पिक)",
    essential_details_title: "📋 आवश्यक प्रोफ़ाइल विवरण",
    select_language: "अपनी भाषा चुनें",
    select_mode: "आप हमसे कैसे बात करना चाहेंगे?",
    speak_ai: "🎙️ AI से बोलकर बात करें",
    speak_sub: "स्वाभाविक रूप से बोलें",
    type_ai: "📝 AI से लिखकर बात करें",
    type_sub: "अपने उत्तर टाइप करें",
    use_both: "दोनों का उपयोग करें",
    live_transcript: "लाइव ट्रांसक्रिप्शन / टेक्स्ट बातचीत",
    ai_voice_interview: "🎙️ AI वॉयस इंटरव्यू",
    confirm_skills_title: "हमने आपके अनुभव में ये कौशल खोजे हैं",
    confirm_skills_sub: "आप किन कौशलों का उपयोग करना चाहते हैं?",
    strength_assessment_title: "🎯 AI कौशल क्षमता विश्लेषण (Skill Strength)",
    strength_sub: "अपने कौशल की क्षमता का विश्लेषण करने के लिए प्रश्नों के उत्तर दें",
    my_skills: "मेरे कौशल",
    opportunities: "अवसर",
    collaborations: "सहयोग",
    my_classes: "मेरी कक्षाएं",
    my_videos: "मेरे वीडियो",
    earnings: "कमाई",
    settings: "सेटिंग्स",
    trust_profile: "विश्वास प्रोफ़ाइल",
    hackathon_demo: "🏆 हैकाथॉन लाइव डेमो",
    start_demo: "डेमो स्टोरी शुरू करें",
    create_class: "कक्षा बनाएं",
    share_knowledge: "🎥 अपना ज्ञान साझा करें",
    ways_to_earn: "कमाई के रास्ते",
    silverbuddy_prompt: "SilverBuddy से कुछ भी पूछें...",
    find_work: "काम खोजें",
    verified: "सत्यापित",
    apply_now: "आवेदन करें",
    view_details: "विवरण देखें"
  },
  en: {
    brand_tagline: "Your Experience. Your Skills. Your Opportunity.",
    login_title: "Login or Sign Up with Email ID",
    login_sub: "Join the SilverHands ecosystem and convert your knowledge into opportunities",
    email_label: "Email Address",
    password_label: "Password",
    login_btn: "Log In",
    signup_btn: "Create First Time Account",
    signup_title: "First Time Registration",
    full_name: "Full Name",
    phone_label: "Contact Phone Number",
    district_label: "District",
    taluk_label: "Taluk / Block",
    state_label: "State",
    education_label: "Education (Optional)",
    essential_details_title: "📋 Essential Profile Details",
    select_language: "Which language would you like to use?",
    select_mode: "How would you like to tell us about yourself?",
    speak_ai: "🎙️ SPEAK WITH AI",
    speak_sub: "Talk naturally in your voice",
    type_ai: "📝 TYPE WITH AI",
    type_sub: "Type your answers comfortably",
    use_both: "Use both Audio + Text",
    live_transcript: "Live Transcription & Text Conversation",
    ai_voice_interview: "🎙️ AI Voice Interview",
    confirm_skills_title: "We discovered these skills in your experience.",
    confirm_skills_sub: "Which skills are you comfortable using to earn income?",
    strength_assessment_title: "🎯 AI Skill Strength Assessment",
    strength_sub: "Answer targeted questions to analyze and showcase your skill strength",
    my_skills: "My Skills",
    opportunities: "Opportunities",
    collaborations: "Collaborations",
    my_classes: "My Classes",
    my_videos: "My Videos",
    earnings: "Earnings",
    settings: "Settings",
    trust_profile: "Trust Profile",
    hackathon_demo: "🏆 Hackathon Live Story Demo",
    start_demo: "Launch Guided Demo Story",
    create_class: "Create a Class",
    share_knowledge: "🎥 Share What You Know",
    ways_to_earn: "Ways You Can Earn",
    silverbuddy_prompt: "Ask SilverBuddy anything...",
    find_work: "Find Work Near Me",
    verified: "Verified",
    apply_now: "Apply Now",
    view_details: "View Details"
  }
};

class I18nEngine {
  constructor() {
    this.currentLang = localStorage.getItem("silverhands_lang") || "ta";
  }

  setLanguage(lang) {
    if (DICTIONARY[lang]) {
      this.currentLang = lang;
      localStorage.setItem("silverhands_lang", lang);
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));
    }
  }

  t(key) {
    const dict = DICTIONARY[this.currentLang] || DICTIONARY.ta;
    return dict[key] || DICTIONARY.en[key] || key;
  }
}

window.i18n = new I18nEngine();
