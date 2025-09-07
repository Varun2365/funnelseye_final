# Lead Generation & CRM System Documentation

## Overview
The Lead Generation & CRM System provides comprehensive lead management, automated qualification, AI-powered insights, and nurturing sequence integration. The system supports both client and coach leads with detailed qualification questions, behavioral scoring, and automated follow-up workflows.

## System Architecture

### Core Components
- **Lead Capture & Qualification** - Automated prospect management with AI scoring
- **CRM with AI Intelligence** - Behavioral scoring and analytics
- **Daily Priority Feed** - AI-recommended next actions
- **Lead Nurturing Sequences** - Automated follow-up campaigns
- **Progress Tracking** - Comprehensive lead journey monitoring
- **Lead Magnet Interactions** - Engagement tracking and conversion optimization

### Database Schema

#### Lead Schema
```javascript
{
  coachId: ObjectId,              // Reference to User (Coach)
  funnelId: ObjectId,             // Reference to Funnel (Optional)
  funnelName: String,             // Funnel name
  name: String,                   // Lead name (required)
  email: String,                   // Email (required if no phone)
  phone: String,                  // Phone (required if no email)
  country: String,                // Country
  city: String,                   // City
  
  // Lead Qualification Fields
  status: String,                 // Default: 'New'
  leadTemperature: String,         // 'Cold', 'Warm', 'Hot' (default: 'Warm')
  source: String,                 // Lead source (default: 'Web Form')
  targetAudience: String,         // 'client' or 'coach'
  
  // Client-specific questions
  clientQuestions: {
    fullName: String,
    email: String,
    whatsappNumber: String,
    cityCountry: String,
    instagramUsername: String,
    watchedVideo: String,         // 'Yes', 'No', 'I plan to watch it soon'
    profession: String,
    healthGoal: String,           // 'Weight Loss', 'Weight Gain', etc.
    medicalConditions: String,
    age: Number,
    activityLevel: String,       // 'Very active', 'Moderately active', 'Not active'
    supplements: String,
    readyToStart: String,         // 'Yes', 'No', 'Not sure'
    willingToInvest: String,     // 'Yes', 'Need a flexible option', 'No'
    biggestObstacle: String,
    seriousnessScale: Number,    // 1-10
    motivation: String
  },
  
  // Coach-specific questions
  coachQuestions: {
    fullName: String,
    email: String,
    whatsappNumber: String,
    instagramUsername: String,
    description: String,          // 'Full-time job', 'Student', etc.
    watchedVideo: String,        // 'Yes, 100%', 'Partially', 'Not yet'
    reasonForBooking: String,
    supplements: String,
    mlmExperience: String,
    readiness: String,           // '100% ready', 'Curious but exploring', 'Not sure yet'
    commitment: String,          // 'Yes, fully committed', 'Maybe, depends on the plan', 'No, not ready'
    timeCommitment: String,      // '1-2 hours/day', '3-4 hours/day', etc.
    canAttendZoom: String,       // 'Yes', 'No'
    understandsOpportunity: String, // 'Yes', 'No'
    additionalInfo: String
  },
  
  // Auto-populated qualification fields
  score: Number,                  // 0-100 (default: 0)
  maxScore: Number,               // Default: 100
  qualificationInsights: [String],
  recommendations: [String],
  
  notes: String,                  // Max 2000 characters
  lastFollowUpAt: Date,
  nextFollowUpAt: Date,
  followUpHistory: [{
    note: String,
    followUpDate: Date,
    createdBy: ObjectId
  }],
  assignedTo: ObjectId,          // Reference to User
  
  // Appointment & Workflow Fields
  appointment: {
    status: String,               // 'Unbooked', 'Booked', 'Rescheduled', 'Confirmed', 'No Show', 'Attended'
    scheduledTime: Date,
    zoomLink: String,
    assignedStaffId: ObjectId
  },
  
  // Automated Lead Nurturing
  nurturingSequence: ObjectId,    // Reference to NurturingSequence
  nurturingStepIndex: Number,    // Default: 0
  lastNurturingStepAt: Date,
  
  // Lead Magnet Interactions
  leadMagnetInteractions: [{
    type: String,                 // 'ai_diet_planner', 'bmi_calculator', etc.
    data: Mixed,
    timestamp: Date,
    conversion: Boolean,
    conversionDate: Date
  }],
  
  // Progress Tracking
  progressTracking: [{
    date: Date,
    data: {
      weight: Number,
      measurements: {
        chest: Number,
        waist: Number,
        hips: Number,
        arms: Number,
        thighs: Number
      },
      workouts: [{
        type: String,
        duration: Number,
        intensity: String,
        calories: Number
      }],
      photos: [String],
      notes: String
    },
    metrics: {
      weightChange: Number,
      measurementChanges: Mixed,
      workoutProgress: Mixed
    }
  }],
  
  // Lead Magnet Preferences
  leadMagnetPreferences: {
    fitnessGoals: [String],
    dietaryRestrictions: [String],
    activityLevel: String,
    preferredWorkoutTypes: [String],
    healthConditions: [String],
    timeAvailability: String
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Base URL: `/api/leads`

### 1. Lead Management

#### Create Lead (Public)
**POST** `/`
- **Description**: Create new lead from public form submission
- **Authentication**: None
- **Request Body**:
```json
{
  "coachId": "65a1b2c3d4e5f6789012345a",
  "funnelId": "65a1b2c3d4e5f6789012345b",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "country": "USA",
  "city": "New York",
  "source": "Web Form",
  "targetAudience": "client",
  "clientQuestions": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "whatsappNumber": "+1234567890",
    "cityCountry": "New York, USA",
    "instagramUsername": "@johndoe",
    "watchedVideo": "Yes",
    "profession": "Software Engineer",
    "healthGoal": "Weight Loss",
    "medicalConditions": "None",
    "age": 30,
    "activityLevel": "Moderately active",
    "supplements": "None",
    "readyToStart": "Yes",
    "willingToInvest": "Yes",
    "biggestObstacle": "Time management",
    "seriousnessScale": 9,
    "motivation": "Want to feel confident and healthy"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345c",
    "coachId": "65a1b2c3d4e5f6789012345a",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "status": "New",
    "leadTemperature": "Hot",
    "score": 85,
    "maxScore": 100,
    "qualificationInsights": [
      "Watched full video - high engagement",
      "Ready to start within 7 days - high urgency",
      "Willing to invest - high conversion potential",
      "High seriousness level (8-10) - strong commitment"
    ],
    "recommendations": [
      "High priority follow-up within 24 hours",
      "Send detailed program information",
      "Schedule discovery call immediately"
    ],
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Get All Leads
**GET** `/?page=1&limit=10&status=New&temperature=Hot`
- **Description**: Retrieve leads with filtering and pagination
- **Authentication**: Coach required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by status
  - `temperature`: Filter by temperature
  - `source`: Filter by source
  - `search`: Search by name/email
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345c",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "New",
      "leadTemperature": "Hot",
      "score": 85,
      "source": "Web Form",
      "nextFollowUpAt": "2025-01-21T10:00:00Z",
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalLeads": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Single Lead
**GET** `/:leadId`
- **Description**: Get detailed lead information
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345c",
    "coachId": "65a1b2c3d4e5f6789012345a",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "country": "USA",
    "city": "New York",
    "status": "New",
    "leadTemperature": "Hot",
    "source": "Web Form",
    "targetAudience": "client",
    "clientQuestions": {
      "fullName": "John Doe",
      "watchedVideo": "Yes",
      "healthGoal": "Weight Loss",
      "readyToStart": "Yes",
      "willingToInvest": "Yes",
      "seriousnessScale": 9
    },
    "score": 85,
    "maxScore": 100,
    "qualificationInsights": [
      "Watched full video - high engagement",
      "Ready to start within 7 days - high urgency"
    ],
    "recommendations": [
      "High priority follow-up within 24 hours",
      "Schedule discovery call immediately"
    ],
    "notes": "High priority lead",
    "lastFollowUpAt": null,
    "nextFollowUpAt": "2025-01-21T10:00:00Z",
    "followUpHistory": [],
    "appointment": {
      "status": "Unbooked",
      "scheduledTime": null,
      "zoomLink": null
    },
    "nurturingSequence": null,
    "nurturingStepIndex": 0,
    "leadMagnetInteractions": [],
    "progressTracking": [],
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Update Lead
**PUT** `/:leadId`
- **Description**: Update lead information
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "status": "Contacted",
  "leadTemperature": "Hot",
  "notes": "Called the lead, very interested",
  "nextFollowUpAt": "2025-01-22T14:00:00Z"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345c",
    "status": "Contacted",
    "leadTemperature": "Hot",
    "notes": "Called the lead, very interested",
    "nextFollowUpAt": "2025-01-22T14:00:00Z",
    "updatedAt": "2025-01-20T11:00:00Z"
  }
}
```

#### Delete Lead
**DELETE** `/:leadId`
- **Description**: Delete lead
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

### 2. Follow-up Management

#### Add Follow-up Note
**POST** `/:leadId/followup`
- **Description**: Add follow-up note to lead
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "note": "Called the lead, discussed program details",
  "nextFollowUpAt": "2025-01-22T14:00:00Z"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Follow-up note added successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345c",
    "followUpHistory": [
      {
        "note": "Called the lead, discussed program details",
        "followUpDate": "2025-01-20T11:00:00Z",
        "createdBy": "65a1b2c3d4e5f6789012345a"
      }
    ],
    "lastFollowUpAt": "2025-01-20T11:00:00Z",
    "nextFollowUpAt": "2025-01-22T14:00:00Z"
  }
}
```

#### Get Upcoming Follow-ups
**GET** `/followups/upcoming`
- **Description**: Get leads with upcoming follow-ups
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345c",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "Contacted",
      "leadTemperature": "Hot",
      "nextFollowUpAt": "2025-01-21T10:00:00Z",
      "lastFollowUpAt": "2025-01-20T11:00:00Z"
    }
  ],
  "totalUpcoming": 15
}
```

### 3. AI-Powered Lead Management

#### AI Rescore Lead
**POST** `/:leadId/ai-rescore`
- **Description**: AI-powered lead rescoring and qualification
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "message": "Lead rescored successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345c",
    "score": 92,
    "leadTemperature": "Hot",
    "qualificationInsights": [
      "High engagement with content",
      "Strong commitment indicators",
      "Optimal timing for conversion"
    ],
    "recommendations": [
      "Immediate follow-up recommended",
      "Send personalized program proposal",
      "Schedule discovery call today"
    ],
    "aiRescoredAt": "2025-01-20T12:00:00Z"
  }
}
```

#### AI Qualify Lead
**GET** `/:leadId/ai-qualify`
- **Description**: Get AI-powered lead qualification and insights
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "leadId": "65a1b2c3d4e5f6789012345c",
    "qualification": {
      "score": 92,
      "temperature": "Hot",
      "confidence": 0.95,
      "insights": [
        "High engagement with content",
        "Strong commitment indicators",
        "Optimal timing for conversion"
      ],
      "recommendations": [
        "Immediate follow-up recommended",
        "Send personalized program proposal",
        "Schedule discovery call today"
      ],
      "conversionProbability": 0.87,
      "nextBestAction": "Schedule discovery call",
      "urgencyLevel": "High"
    },
    "behavioralAnalysis": {
      "engagementScore": 9.2,
      "commitmentLevel": "High",
      "timelineUrgency": "Immediate",
      "investmentReadiness": "Ready"
    }
  }
}
```

#### Generate Nurturing Sequence
**POST** `/:leadId/generate-nurturing-sequence`
- **Description**: Generate AI-powered nurturing strategy
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "sequenceType": "warm_lead",
  "duration": "14_days",
  "focus": "education_and_trust"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Nurturing sequence generated successfully",
  "data": {
    "sequenceId": "65a1b2c3d4e5f6789012345d",
    "sequenceType": "warm_lead",
    "duration": "14_days",
    "steps": [
      {
        "step": 1,
        "action": "send_email",
        "delay": "0_hours",
        "content": "Welcome email with program overview",
        "personalization": "Based on health goal: Weight Loss"
      },
      {
        "step": 2,
        "action": "send_email",
        "delay": "24_hours",
        "content": "Success story from similar client",
        "personalization": "Age group: 30s, Activity level: Moderate"
      }
    ],
    "expectedOutcome": "Schedule discovery call",
    "conversionProbability": 0.75
  }
}
```

#### Generate Follow-up Message
**POST** `/:leadId/generate-followup-message`
- **Description**: Generate personalized follow-up message
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "messageType": "discovery_call_invitation",
  "tone": "professional_friendly",
  "includeTestimonial": true
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "message": "Hi John! I noticed you're interested in weight loss and have a high commitment level. I'd love to schedule a 15-minute discovery call to discuss how our program can help you achieve your goals. Would Tuesday at 2 PM work for you?",
    "personalization": {
      "name": "John",
      "goal": "Weight Loss",
      "commitment": "High",
      "timing": "Tuesday 2 PM"
    },
    "suggestedActions": [
      "Schedule discovery call",
      "Send program details",
      "Share success story"
    ]
  }
}
```

### 4. Nurturing Sequence Integration

#### Assign Nurturing Sequence
**POST** `/assign-nurturing-sequence`
- **Description**: Assign nurturing sequence to lead
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "leadId": "65a1b2c3d4e5f6789012345c",
  "sequenceId": "65a1b2c3d4e5f6789012345d"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Nurturing sequence assigned successfully",
  "data": {
    "leadId": "65a1b2c3d4e5f6789012345c",
    "sequenceId": "65a1b2c3d4e5f6789012345d",
    "nurturingStepIndex": 0,
    "assignedAt": "2025-01-20T12:00:00Z",
    "nextStepAt": "2025-01-20T12:00:00Z"
  }
}
```

#### Advance Nurturing Step
**POST** `/advance-nurturing-step`
- **Description**: Manually advance lead to next nurturing step
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "leadId": "65a1b2c3d4e5f6789012345c"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Lead advanced to next nurturing step",
  "data": {
    "leadId": "65a1b2c3d4e5f6789012345c",
    "nurturingStepIndex": 1,
    "lastNurturingStepAt": "2025-01-20T12:00:00Z",
    "nextStepAt": "2025-01-21T12:00:00Z"
  }
}
```

#### Get Nurturing Progress
**GET** `/:leadId/nurturing-progress`
- **Description**: Get lead's nurturing sequence progress
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "leadId": "65a1b2c3d4e5f6789012345c",
    "sequenceId": "65a1b2c3d4e5f6789012345d",
    "sequenceName": "Warm Lead Nurturing",
    "currentStep": 1,
    "totalSteps": 7,
    "progress": 14.3,
    "completedSteps": [
      {
        "step": 0,
        "action": "send_email",
        "completedAt": "2025-01-20T12:00:00Z",
        "status": "completed"
      }
    ],
    "nextStep": {
      "step": 1,
      "action": "send_email",
      "scheduledAt": "2025-01-21T12:00:00Z",
      "content": "Success story from similar client"
    },
    "sequenceStatus": "active",
    "startedAt": "2025-01-20T12:00:00Z",
    "expectedCompletion": "2025-02-03T12:00:00Z"
  }
}
```

### 5. Lead Magnet Interactions

#### Track Lead Magnet Interaction
**POST** `/:leadId/lead-magnet-interaction`
- **Description**: Track lead magnet interaction
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "type": "ai_diet_planner",
  "data": {
    "goal": "Weight Loss",
    "dietaryRestrictions": ["Vegetarian"],
    "activityLevel": "Moderate",
    "results": {
      "calorieTarget": 1800,
      "mealPlan": "Generated",
      "recommendations": ["Increase protein intake"]
    }
  },
  "conversion": true
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Lead magnet interaction tracked",
  "data": {
    "leadId": "65a1b2c3d4e5f6789012345c",
    "interaction": {
      "type": "ai_diet_planner",
      "timestamp": "2025-01-20T12:00:00Z",
      "conversion": true,
      "conversionDate": "2025-01-20T12:00:00Z"
    },
    "updatedScore": 88,
    "updatedTemperature": "Hot"
  }
}
```

## Lead Qualification Logic

### Client Lead Scoring (0-100 points)
- **Video Engagement**: 20 points
  - Watched full video: 20 points
  - Plans to watch: 10 points
- **Readiness to Start**: 25 points
  - Ready to start: 25 points
  - Not sure: 10 points
- **Investment Willingness**: 25 points
  - Willing to invest: 25 points
  - Flexible option: 15 points
- **Seriousness Scale**: 20 points
  - 8-10: 20 points
  - 6-7: 15 points
  - 4-5: 10 points
- **Activity Level**: 10 points
  - Very active: 10 points
  - Moderately active: 5 points

### Coach Lead Scoring (0-100 points)
- **Video Engagement**: 20 points
  - Watched 100%: 20 points
  - Partially: 10 points
- **Business Readiness**: 30 points
  - 100% ready: 30 points
  - Curious but exploring: 20 points
- **Commitment Level**: 25 points
  - Fully committed: 25 points
  - Depends on plan: 15 points
- **Time Availability**: 15 points
  - 3-4 hours/day: 15 points
  - 1-2 hours/day: 10 points
- **Understanding**: 10 points
  - Understands opportunity: 10 points

### Temperature Classification
- **Hot**: 80-100 points
- **Warm**: 50-79 points
- **Cold**: 0-49 points

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

## Authentication

- **Public Endpoints**: Lead creation
- **Coach Authentication**: All other endpoints require coach authentication

## Rate Limiting

- **Public Endpoints**: 100 requests per hour
- **Authenticated Endpoints**: 1000 requests per hour

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error
