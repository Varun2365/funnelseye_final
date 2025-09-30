# Client & Coach Leads Questions Testing Documentation

## Overview

This document provides comprehensive testing documentation for the client leads and coach leads questions functionality in the CRM system. It covers how to update lead questions, all related API routes, sample JSON requests, and expected responses.

## Table of Contents

1. [API Routes Overview](#api-routes-overview)
2. [Client Questions Testing](#client-questions-testing)
3. [Coach Questions Testing](#coach-questions-testing)
4. [Question Types API](#question-types-api)
5. [Lead Update API](#lead-update-api)
6. [Error Handling](#error-handling)
7. [Testing Scenarios](#testing-scenarios)

---

## API Routes Overview

### Public Routes (No Authentication Required)

| Method | Route | Description | Access |
|--------|-------|-------------|---------|
| `POST` | `/api/leads/question-responses` | Submit question responses for leads | Public |
| `GET` | `/api/leads/question-types` | Get all question types and structures | Public |
| `PUT` | `/api/leads/:leadId` | Update lead information | Public |

### Protected Routes (Authentication Required)

| Method | Route | Description | Access |
|--------|-------|-------------|---------|
| `GET` | `/api/leads` | Get all leads with filters | Coach |
| `GET` | `/api/leads/:leadId` | Get single lead details | Coach |
| `DELETE` | `/api/leads/:leadId` | Delete a lead | Coach |

---

## Client Questions Testing

### 1. Submit Client Question Responses

**Endpoint:** `POST /api/leads/question-responses`

**Description:** Submit question responses for fitness client leads

#### Request Headers
```
Content-Type: application/json
```

#### Sample Request Body
```json
{
  "leadId": "64a5f8b4c123456789abcdef",
  "questionResponses": {
    "clientQuestions": {
      "watchedVideo": "Yes",
      "healthGoal": "Lose Weight (5-15 kg)",
      "timelineForResults": "3-6 months (Moderate)",
      "seriousnessLevel": "Very serious - willing to invest time and money",
      "investmentRange": "₹25,000 - ₹50,000",
      "startTimeline": "Within 2 weeks",
      "additionalInfo": "I have tried dieting before but need proper guidance"
    },
    "vslWatchPercentage": 85.5
  },
  "appointmentData": {
    "preferredTime": "10:00 AM",
    "preferredDate": "2024-02-15",
    "timezone": "Asia/Kolkata",
    "notes": "Prefer morning sessions"
  }
}
```

#### Expected Response (Success)
```json
{
  "success": true,
  "message": "Question responses submitted successfully",
  "data": {
    "leadId": "64a5f8b4c123456789abcdef",
    "score": 75,
    "maxScore": 100,
    "qualificationInsights": [
      "Watched full video - high engagement",
      "VSL mostly watched (85.5%) - very high engagement",
      "Very serious about goals - high conversion potential"
    ],
    "recommendations": [],
    "status": "Qualified",
    "leadTemperature": "Hot"
  }
}
```

### 2. Client Questions Structure

#### Available Client Question Fields

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `watchedVideo` | radio | ✅ | "Yes", "No" |
| `healthGoal` | radio | ✅ | "Lose Weight (5-15 kg)", "Lose Weight (15+ kg)", "Gain Weight/Muscle", "Improve Fitness & Energy", "Manage Health Condition (Diabetes, PCOS, Thyroid)", "General Wellness & Lifestyle", "Other" |
| `timelineForResults` | dropdown | ✅ | "1-3 months (Urgent)", "3-6 months (Moderate)", "6-12 months (Gradual)", "No specific timeline" |
| `seriousnessLevel` | radio | ✅ | "Very serious - willing to invest time and money", "Serious - depends on the approach", "Somewhat serious - exploring options", "Just curious about possibilities" |
| `investmentRange` | radio | ✅ | "₹10,000 - ₹25,000", "₹25,000 - ₹50,000", "₹50,000 - ₹1,00,000", "₹1,00,000+ (Premium programs)", "Need to understand value first" |
| `startTimeline` | radio | ✅ | "Immediately (This week)", "Within 2 weeks", "Within a month", "In 2-3 months", "Just exploring for now" |
| `additionalInfo` | textarea | ❌ | Free text |

---

## Coach Questions Testing

### 1. Submit Coach Question Responses

**Endpoint:** `POST /api/leads/question-responses`

**Description:** Submit question responses for coach recruitment leads

#### Sample Request Body
```json
{
  "leadId": "64a5f8b4c123456789abcdef",
  "questionResponses": {
    "coachQuestions": {
      "watchedVideo": "Yes",
      "currentProfession": "Fitness Trainer/Gym Instructor",
      "interestReasons": [
        "Want additional income source",
        "Passionate about helping people transform",
        "Want financial freedom"
      ],
      "incomeGoal": "₹1,00,000 - ₹2,00,000/month (Professional)",
      "investmentCapacity": "₹2,00,000 - ₹3,00,000",
      "timeAvailability": "6-8 hours/day (Full-time)",
      "timelineToAchieveGoal": "6-12 months (Gradual building)",
      "additionalInfo": "Currently running a small gym, want to scale digitally"
    },
    "vslWatchPercentage": 95.0
  },
  "appointmentData": {
    "preferredTime": "2:00 PM",
    "preferredDate": "2024-02-16",
    "timezone": "Asia/Kolkata",
    "notes": "Available for business consultation"
  }
}
```

#### Expected Response (Success)
```json
{
  "success": true,
  "message": "Question responses submitted successfully",
  "data": {
    "leadId": "64a5f8b4c123456789abcdef",
    "score": 88,
    "maxScore": 100,
    "qualificationInsights": [
      "Watched full video - high engagement",
      "VSL watched completely (95.0%) - maximum engagement",
      "Professional income goal - good ambition",
      "Good investment capacity - solid commitment",
      "Full-time availability - strong potential"
    ],
    "recommendations": [],
    "status": "Qualified",
    "leadTemperature": "Hot"
  }
}
```

### 2. Coach Questions Structure

#### Available Coach Question Fields

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `watchedVideo` | radio | ✅ | "Yes", "No" |
| `currentProfession` | dropdown | ✅ | "Fitness Trainer/Gym Instructor", "Nutritionist/Dietitian", "Healthcare Professional", "Sales Professional", "Business Owner", "Corporate Employee", "Homemaker", "Student", "Unemployed/Looking for Career Change", "Other" |
| `interestReasons` | checkbox | ✅ | "Want additional income source", "Passionate about helping people transform", "Looking for career change", "Want financial freedom", "Interested in flexible work schedule", "Want to build a team/network", "Already in fitness, want to scale", "Other" |
| `incomeGoal` | radio | ✅ | "₹25,000 - ₹50,000/month (Part-time)", "₹50,000 - ₹1,00,000/month (Full-time basic)", "₹1,00,000 - ₹2,00,000/month (Professional)", "₹2,00,000 - ₹5,00,000/month (Advanced)", "₹5,00,000+/month (Empire building)" |
| `investmentCapacity` | radio | ✅ | "₹50,000 - ₹1,00,000", "₹1,00,000 - ₹2,00,000", "₹2,00,000 - ₹3,00,000", "₹3,00,000+", "Need to understand business model first" |
| `timeAvailability` | radio | ✅ | "2-4 hours/day (Part-time)", "4-6 hours/day (Serious part-time)", "6-8 hours/day (Full-time)", "8+ hours/day (Fully committed)", "Flexible based on results" |
| `timelineToAchieveGoal` | radio | ✅ | "1-3 months (Very urgent)", "3-6 months (Moderate urgency)", "6-12 months (Gradual building)", "1-2 years (Long-term vision)" |
| `additionalInfo` | textarea | ❌ | Free text |

---

## Question Types API

### Get All Question Types

**Endpoint:** `GET /api/leads/question-types`

**Description:** Retrieve all available question types and their structures

#### Request Headers
```
Content-Type: application/json
```

#### Sample Request
```bash
curl -X GET "https://your-domain.com/api/leads/question-types" \
  -H "Content-Type: application/json"
```

#### Expected Response
```json
{
  "success": true,
  "data": {
    "client": {
      "title": "Fitness Client Lead Questions",
      "description": "Questions for potential fitness clients",
      "questions": [
        {
          "field": "watchedVideo",
          "question": "Did you watch the full video before booking this call?",
          "type": "radio",
          "required": true,
          "options": ["Yes", "No"]
        },
        {
          "field": "healthGoal",
          "question": "Primary Health Goal",
          "type": "radio",
          "required": true,
          "options": [
            "Lose Weight (5-15 kg)",
            "Lose Weight (15+ kg)",
            "Gain Weight/Muscle",
            "Improve Fitness & Energy",
            "Manage Health Condition (Diabetes, PCOS, Thyroid)",
            "General Wellness & Lifestyle",
            "Other"
          ]
        }
        // ... more client questions
      ]
    },
    "coach": {
      "title": "Coach Recruitment Lead Questions",
      "description": "Questions for potential coach recruits",
      "questions": [
        {
          "field": "watchedVideo",
          "question": "Did you watch the full video before booking this call?",
          "type": "radio",
          "required": true,
          "options": ["Yes", "No"]
        },
        {
          "field": "currentProfession",
          "question": "Current Profession",
          "type": "dropdown",
          "required": true,
          "options": [
            "Fitness Trainer/Gym Instructor",
            "Nutritionist/Dietitian",
            "Healthcare Professional",
            "Sales Professional",
            "Business Owner",
            "Corporate Employee",
            "Homemaker",
            "Student",
            "Unemployed/Looking for Career Change",
            "Other"
          ]
        }
        // ... more coach questions
      ]
    }
  }
}
```

---

## Lead Update API

### Update Lead Information

**Endpoint:** `PUT /api/leads/:leadId`

**Description:** Update general lead information (public access)

#### Sample Request
```bash
curl -X PUT "https://your-domain.com/api/leads/64a5f8b4c123456789abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Contacted",
    "leadTemperature": "Hot",
    "vslWatchPercentage": 75.5,
    "notes": "Showed high interest during call"
  }'
```

#### Expected Response
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "leadId": "64a5f8b4c123456789abcdef",
    "status": "Contacted",
    "leadTemperature": "Hot",
    "vslWatchPercentage": 75.5,
    "lastUpdated": "2024-02-15T10:30:00.000Z"
  }
}
```

---

## Error Handling

### Common Error Responses

#### 1. Missing Lead ID
```json
{
  "success": false,
  "message": "Lead ID is required"
}
```

#### 2. Lead Not Found
```json
{
  "success": false,
  "message": "Lead not found"
}
```

#### 3. Missing Question Responses
```json
{
  "success": false,
  "message": "Question responses are required"
}
```

#### 4. Invalid Lead ID Format
```json
{
  "success": false,
  "message": "Invalid Lead ID format."
}
```

#### 5. Validation Error
```json
{
  "success": false,
  "message": "Validation error message here"
}
```

#### 6. Server Error
```json
{
  "success": false,
  "message": "Server Error. Could not submit question responses."
}
```

---

## Testing Scenarios

### Scenario 1: Complete Client Lead Flow

1. **Get Question Types**
   ```bash
   GET /api/leads/question-types
   ```

2. **Submit Client Responses**
   ```bash
   POST /api/leads/question-responses
   # Use client questions from response above
   ```

3. **Verify Lead Update**
   ```bash
   GET /api/leads/64a5f8b4c123456789abcdef
   # (Requires authentication)
   ```

### Scenario 2: Complete Coach Lead Flow

1. **Get Question Types**
   ```bash
   GET /api/leads/question-types
   ```

2. **Submit Coach Responses**
   ```bash
   POST /api/leads/question-responses
   # Use coach questions from response above
   ```

3. **Update Additional Lead Info**
   ```bash
   PUT /api/leads/64a5f8b4c123456789abcdef
   ```

### Scenario 3: VSL Tracking

1. **Submit Initial Response**
   ```json
   {
     "leadId": "64a5f8b4c123456789abcdef",
     "questionResponses": {
       "vslWatchPercentage": 25.0
     }
   }
   ```

2. **Update VSL Progress**
   ```json
   {
     "leadId": "64a5f8b4c123456789abcdef",
     "questionResponses": {
       "vslWatchPercentage": 75.0
     }
   }
   ```

3. **Complete VSL**
   ```json
   {
     "leadId": "64a5f8b4c123456789abcdef",
     "questionResponses": {
       "vslWatchPercentage": 100.0
     }
   }
   ```

### Scenario 4: Error Testing

#### Test Invalid Lead ID
```bash
POST /api/leads/question-responses
{
  "leadId": "invalid-id",
  "questionResponses": {
    "clientQuestions": {
      "watchedVideo": "Yes"
    }
  }
}
```

#### Test Missing Data
```bash
POST /api/leads/question-responses
{
  "leadId": "64a5f8b4c123456789abcdef"
  // Missing questionResponses
}
```

#### Test Non-existent Lead
```bash
POST /api/leads/question-responses
{
  "leadId": "64a5f8b4c123456789abcdff",
  "questionResponses": {
    "clientQuestions": {
      "watchedVideo": "Yes"
    }
  }
}
```

---

## Scoring Algorithm

### Client Lead Scoring

| Factor | Points | Conditions |
|--------|---------|------------|
| Watched Video | 20 | watchedVideo = "Yes" |
| VSL Completion | 5-20 | Based on percentage (0-100%) |
| Ready to Start | 25 | readyToStart = "Yes" |
| Willing to Invest | 25 | willingToInvest = "Yes" |
| Seriousness Scale | 10-20 | Based on scale (1-10) |

### Coach Lead Scoring

| Factor | Points | Conditions |
|--------|---------|------------|
| Watched Video | 20 | watchedVideo = "Yes" |
| VSL Completion | 5-20 | Based on percentage (0-100%) |
| Income Goal | 8-20 | Based on income level |
| Investment Capacity | 8-15 | Based on investment amount |
| Time Availability | 5-10 | Based on hours available |

### Lead Temperature Classification

- **Cold**: Score 0-40
- **Warm**: Score 41-70  
- **Hot**: Score 71-100

---

## Additional Notes

1. **Public Access**: Question response submission doesn't require authentication to allow form submissions from landing pages.

2. **Automatic Scoring**: The system automatically recalculates lead scores based on question responses.

3. **Event Publishing**: Question submissions trigger events for automation workflows.

4. **VSL Tracking**: Video Sales Letter watch percentage is tracked and affects scoring.

5. **Status Updates**: Lead status automatically changes to "Qualified" after question submission.

6. **Appointment Integration**: Question responses can include appointment booking data.

7. **Multiple Updates**: The same lead can have questions updated multiple times (responses are merged).

8. **Insights Generation**: The system provides qualification insights based on responses.

---

## Contact & Support

For technical support or questions about this API, please contact the development team.

**Last Updated:** February 2024  
**API Version:** v1  
**Documentation Version:** 1.0
