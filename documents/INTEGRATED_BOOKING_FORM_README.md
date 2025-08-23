# Integrated Booking Form System

## Overview
The booking form questions are now **integrated directly into the existing Lead schema and creation routes**. No separate endpoints needed!

## How It Works

### 1. **Single API Call** - Everything in One Request
Instead of creating a lead first, then submitting booking form questions separately, you now do everything in **one API call**.

### 2. **Automatic Lead Qualification**
When you submit the form with booking questions, the system automatically:
- Scores the lead (0-100 points)
- Assigns lead temperature (Hot/Warm/Cold)
- Generates insights and recommendations
- Updates the lead with all qualification data

## API Endpoints

### **Create Lead with Booking Form** (Public)
```
POST /api/leads
```

**Required Data:**
```json
{
  "coachId": "coach_user_id",
  "funnelId": "funnel_id",
  "name": "John Doe",
  "email": "john@email.com",
  "phone": "+1234567890",
  "source": "Web Form",
  "targetAudience": "client",
  
  // Client-specific questions
  "clientQuestions": {
    "fullName": "John Doe",
    "email": "john@email.com",
    "whatsappNumber": "+1234567890",
    "cityCountry": "New York, USA",
    "instagramUsername": "@johndoe",
    "watchedVideo": "Yes",
    "profession": "Working Professional",
    "healthGoal": "Weight Loss",
    "medicalConditions": "None",
    "age": 30,
    "activityLevel": "Moderately active",
    "supplements": "No",
    "readyToStart": "Yes",
    "willingToInvest": "Yes",
    "biggestObstacle": "Lack of time",
    "seriousnessScale": 9,
    "motivation": "Want to feel better"
  }
}
```

### **Create Lead with Coach Questions** (Public)
```
POST /api/leads
```

**Required Data:**
```json
{
  "coachId": "coach_user_id",
  "funnelId": "funnel_id",
  "name": "Jane Smith",
  "email": "jane@email.com",
  "phone": "+1234567890",
  "source": "Web Form",
  "targetAudience": "coach",
  
  // Coach-specific questions
  "coachQuestions": {
    "fullName": "Jane Smith",
    "email": "jane@email.com",
    "whatsappNumber": "+1234567890",
    "instagramUsername": "@janesmith",
    "description": "Full-time job",
    "watchedVideo": "Yes, 100%",
    "reasonForBooking": "Want to start coaching business",
    "supplements": "No",
    "mlmExperience": "No",
    "readiness": "100% ready",
    "commitment": "Yes, fully committed",
    "timeCommitment": "1-2 hours/day",
    "canAttendZoom": "Yes",
    "understandsOpportunity": "Yes",
    "additionalInfo": "Excited to start!"
  }
}
```

### **Public Funnel Lead Capture** (Public)
```
POST /api/public/leads/capture
```

**Same data structure as above**, but with `funnelId` instead of `coachId`.

## What Happens Automatically

1. **Lead gets scored** based on answers (0-100 points)
2. **Temperature assigned**: 
   - 80-100 points = Hot
   - 50-79 points = Warm  
   - 0-49 points = Cold
3. **Insights generated** about the lead
4. **Recommendations provided** for the coach
5. **Lead created/updated** with all this info

## Coach Sees Everything Here

When coach checks their leads, they automatically see:
- Basic lead info
- All booking form answers (integrated in the lead document)
- Lead score & temperature
- Qualification insights
- Recommendations

**No need to call separate endpoints** - it's all in one place!

## Benefits of Integration

✅ **Simpler API** - One endpoint instead of multiple
✅ **Atomic operations** - Lead + questions created together
✅ **Easier frontend** - Single form submission
✅ **Better data consistency** - No orphaned records
✅ **Automatic qualification** - Happens during creation
✅ **Existing routes** - No new endpoints to maintain

## Example Frontend Usage

```javascript
// Single API call to create lead with booking form
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    coachId: 'coach123',
    funnelId: 'funnel456',
    name: 'John Doe',
    email: 'john@email.com',
    targetAudience: 'client',
    clientQuestions: {
      // ... all the booking form questions
    }
  })
});

const lead = await response.json();
// Lead is created with all questions and qualification data!
```

## Migration Notes

- **Old separate endpoints removed** - No more `/api/booking-form/*`
- **Existing lead routes enhanced** - Now handle booking form questions
- **Backward compatible** - Basic leads still work without questions
- **Automatic population** - No need to manually link records
