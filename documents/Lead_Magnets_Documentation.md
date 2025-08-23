# 🎯 Lead Magnets Documentation

## Overview
The Lead Magnets module provides coaches with powerful tools to attract, engage, and convert prospects through valuable content and interactive tools. This system helps coaches build their email lists, establish authority, and nurture leads through various magnet types including AI-powered content generation.

## Table of Contents
1. [Core Features](#core-features)
2. [API Endpoints](#api-endpoints)
3. [Lead Magnet Types](#lead-magnet-types)
4. [Setup & Configuration](#setup--configuration)
5. [Use Cases](#use-cases)
6. [Best Practices](#best-practices)

---

## Core Features

### 1. AI-Powered Content Generation
- **Diet Plans**: Personalized nutrition strategies
- **BMI Calculator**: Health assessment tools
- **E-book Generator**: Custom content creation
- **Workout Calculator**: Fitness metrics and planning
- **Progress Tracker**: Goal monitoring and analytics

### 2. Interactive Tools
- **Sleep Analyzer**: Sleep quality assessment
- **Stress Assessment**: Mental health evaluation
- **Progress Tracking**: Goal achievement monitoring
- **Custom Calculators**: Specialized fitness metrics

### 3. Lead Capture & Nurturing
- **Form Integration**: Seamless lead collection
- **WhatsApp Integration**: Direct messaging capabilities
- **Email Automation**: Follow-up sequence management
- **Analytics Tracking**: Performance measurement

---

## API Endpoints

### 1. Get Coach Lead Magnet Settings
**Endpoint:** `GET /api/lead-magnets/coach`  
**Description:** Retrieve current lead magnet configuration for a coach  
**Authentication:** Required  
**Use Case:** View current settings, check configuration status

**Response:**
```json
{
  "coachId": "coach_123",
  "settings": {
    "enabled": true,
    "defaultMagnet": "ai_diet_plan",
    "captureMethod": "form",
    "followUpSequence": "7_day_nurture",
    "whatsappIntegration": true,
    "emailIntegration": true
  },
  "magnets": [
    {
      "id": "magnet_001",
      "type": "ai_diet_plan",
      "name": "AI Diet Plan Generator",
      "status": "active",
      "conversionRate": 23.5,
      "totalLeads": 156
    }
  ],
  "analytics": {
    "totalLeads": 156,
    "conversionRate": 23.5,
    "averageEngagement": 4.2,
    "topPerformingMagnet": "ai_diet_plan"
  }
}
```

### 2. Update Coach Lead Magnet Settings
**Endpoint:** `PUT /api/lead-magnets/coach`  
**Description:** Update lead magnet configuration and preferences  
**Authentication:** Required  
**Use Case:** Configure new magnets, adjust settings, enable features

**Request Body:**
```json
{
  "defaultMagnet": "bmi_calculator",
  "captureMethod": "whatsapp",
  "followUpSequence": "14_day_nurture",
  "whatsappIntegration": true,
  "emailIntegration": true,
  "customBranding": {
    "logo": "https://example.com/logo.png",
    "colors": ["#4F46E5", "#10B981"],
    "brandName": "FitLife Coaching"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Lead magnet settings updated successfully",
  "updatedSettings": {
    "defaultMagnet": "bmi_calculator",
    "captureMethod": "whatsapp",
    "followUpSequence": "14_day_nurture"
  },
  "nextSteps": [
    "Configure WhatsApp bot responses",
    "Set up follow-up email sequence",
    "Test lead magnet flow"
  ]
}
```

### 3. Generate AI Diet Plan
**Endpoint:** `POST /api/lead-magnets/ai-diet-plan`  
**Description:** Create personalized diet plans via WhatsApp  
**Authentication:** Required  
**Use Case:** Generate customized nutrition strategies, attract health-conscious leads

**Request Body:**
```json
{
  "coachId": "coach_123",
  "leadInfo": {
    "name": "John Doe",
    "age": 32,
    "weight": 180,
    "height": 72,
    "activityLevel": "moderate",
    "goals": ["weight_loss", "muscle_gain"],
    "dietaryRestrictions": ["vegetarian"],
    "preferences": ["high_protein", "low_carb"]
  },
  "planType": "weight_loss",
  "duration": "12_weeks",
  "includeRecipes": true,
  "includeShoppingList": true
}
```

**Response:**
```json
{
  "dietPlan": {
    "planId": "diet_plan_456",
    "name": "12-Week Vegetarian Weight Loss Plan",
    "duration": "12 weeks",
    "targetWeightLoss": "24 pounds",
    "weeklyCalorieTarget": 1800,
    "macronutrientRatio": {
      "protein": "30%",
      "carbs": "40%",
      "fat": "30%"
    },
    "weeklyMealPlan": [
      {
        "day": "Monday",
        "meals": [
          {
            "meal": "Breakfast",
            "foods": ["Greek yogurt", "Berries", "Nuts"],
            "calories": 350,
            "protein": "25g"
          }
        ]
      }
    ],
    "shoppingList": [
      "Greek yogurt (32 oz)",
      "Mixed berries (2 lbs)",
      "Almonds (1 lb)"
    ],
    "tips": [
      "Drink 8 glasses of water daily",
      "Eat slowly and mindfully",
      "Plan meals in advance"
    ]
  },
  "leadCapture": {
    "whatsappMessage": "Hi John! Here's your personalized 12-week vegetarian weight loss plan. Would you like me to send you the complete meal plan and shopping list?",
    "followUpSequence": "diet_plan_nurture",
    "nextAction": "send_complete_plan"
  }
}
```

### 4. BMI Calculator
**Endpoint:** `POST /api/lead-magnets/bmi-calculator`  
**Description:** Calculate BMI and provide health recommendations  
**Authentication:** Required  
**Use Case:** Health assessment, lead qualification, personalized advice

**Request Body:**
```json
{
  "coachId": "coach_123",
  "userData": {
    "age": 28,
    "gender": "female",
    "weight": 140,
    "height": 65,
    "activityLevel": "sedentary",
    "goals": ["maintain_weight", "improve_fitness"]
  }
}
```

**Response:**
```json
{
  "bmiResult": {
    "bmi": 23.3,
    "category": "Normal Weight",
    "healthRisk": "Low",
    "idealWeightRange": "118-155 lbs"
  },
  "recommendations": {
    "nutrition": [
      "Maintain current calorie intake",
      "Focus on nutrient-dense foods",
      "Include more vegetables and fruits"
    ],
    "fitness": [
      "Start with 150 minutes of moderate exercise weekly",
      "Include strength training 2-3 times per week",
      "Gradually increase activity level"
    ],
    "lifestyle": [
      "Get 7-9 hours of sleep",
      "Manage stress through meditation",
      "Stay hydrated throughout the day"
    ]
  },
  "nextSteps": [
    "Schedule fitness assessment",
    "Create personalized workout plan",
    "Set up nutrition consultation"
  ]
}
```

### 5. E-book Generator
**Endpoint:** `POST /api/lead-magnets/ebook-generator`  
**Description:** Generate personalized e-book content  
**Authentication:** Required  
**Use Case:** Content marketing, lead generation, authority building

**Request Body:**
```json
{
  "coachId": "coach_123",
  "topic": "weight_loss",
  "targetAudience": "beginners",
  "length": "medium", // short, medium, long
  "includeChapters": true,
  "personalization": {
    "leadName": "Sarah",
    "specificGoals": ["lose 20 pounds", "build confidence"],
    "challenges": ["time management", "motivation"]
  }
}
```

**Response:**
```json
{
  "ebook": {
    "title": "Sarah's Complete Guide to Losing 20 Pounds and Building Confidence",
    "chapters": [
      {
        "title": "Understanding Your Weight Loss Journey",
        "content": "Personalized content for Sarah...",
        "keyPoints": ["Goal setting", "Mindset shift", "Realistic expectations"]
      },
      {
        "title": "Time Management for Busy Professionals",
        "content": "Customized time management strategies...",
        "keyPoints": ["Meal prep", "Quick workouts", "Habit building"]
      }
    ],
    "summary": "Personalized weight loss guide for Sarah",
    "callToAction": "Ready to start your transformation? Book a free consultation!",
    "leadCapture": {
      "form": "ebook_download",
      "followUp": "ebook_nurture_sequence"
    }
  }
}
```

### 6. Workout Calculator
**Endpoint:** `POST /api/lead-magnets/workout-calculator`  
**Description:** Calculate workout metrics and create training plans  
**Authentication:** Required  
**Use Case:** Fitness assessment, personalized training, lead qualification

**Request Body:**
```json
{
  "coachId": "coach_123",
  "userData": {
    "age": 35,
    "gender": "male",
    "weight": 200,
    "height": 70,
    "fitnessLevel": "intermediate",
    "goals": ["strength_gain", "muscle_mass"],
    "availableEquipment": ["dumbbells", "resistance_bands"],
    "timeAvailable": "45_minutes"
  }
}
```

**Response:**
```json
{
  "calculations": {
    "oneRepMax": {
      "benchPress": 225,
      "squat": 315,
      "deadlift": 405
    },
    "heartRateZones": {
      "resting": 65,
      "fatBurning": "120-140",
      "cardio": "140-160",
      "peak": "160-180"
    },
    "calorieBurn": {
      "strengthTraining": "350-450",
      "cardio": "400-600",
      "hiit": "500-700"
    }
  },
  "workoutPlan": {
    "frequency": "4 days per week",
    "duration": "45 minutes",
    "split": "Push/Pull/Legs/Upper",
    "exercises": [
      {
        "day": "Push Day",
        "exercises": [
          {
            "name": "Bench Press",
            "sets": 4,
            "reps": "6-8",
            "weight": "80% of 1RM",
            "rest": "3 minutes"
          }
        ]
      }
    ]
  },
  "progression": {
    "weeklyIncrease": "5-10 lbs",
    "deloadWeek": "Every 4th week",
    "milestones": ["225 bench", "315 squat", "405 deadlift"]
  }
}
```

### 7. Progress Tracker
**Endpoint:** `POST /api/lead-magnets/progress-tracker`  
**Description:** Track fitness progress and provide analytics  
**Authentication:** Required  
**Use Case:** Progress monitoring, motivation, goal achievement

**Request Body:**
```json
{
  "coachId": "coach_123",
  "userData": {
    "startDate": "2024-01-01",
    "currentDate": "2024-01-20",
    "goals": ["lose 15 pounds", "run 5k"],
    "measurements": {
      "weight": [200, 195, 190, 188],
      "bodyFat": [25, 24, 23, 22],
      "waist": [36, 35.5, 35, 34.5]
    },
    "achievements": ["completed_30_days", "lost_10_pounds"]
  }
}
```

**Response:**
```json
{
  "progress": {
    "currentStreak": "20 days",
    "goalProgress": {
      "weightLoss": {
        "target": 15,
        "current": 12,
        "remaining": 3,
        "percentage": 80
      },
      "running": {
        "target": "5k",
        "current": "3k",
        "remaining": "2k",
        "percentage": 60
      }
    },
    "trends": {
      "weightLoss": "Consistent 0.5-1 lb per week",
      "fitness": "Improving endurance and strength",
      "motivation": "High - maintaining consistency"
    }
  },
  "analytics": {
    "weeklyAverages": {
      "weightLoss": "0.8 lbs",
      "workouts": "4.2 sessions",
      "caloriesBurned": "2,100"
    },
    "predictions": {
      "goalAchievement": "2 weeks ahead of schedule",
      "nextMilestone": "5k run in 3 weeks"
    }
  },
  "recommendations": [
    "Increase cardio sessions to 3x per week",
    "Add interval training for faster results",
    "Consider strength training for muscle preservation"
  ]
}
```

### 8. Sleep Analyzer
**Endpoint:** `POST /api/lead-magnets/sleep-analyzer`  
**Description:** Analyze sleep quality and provide recommendations  
**Authentication:** Required  
**Use Case:** Health assessment, sleep optimization, wellness coaching

**Request Body:**
```json
{
  "coachId": "coach_123",
  "sleepData": {
    "averageSleep": 6.5,
    "sleepQuality": 3,
    "bedtime": "11:30 PM",
    "wakeTime": "6:00 AM",
    "issues": ["waking_up_night", "difficulty_falling_asleep"],
    "lifestyle": {
      "caffeine": "2 cups daily",
      "exercise": "evening",
      "screenTime": "high",
      "stress": "moderate"
    }
  }
}
```

**Response:**
```json
{
  "analysis": {
    "sleepScore": 65,
    "quality": "Fair",
    "issues": [
      "Insufficient sleep duration",
      "Poor sleep hygiene",
      "Evening exercise timing"
    ]
  },
  "recommendations": {
    "immediate": [
      "Aim for 7-9 hours of sleep",
      "Stop caffeine after 2 PM",
      "Avoid screens 1 hour before bed"
    ],
    "lifestyle": [
      "Move exercise to morning or afternoon",
      "Establish consistent sleep schedule",
      "Create relaxing bedtime routine"
    ],
    "environment": [
      "Keep bedroom cool and dark",
      "Use white noise machine",
      "Invest in quality mattress"
    ]
  },
  "sleepHygiene": {
    "bedtimeRoutine": [
      "9:00 PM - Stop screen time",
      "9:30 PM - Light reading",
      "10:00 PM - Relaxation exercises",
      "10:30 PM - Bed"
    ],
    "tracking": "Use sleep tracking app for 2 weeks"
  }
}
```

### 9. Stress Assessment
**Endpoint:** `POST /api/lead-magnets/stress-assessment`  
**Description:** Assess stress levels and provide coping strategies  
**Authentication:** Required  
**Use Case:** Mental health awareness, stress management, wellness coaching

**Request Body:**
```json
{
  "coachId": "coach_123",
  "assessment": {
    "stressLevel": 7,
    "symptoms": ["irritability", "sleep_issues", "fatigue"],
    "triggers": ["work_deadlines", "financial_concerns"],
    "copingMechanisms": ["exercise", "meditation"],
    "lifestyle": {
      "workHours": "50+ per week",
      "exercise": "2-3 times weekly",
      "socialSupport": "moderate",
      "hobbies": "limited"
    }
  }
}
```

**Response:**
```json
{
  "assessment": {
    "stressScore": 7,
    "level": "High Stress",
    "risk": "Moderate",
    "impact": "Affecting daily life and health"
  },
  "analysis": {
    "primaryStressors": ["Work pressure", "Financial stress"],
    "symptoms": ["Sleep disruption", "Mood changes", "Physical tension"],
    "copingEffectiveness": "Partially effective"
  },
  "strategies": {
    "immediate": [
      "Deep breathing exercises (5 minutes)",
      "Progressive muscle relaxation",
      "Take 10-minute breaks every 2 hours"
    ],
    "shortTerm": [
      "Establish work boundaries",
      "Practice time management",
      "Increase exercise frequency"
    ],
    "longTerm": [
      "Financial planning consultation",
      "Career development planning",
      "Build stronger social support network"
    ]
  },
  "resources": {
    "apps": ["Calm", "Headspace", "Insight Timer"],
    "techniques": ["Mindfulness", "Journaling", "Nature walks"],
    "professional": "Consider stress management coaching"
  }
}
```

### 10. Get Available Lead Magnets
**Endpoint:** `GET /api/lead-magnets/available`  
**Description:** Retrieve all available lead magnet types and templates  
**Authentication:** Required  
**Use Case:** Magnet selection, feature discovery, system overview

**Response:**
```json
{
  "availableMagnets": [
    {
      "id": "ai_diet_plan",
      "name": "AI Diet Plan Generator",
      "description": "Personalized nutrition plans based on goals and preferences",
      "category": "Nutrition",
      "difficulty": "Easy",
      "conversionRate": "25-35%",
      "setupTime": "5 minutes",
      "features": ["AI-powered", "WhatsApp integration", "Customizable"]
    },
    {
      "id": "bmi_calculator",
      "name": "BMI Calculator & Health Assessment",
      "description": "Calculate BMI and get personalized health recommendations",
      "category": "Health",
      "difficulty": "Easy",
      "conversionRate": "20-30%",
      "setupTime": "3 minutes",
      "features": ["Instant results", "Health insights", "Goal setting"]
    }
  ],
  "categories": {
    "Nutrition": 3,
    "Fitness": 4,
    "Health": 2,
    "Wellness": 3
  },
  "recommendations": {
    "beginners": ["bmi_calculator", "sleep_analyzer"],
    "intermediate": ["ai_diet_plan", "workout_calculator"],
    "advanced": ["progress_tracker", "stress_assessment"]
  }
}
```

### 11. Get Lead Magnet Analytics
**Endpoint:** `GET /api/lead-magnets/analytics`  
**Description:** Retrieve performance analytics for lead magnets  
**Authentication:** Required  
**Use Case:** Performance tracking, optimization, ROI measurement

**Query Parameters:**
```json
{
  "timeframe": "monthly",
  "magnets": ["all"],
  "includeComparisons": true
}
```

**Response:**
```json
{
  "timeframe": "monthly",
  "overview": {
    "totalLeads": 234,
    "totalConversions": 67,
    "overallConversionRate": 28.6,
    "averageEngagement": 4.2
  },
  "magnetPerformance": [
    {
      "magnetId": "ai_diet_plan",
      "name": "AI Diet Plan Generator",
      "leads": 89,
      "conversions": 31,
      "conversionRate": 34.8,
      "engagement": 4.5,
      "trend": "+12%"
    }
  ],
  "insights": [
    "AI Diet Plan shows highest conversion rate",
    "Sleep Analyzer has highest engagement",
    "Consider promoting top performers more prominently"
  ],
  "recommendations": [
    "Optimize AI Diet Plan for higher volume",
    "Improve Sleep Analyzer conversion rate",
    "Test new magnet types based on performance data"
  ]
}
```

### 12. Get Lead Magnet History
**Endpoint:** `GET /api/lead-magnets/history/:leadId`  
**Description:** Retrieve interaction history for a specific lead  
**Authentication:** Required  
**Use Case:** Lead nurturing, personalization, conversion optimization

**Response:**
```json
{
  "leadId": "lead_123",
  "leadName": "Sarah Johnson",
  "interactions": [
    {
      "date": "2024-01-15T10:30:00Z",
      "magnet": "bmi_calculator",
      "action": "downloaded",
      "engagement": "high",
      "followUp": "sent"
    },
    {
      "date": "2024-01-18T14:20:00Z",
      "magnet": "ai_diet_plan",
      "action": "requested",
      "engagement": "medium",
      "followUp": "pending"
    }
  ],
  "preferences": {
    "favoriteMagnets": ["bmi_calculator", "sleep_analyzer"],
    "interests": ["weight_loss", "health_optimization"],
    "communication": "whatsapp",
    "engagement": "high"
  },
  "nextSteps": [
    "Send personalized diet plan",
    "Follow up on sleep analysis",
    "Offer consultation booking"
  ]
}
```

---

## Setup & Configuration

### 1. Initial Setup
```bash
# Enable lead magnets
curl -X PUT /api/lead-magnets/coach \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "defaultMagnet": "bmi_calculator",
    "captureMethod": "form"
  }'
```

### 2. WhatsApp Integration
- Configure WhatsApp Business API
- Set up automated responses
- Create lead capture flows
- Test message delivery

### 3. Email Integration
- Connect email service provider
- Set up follow-up sequences
- Configure lead scoring
- Test automation flows

---

## Use Cases

### 1. Lead Generation
- **Website Integration**: Embed magnets on landing pages
- **Social Media**: Share interactive tools and calculators
- **Email Marketing**: Promote magnets to existing lists
- **Paid Advertising**: Use magnets as lead capture tools

### 2. Lead Qualification
- **Interest Assessment**: Understand prospect needs
- **Engagement Scoring**: Measure lead quality
- **Personalization**: Customize follow-up content
- **Conversion Optimization**: Improve lead-to-customer rates

### 3. Authority Building
- **Content Marketing**: Provide valuable resources
- **Expert Positioning**: Demonstrate knowledge and expertise
- **Trust Building**: Establish credibility with prospects
- **Relationship Development**: Nurture long-term connections

---

## Best Practices

### 1. Magnet Design
- **Value First**: Ensure magnets provide genuine value
- **Easy Access**: Make magnets simple to access and use
- **Clear Benefits**: Communicate what users will receive
- **Professional Quality**: Maintain high content standards

### 2. Lead Capture
- **Minimal Friction**: Reduce form fields and requirements
- **Multiple Options**: Offer various access methods
- **Mobile Optimization**: Ensure mobile-friendly experience
- **Clear Expectations**: Set proper follow-up expectations

### 3. Follow-up Strategy
- **Immediate Delivery**: Provide magnets instantly
- **Personalized Content**: Customize follow-up messages
- **Consistent Communication**: Maintain regular contact
- **Value Addition**: Continue providing valuable content

---

## Conclusion

The Lead Magnets module provides coaches with powerful tools to attract, engage, and convert prospects through valuable content and interactive tools. By implementing a well-designed lead magnet strategy, coaches can build their email lists, establish authority, and nurture leads effectively.

The key to success is creating magnets that provide genuine value, optimizing the capture process for minimal friction, and following up with personalized, valuable content that continues to serve the prospect's needs.

Remember that lead magnets are just the beginning of the relationship - the real value comes from the ongoing nurturing and value delivery that follows.
