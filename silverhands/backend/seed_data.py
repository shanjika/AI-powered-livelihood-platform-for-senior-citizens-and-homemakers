"""
SilverHands Demo Seed Data
Rich realistic profiles of Indian senior citizens and homemakers,
opportunities, community collaborations, video tutorials, classes, and earnings history.
"""

INITIAL_USERS = [
    {
        "id": "u-lakshmi-64",
        "name": "Lakshmi Ammal",
        "age": 64,
        "gender": "Female",
        "role": "Homemaker & Expert Cook",
        "phone": "+91 98401 23456",
        "email": "lakshmi.ammal@silverhands.in",
        "language": "ta",
        "location_name": "Mylapore, Chennai",
        "latitude": 13.0339,
        "longitude": 80.2696,
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
        "trust_score": 98,
        "identity_verified": True,
        "rating": 4.9,
        "reviews_count": 23,
        "completed_jobs": 19,
        "bio": "25+ years of experience preparing traditional South Indian festival snacks, sweets, and home-cooked meals.",
        "skills": [
            {
                "id": "s-cook-1",
                "name": "Traditional Cooking",
                "category": "Cooking",
                "confidence": "High",
                "experience_years": 25,
                "proficiency": "Expert",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Home / Local",
                "specializations": ["South Indian Sweets", "Festival Snacks", "Millet Recipes", "Traditional Pickles"],
                "reasoning": "Inferred from 25 years of family cooking and neighborhood catering requests.",
                "earning_paths": ["Homemade snack orders", "Festival catering", "Cooking workshops", "Recipe videos"]
            },
            {
                "id": "s-teach-1",
                "name": "Culinary Teaching",
                "category": "Teaching",
                "confidence": "High",
                "experience_years": 10,
                "proficiency": "Advanced",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Online / Workshops",
                "specializations": ["Traditional Recipes", "Healthy Millets Cooking"],
                "reasoning": "Demonstrated willingness to conduct weekend culinary workshops.",
                "earning_paths": ["Paid workshops", "Private culinary tutoring", "Online video courses"]
            }
        ]
    },
    {
        "id": "u-meenakshi-61",
        "name": "Meenakshi Sundaram",
        "age": 61,
        "gender": "Female",
        "role": "Master Tailor & Embroidery Specialist",
        "phone": "+91 98402 34567",
        "email": "meenakshi.s@silverhands.in",
        "language": "ta",
        "location_name": "T. Nagar, Chennai",
        "latitude": 13.0418,
        "longitude": 80.2341,
        "avatar_url": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80",
        "trust_score": 96,
        "identity_verified": True,
        "rating": 4.8,
        "reviews_count": 18,
        "completed_jobs": 15,
        "bio": "30 years of experience in hand embroidery, sari blousing, eco-friendly cloth bag stitching, and alterations.",
        "skills": [
            {
                "id": "s-tailor-1",
                "name": "Tailoring & Garment Alterations",
                "category": "Tailoring",
                "confidence": "High",
                "experience_years": 30,
                "proficiency": "Expert",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Home-based",
                "specializations": ["Sari Blouses", "Embroidery", "Cloth Bag Stitching", "Custom Fitting"],
                "reasoning": "30 years tailoring experience for local community boutiques.",
                "earning_paths": ["Bulk cloth bag orders", "Custom blouse stitching", "Tailoring classes"]
            }
        ]
    },
    {
        "id": "u-saraswati-67",
        "name": "Saraswati Ramachandran",
        "age": 67,
        "gender": "Female",
        "role": "Retired School Principal & Mathematics Tutor",
        "phone": "+91 98403 45678",
        "email": "saraswati.r@silverhands.in",
        "language": "ta",
        "location_name": "Adyar, Chennai",
        "latitude": 13.0012,
        "longitude": 80.2565,
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
        "trust_score": 99,
        "identity_verified": True,
        "rating": 5.0,
        "reviews_count": 42,
        "completed_jobs": 38,
        "bio": "Retired school principal with 20+ years of teaching mathematics, Vedic math tricks, and storytelling to children.",
        "skills": [
            {
                "id": "s-math-1",
                "name": "Mathematics & Vedic Math Tutoring",
                "category": "Teaching",
                "confidence": "High",
                "experience_years": 20,
                "proficiency": "Expert",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Home / Online",
                "specializations": ["Class 1-10 Maths", "Vedic Math Tricks", "Moral Storytelling"],
                "reasoning": "Former school teacher with proven educational leadership.",
                "earning_paths": ["Tuition batches", "Vedic Math summer camps", "Mentoring junior teachers"]
            }
        ]
    },
    {
        "id": "u-kamala-59",
        "name": "Kamala Natarajan",
        "age": 59,
        "gender": "Female",
        "role": "Handicrafts & Eco Artisan",
        "phone": "+91 98404 56789",
        "email": "kamala.n@silverhands.in",
        "language": "ta",
        "location_name": "Velachery, Chennai",
        "latitude": 12.9750,
        "longitude": 80.2210,
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        "trust_score": 94,
        "identity_verified": True,
        "rating": 4.7,
        "reviews_count": 14,
        "completed_jobs": 12,
        "bio": "Specialist in handmade terracotta crafts, jute bags, traditional kolam art, and eco-friendly return gifts.",
        "skills": [
            {
                "id": "s-craft-1",
                "name": "Handicrafts & Eco-Art",
                "category": "Handicrafts",
                "confidence": "High",
                "experience_years": 18,
                "proficiency": "Advanced",
                "can_teach": True,
                "can_collaborate": True,
                "preferred_work": "Local / Events",
                "specializations": ["Terracotta Decor", "Jute Products", "Return Gifts"],
                "reasoning": "Creates traditional handcrafted decor for wedding events.",
                "earning_paths": ["Event return gift orders", "Craft workshops", "Handicraft stalls"]
            }
        ]
    },
    {
        "id": "u-radha-62",
        "name": "Radha Venkataraman",
        "age": 62,
        "gender": "Female",
        "role": "Logistics & Community Event Coordinator",
        "phone": "+91 98405 67890",
        "email": "radha.v@silverhands.in",
        "language": "ta",
        "location_name": "Mandaveli, Chennai",
        "latitude": 13.0280,
        "longitude": 80.2610,
        "avatar_url": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80",
        "trust_score": 95,
        "identity_verified": True,
        "rating": 4.85,
        "reviews_count": 16,
        "completed_jobs": 14,
        "bio": "Community organizer skilled in neighborhood delivery routing, packaging logistics, and festival stalls setup.",
        "skills": [
            {
                "id": "s-event-1",
                "name": "Event Logistics & Packaging",
                "category": "Services",
                "confidence": "High",
                "experience_years": 15,
                "proficiency": "Advanced",
                "can_teach": False,
                "can_collaborate": True,
                "preferred_work": "Local",
                "specializations": ["Food Packaging", "Local Delivery Coordination", "Stall Setup"],
                "reasoning": "Organizes temple festival food distribution and local deliveries.",
                "earning_paths": ["Event packaging management", "Doorstep delivery dispatch", "Stall coordination"]
            }
        ]
    }
]

INITIAL_OPPORTUNITIES = [
    {
        "id": "opp-fest-500",
        "title": "Traditional Food Event - 500 Snack Boxes",
        "category": "Cooking",
        "location_name": "Mylapore Cultural Center, Chennai",
        "latitude": 13.0320,
        "longitude": 80.2710,
        "distance_km": 3.2,
        "date": "This Sunday",
        "time": "8:00 AM - 2:00 PM",
        "expected_earning": 25000,
        "individual_earning": 5000,
        "work_type": "Local Event / Team Collaboration",
        "match_score": 94,
        "required_skills": ["Cooking", "Traditional Snacks", "Packaging"],
        "description": "Large cultural celebration requiring 500 boxes of traditional South Indian millet snacks (Murukku, Thattai, Seedai). Requires a collaborative team of 5 skilled women.",
        "collaborative_project": True,
        "target_team_size": 5
    },
    {
        "id": "opp-tailor-100",
        "title": "Eco-Friendly Jute Bag Stitching Order",
        "category": "Tailoring",
        "location_name": "T. Nagar Market, Chennai",
        "latitude": 13.0430,
        "longitude": 80.2310,
        "distance_km": 2.8,
        "date": "Next Tuesday",
        "time": "Flexible Home Hours",
        "expected_earning": 8000,
        "individual_earning": 4000,
        "work_type": "Work From Home",
        "match_score": 89,
        "required_skills": ["Tailoring", "Stitching", "Embroidery"],
        "description": "Retail shop order for 200 cloth gift bags for an upcoming festival season. Materials delivered to your home.",
        "collaborative_project": True,
        "target_team_size": 2
    },
    {
        "id": "opp-vedic-class",
        "title": "Weekend Vedic Math & Memory Workshop Tutor",
        "category": "Teaching",
        "location_name": "Adyar Library Hall & Online Zoom",
        "latitude": 13.0040,
        "longitude": 80.2580,
        "distance_km": 1.5,
        "date": "Saturdays & Sundays",
        "time": "10:00 AM - 11:30 AM",
        "expected_earning": 6000,
        "individual_earning": 6000,
        "work_type": "Hybrid / Teaching",
        "match_score": 96,
        "required_skills": ["Teaching", "Mathematics", "Vedic Math"],
        "description": "Conduct 4 online/offline weekend sessions teaching Vedic Math shortcuts to school children aged 8-14.",
        "collaborative_project": False,
        "target_team_size": 1
    },
    {
        "id": "opp-terracotta-craft",
        "title": "Wedding Favor Terracotta Diyas Order",
        "category": "Handicrafts",
        "location_name": "Velachery Community Center, Chennai",
        "latitude": 12.9780,
        "longitude": 80.2240,
        "distance_km": 4.1,
        "date": "Next Month",
        "time": "Flexible",
        "expected_earning": 12000,
        "individual_earning": 6000,
        "work_type": "Work From Home",
        "match_score": 87,
        "required_skills": ["Handicrafts", "Terracotta Art", "Painting"],
        "description": "Hand-paint 150 decorative wedding souvenir terracotta lamps.",
        "collaborative_project": True,
        "target_team_size": 2
    }
]

INITIAL_COLLABORATIONS = [
    {
        "id": "collab-snack-team",
        "project_name": "Traditional Food Festival Team",
        "opportunity_id": "opp-fest-500",
        "total_value": 30000,
        "my_share": 5000,
        "status": "Confirmed",
        "target_capacity": 500,
        "unit_type": "Boxes",
        "members": [
            {"user_id": "u-lakshmi-64", "name": "Lakshmi Ammal", "role": "Cooking (Millet Sweets)", "capacity": 100, "share": 5000, "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"},
            {"user_id": "u-meenakshi-61", "name": "Meenakshi Sundaram", "role": "Packaging & Sealing", "capacity": 100, "share": 5000, "avatar": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80"},
            {"user_id": "u-saraswati-67", "name": "Saraswati Ramachandran", "role": "Quality Control & Labeling", "capacity": 100, "share": 5000, "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"},
            {"user_id": "u-kamala-59", "name": "Kamala Natarajan", "role": "Cooking (Savory Snacks)", "capacity": 100, "share": 5000, "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"},
            {"user_id": "u-radha-62", "name": "Radha Venkataraman", "role": "Event Setup & Delivery", "capacity": 100, "share": 5000, "avatar": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80"}
        ]
    }
]

INITIAL_CLASSES = [
    {
        "id": "cls-1",
        "title": "Traditional South Indian Millet Snacks",
        "instructor": "Lakshmi Ammal",
        "category": "Cooking",
        "fee": 800,
        "duration": "4 Sessions (Saturdays)",
        "schedule": "10:00 AM - 11:30 AM",
        "mode": "Hybrid (Online + Live Workshop)",
        "enrolled_count": 8,
        "max_students": 12,
        "description": "Learn to make crispy, healthy millet murukku, seedai, and laddu using authentic grandmother recipes.",
        "curriculum": [
            "Session 1: Selection & Roasting of Fresh Millets",
            "Session 2: Traditional Dough Preparation & Spicing Secrets",
            "Session 3: Frying Techniques for Zero-Oil Absorbency",
            "Session 4: Preservation, Packaging & Small Business Tips"
        ]
    },
    {
        "id": "cls-2",
        "title": "Vedic Math Shortcuts for Fast Calculation",
        "instructor": "Saraswati Ramachandran",
        "category": "Teaching",
        "fee": 1200,
        "duration": "6 Sessions (Weekends)",
        "schedule": "4:00 PM - 5:00 PM",
        "mode": "Online Zoom",
        "enrolled_count": 15,
        "max_students": 20,
        "description": "Master mental multiplication, square roots, and rapid mental math using ancient Vedic methods.",
        "curriculum": [
            "Session 1: Sutras of Rapid Addition & Subtraction",
            "Session 2: 2-Digit Multiplication in 3 Seconds",
            "Session 3: Squaring Numbers ending in 5 & 0",
            "Session 4: Magic Division Techniques",
            "Session 5: Fraction & Percentage Shortcuts",
            "Session 6: Exam Application & Practice Tournament"
        ]
    },
    {
        "id": "cls-3",
        "title": "Traditional Handcrafts & Terracotta Pottery Art",
        "instructor": "Kamala Natarajan",
        "category": "Handicrafts",
        "fee": 950,
        "duration": "4 Sessions (Sundays)",
        "schedule": "2:00 PM - 4:00 PM",
        "mode": "Hands-on Studio Workshop",
        "enrolled_count": 6,
        "max_students": 10,
        "description": "Create handcrafted terracotta clay items, jute festival decor, and eco-friendly artisan return gifts.",
        "curriculum": [
            "Session 1: Eco-Clay Preparation & Handcraft Molding",
            "Session 2: Terracotta Painting & Traditional Motifs",
            "Session 3: Jute Weaving & Eco-Product Crafting",
            "Session 4: Selling Handcrafts Online & Community Stalls"
        ]
    },
    {
        "id": "cls-4",
        "title": "Masterclass in Blouse Stitching & Embroidery",
        "instructor": "Meenakshi Sundaram",
        "category": "Tailoring",
        "fee": 1100,
        "duration": "5 Sessions (Tuesdays)",
        "schedule": "11:00 AM - 1:00 PM",
        "mode": "Hybrid Workshop",
        "enrolled_count": 9,
        "max_students": 15,
        "description": "Step-by-step masterclass on custom blouse cutting, hand embroidery techniques, and cloth bag stitching.",
        "curriculum": [
            "Session 1: Body Measurement & Pattern Cutting",
            "Session 2: Zardosi & Thread Embroidery Basics",
            "Session 3: Machine Stitching & Fitting Adjustments",
            "Session 4: Reusable Cloth Bag Mass Production",
            "Session 5: Pricing Tailoring Services & Client Orders"
        ]
    }
]

INITIAL_VIDEOS = [
    {
        "id": "vid-1",
        "title": "Traditional Millet Snack Preparation",
        "author": "Lakshmi Ammal",
        "category": "Traditional Cooking",
        "language": "ta",
        "views": 12450,
        "watch_time_hours": 1280,
        "followers": 850,
        "estimated_earning": 1950,
        "thumbnail": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
        "tags": ["Millet", "Cooking", "Traditional Food", "Tamil Cuisine", "Festival Sweets"],
        "subtitles_ta": "இன்று நாம் பாரம்பரிய தினை முறுக்கு எவ்வாறு செய்வது என்று பார்ப்போம்...",
        "subtitles_en": "Today we will learn how to make traditional crispy millet snacks..."
    },
    {
        "id": "vid-2",
        "title": "Perfect Sari Blouse Neck Embroidery Tutorial",
        "author": "Meenakshi Sundaram",
        "category": "Tailoring & Craft",
        "language": "ta",
        "views": 8920,
        "watch_time_hours": 940,
        "followers": 620,
        "estimated_earning": 1420,
        "thumbnail": "https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80",
        "tags": ["Embroidery", "Tailoring", "Sari Blouse", "Stitching", "Handcraft"],
        "subtitles_ta": "எளிய முறையில் ஜரிகை தையல் போடுவது எப்படி...",
        "subtitles_en": "How to stitch elegant zari embroidery easily at home..."
    },
    {
        "id": "vid-3",
        "title": "Terracotta Clay Modeling & Handcraft Gift Tutorial",
        "author": "Kamala Natarajan",
        "category": "Handicrafts",
        "language": "ta",
        "views": 6540,
        "watch_time_hours": 710,
        "followers": 490,
        "estimated_earning": 1150,
        "thumbnail": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
        "tags": ["Handicrafts", "Handcraft", "Terracotta", "Clay", "Eco Art"],
        "subtitles_ta": "மண்பாண்ட கைவினை பொருட்கள் செய்யும் வழிமுறைகள்...",
        "subtitles_en": "Step-by-step techniques to create handcrafted terracotta return gifts..."
    },
    {
        "id": "vid-4",
        "title": "Vedic Math Mental Tricks for Fast Calculation",
        "author": "Saraswati Ramachandran",
        "category": "Teaching",
        "language": "ta",
        "views": 14200,
        "watch_time_hours": 1560,
        "followers": 980,
        "estimated_earning": 2200,
        "thumbnail": "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80",
        "tags": ["Vedic Math", "Mathematics", "Tutoring", "Mental Math", "Teaching"],
        "subtitles_ta": "வேத கணித சூத்திரங்களை எளிதாக பயன்படுத்தும் வழிகள்...",
        "subtitles_en": "Learn fast mental math calculations using ancient Vedic math sutras..."
    }
]

INITIAL_EARNINGS = {
    "current_month": 8450,
    "pending": 1200,
    "completed": 7250,
    "breakdown": [
        {"source": "Classes", "amount": 3000, "percentage": 35.5, "icon": "🎓"},
        {"source": "Services", "amount": 2500, "percentage": 29.5, "icon": "🛠️"},
        {"source": "Events", "amount": 2000, "percentage": 23.6, "icon": "🎉"},
        {"source": "Content", "amount": 950, "percentage": 11.2, "icon": "🎥"},
        {"source": "Collaboration", "amount": 1000, "percentage": 11.8, "icon": "🤝"}
    ],
    "history": [
        {"month": "May", "amount": 5400},
        {"month": "Jun", "amount": 6800},
        {"month": "Jul", "amount": 7600},
        {"month": "Aug (Current)", "amount": 8450}
    ]
}
