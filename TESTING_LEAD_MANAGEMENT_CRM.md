# 🎯 Lead Management & CRM Testing Guide

## 📋 Prerequisites
- ✅ Coach account created and logged in
- ✅ Authentication token stored in Postman
- ✅ Funnel created (for lead assignment)
- ✅ Postman environment variables set up

## 🔑 Postman Variables Setup
Set these variables in your Postman environment (camelCase format):
```
baseUrl: {{your_server_url}}
authToken: {{your_jwt_token}}
coachId: {{your_coach_id}}
funnelId: {{your_funnel_id}}
```

## 🚀 Testing Flow

### 1. 📊 Lead Creation & Management

#### 1.1 Create a New Lead
```http
POST {{baseUrl}}/api/leads
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "source": "Facebook Ad",
  "targetAudience": "client",
  "funnelId": "{{funnelId}}",
  "coachId": "{{coachId}}",
  "leadMagnetPreferences": {
    "interests": ["weight_loss", "nutrition"],
    "goals": "Lose 10kg in 3 months"
  }
}
```

**Expected Response:**
- Status: 201 Created
- Lead ID in response body
- Store `leadId` in Postman variables

#### 1.2 Get All Leads
```http
GET {{baseUrl}}/api/leads?coachId={{coachId}}&page=1&limit=10
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- Array of leads with pagination
- Verify your created lead appears

#### 1.3 Get Single Lead
```http
GET {{baseUrl}}/api/leads/{{leadId}}
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- Complete lead details
- Verify all fields are correct

#### 1.4 Update Lead
```http
PUT {{baseUrl}}/api/leads/{{leadId}}
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "status": "Qualified",
  "leadTemperature": "Hot",
  "score": 85,
  "notes": "Interested in premium package"
}
```

**Expected Response:**
- Status: 200 OK
- Updated lead details
- Verify changes are applied

#### 1.5 Delete Lead
```http
DELETE {{baseUrl}}/api/leads/{{leadId}}
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- Success message
- Lead should be removed from system

### 2. 🧮 Lead Scoring & Tracking

#### 2.1 Track Email Open
```http
GET {{baseUrl}}/api/lead-scoring/email-opened?leadId={{leadId}}
```

**Expected Response:**
- Status: 200 OK
- Redirect to tracking pixel
- Lead score should increase

#### 2.2 Track Link Click
```http
GET {{baseUrl}}/api/lead-scoring/link-clicked?leadId={{leadId}}&target=https://example.com
```

**Expected Response:**
- Status: 200 OK
- Redirect to target URL
- Lead score should increase

#### 2.3 Track WhatsApp Reply
```http
POST {{baseUrl}}/api/lead-scoring/whatsapp-replied
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "leadId": "{{leadId}}"
}
```

**Expected Response:**
- Status: 200 OK
- Lead score should increase significantly

#### 2.4 Track Form Submission
```http
POST {{baseUrl}}/api/lead-scoring/form-submitted
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "leadId": "{{leadId}}"
}
```

**Expected Response:**
- Status: 200 OK
- Lead score should increase

#### 2.5 Track Call Booking
```http
POST {{baseUrl}}/api/lead-scoring/call-booked
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "leadId": "{{leadId}}"
}
```

**Expected Response:**
- Status: 200 OK
- Lead score should increase significantly

### 3. 🌱 Lead Nurturing Sequences

#### 3.1 Create Nurturing Sequence
```http
POST {{baseUrl}}/api/nurturing-sequences
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "name": "Weight Loss Journey",
  "description": "Complete nurturing sequence for weight loss leads",
  "category": "warm_lead",
  "steps": [
    {
      "stepNumber": 1,
      "name": "Welcome Email",
      "description": "Send welcome email to new leads",
      "actionType": "send_email",
      "actionConfig": {
        "subject": "Welcome to Your Weight Loss Journey!",
        "body": "Hi {{lead.name}}, welcome to our program!"
      },
      "delayDays": 0,
      "delayHours": 0
    },
    {
      "stepNumber": 2,
      "name": "WhatsApp Follow-up",
      "description": "Send WhatsApp message after 24 hours",
      "actionType": "send_whatsapp_message",
      "actionConfig": {
        "message": "Hi {{lead.name}}, how are you feeling about starting your journey?"
      },
      "delayDays": 1,
      "delayHours": 0
    },
    {
      "stepNumber": 3,
      "name": "Create Follow-up Task",
      "description": "Create task for manual follow-up",
      "actionType": "create_task",
      "actionConfig": {
        "title": "Follow up with {{lead.name}}",
        "description": "Check progress and answer questions",
        "priority": "high"
      },
      "delayDays": 2,
      "delayHours": 0
    }
  ]
}
```

**Expected Response:**
- Status: 201 Created
- Sequence ID in response
- Store `sequenceId` in Postman variables

#### 3.2 Get All Nurturing Sequences
```http
GET {{baseUrl}}/api/nurturing-sequences?coachId={{coachId}}
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- Array of nurturing sequences
- Verify your created sequence appears

#### 3.3 Get Single Sequence
```http
GET {{baseUrl}}/api/nurturing-sequences/{{sequenceId}}
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- Complete sequence details with steps

#### 3.4 Update Sequence
```http
PUT {{baseUrl}}/api/nurturing-sequences/{{sequenceId}}
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "isActive": false,
  "description": "Updated description for weight loss leads"
}
```

**Expected Response:**
- Status: 200 OK
- Updated sequence details

#### 3.5 Delete Sequence
```http
DELETE {{baseUrl}}/api/nurturing-sequences/{{sequenceId}}
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- Success message

### 4. 🎯 Lead Magnets & Interactions

#### 4.1 Get Available Lead Magnets
```http
GET {{baseUrl}}/api/lead-magnets/available
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- List of available lead magnets
- Store `leadMagnetId` if available

#### 4.2 Generate AI Diet Plan
```http
POST {{baseUrl}}/api/lead-magnets/ai-diet-plan
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "leadId": "{{leadId}}",
  "userPreferences": {
    "age": 30,
    "gender": "male",
    "weight": 80,
    "height": 175,
    "activityLevel": "moderate",
    "goals": "weight_loss",
    "dietaryRestrictions": ["vegetarian", "no_nuts"]
  }
}
```

**Expected Response:**
- Status: 200 OK
- AI-generated diet plan
- Lead score should increase

#### 4.3 BMI Calculator
```http
POST {{baseUrl}}/api/lead-magnets/bmi-calculator
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "leadId": "{{leadId}}",
  "height": 170,
  "weight": 70,
  "age": 30,
  "gender": "male"
}
```

**Expected Response:**
- Status: 200 OK
- BMI calculation and recommendations
- Lead score should increase

#### 4.4 Get Lead Magnet Analytics
```http
GET {{baseUrl}}/api/lead-magnets/interaction-analytics?timeRange=30
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- Real lead magnet interaction analytics including:
  - Total interactions and conversions
  - Conversion rates by magnet type
  - Score impact metrics
  - Top performing magnets
  - Recent activity

**Note:** This endpoint provides real analytics based on actual lead magnet interactions. The `/analytics` endpoint returns placeholder data.

### 5. 🔄 Lead Nurturing Management

#### 5.1 Get Lead Nurturing Status
```http
GET {{baseUrl}}/api/lead-nurturing/status?leadId={{leadId}}
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- Current nurturing status and progress

#### 5.2 Progress to Next Nurturing Step
```http
POST {{baseUrl}}/api/lead-nurturing/progress-step
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "leadId": "{{leadId}}",
  "stepIndex": 2,
  "status": "completed",
  "notes": "WhatsApp message sent successfully"
}
```

**Expected Response:**
- Status: 200 OK
- Updated nurturing progress

#### 5.3 Assign Nurturing Sequence to Lead
```http
POST {{baseUrl}}/api/lead-nurturing/assign-sequence
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "leadId": "{{leadId}}",
  "sequenceId": "{{sequenceId}}"
}
```

**Expected Response:**
- Status: 200 OK
- Sequence assigned successfully

### 6. 🤖 AI-Powered Lead Features

#### 6.1 AI Lead Qualification
```http
GET {{baseUrl}}/api/leads/{{leadId}}/ai-qualify
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- AI-generated qualification insights
- Recommendations for next steps

#### 6.2 Generate Nurturing Sequence
```http
POST {{baseUrl}}/api/leads/{{leadId}}/generate-nurturing-sequence
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "sequenceType": "warm_lead",
  "context": "Interested in premium package"
}
```

**Expected Response:**
- Status: 200 OK
- AI-generated nurturing strategy
- Personalized sequence recommendations

#### 6.3 Generate Follow-up Message
```http
POST {{baseUrl}}/api/leads/{{leadId}}/generate-followup-message
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "followUpType": "first_followup",
  "context": "General follow-up after initial contact"
}
```

**Expected Response:**
- Status: 200 OK
- AI-generated follow-up message
- Personalized content based on lead data

### 7. 🔍 Advanced Lead Management

#### 7.1 Get Upcoming Follow-ups
```http
GET {{baseUrl}}/api/leads/followups/upcoming
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- List of upcoming follow-ups
- Sorted by due date

#### 7.2 Get Nurturing Progress
```http
GET {{baseUrl}}/api/leads/{{leadId}}/nurturing-progress
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- Current nurturing sequence progress
- Step completion status

#### 7.3 AI Rescore Lead
```http
POST {{baseUrl}}/api/leads/{{leadId}}/ai-rescore
Authorization: Bearer {{authToken}}
```

**Expected Response:**
- Status: 200 OK
- Updated lead score
- AI-generated insights

## ✅ Testing Checklist

### Lead Management
- [ ] Create new lead successfully
- [ ] Retrieve lead details
- [ ] Update lead information
- [ ] Delete lead
- [ ] List all leads with pagination

### Lead Scoring
- [ ] Track email opens
- [ ] Track link clicks
- [ ] Track WhatsApp replies
- [ ] Track form submissions
- [ ] Track call bookings
- [ ] Verify score increases

### Lead Nurturing
- [ ] Create nurturing sequence
- [ ] Add multiple steps
- [ ] Update sequence
- [ ] Delete sequence
- [ ] Track nurturing progress

### Lead Magnets
- [ ] Generate AI diet plan
- [ ] Calculate BMI
- [ ] View analytics
- [ ] Track interactions

### AI Features
- [ ] AI lead qualification
- [ ] Generate nurturing sequences
- [ ] Generate follow-up messages
- [ ] Verify AI insights

### Advanced Lead Management
- [ ] Get upcoming follow-ups
- [ ] Check nurturing progress
- [ ] AI rescore lead
- [ ] Assign nurturing sequences

## 🚨 Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check if `authToken` is valid and not expired
2. **404 Not Found**: Verify `leadId`, `coachId`, and `funnelId` are correct
3. **400 Bad Request**: Check request body format and required fields
4. **500 Internal Server Error**: Check server logs for detailed error information
5. **Random/Placeholder Data**: Use `/interaction-analytics` instead of `/analytics` for real data

### Debug Steps
1. Verify all Postman variables are set correctly
2. Check if the lead exists in the database
3. Ensure the coach has proper permissions
4. Verify the funnel is active and accessible

## 📝 Notes
- All lead operations require authentication
- Lead scoring is cumulative and time-based
- Nurturing sequences can be complex with multiple steps
- AI features require valid API keys and internet connectivity
- Analytics may take time to populate with data

---

**Next Section**: After completing Lead Management & CRM, proceed to **WhatsApp Automation** or **Coach Dashboard** testing.
