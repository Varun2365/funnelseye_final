# 🧪 **API Testing - Section 3: Funnel Builder (Landing Pages)**

## **📋 Prerequisites:**
- ✅ Coach logged in (use login endpoint from previous section)
- ✅ Store `coachId` and `authToken` in Postman variables
- ✅ Ensure you have a valid coach account

---

## **🔧 Base URL & Headers:**
```
Base URL: {{baseUrl}}/api/funnels
Headers: 
  Authorization: Bearer {{authToken}}
  Content-Type: application/json
```

---

## **📝 1. Funnel Management Testing**

### **1.1 Create a New Funnel**
```http
POST {{baseUrl}}/api/funnels/coach/{{coachId}}/funnels
```
**Payload:**
```json
{
  "name": "Weight Loss Landing Page",
  "description": "Landing page funnel for weight loss program",
  "funnelUrl": "weight-loss-program",
  "targetAudience": "customer",
  "stages": [
    {
      "pageId": "page_1",
      "name": "Hero Section",
      "type": "hero",
      "selectedTemplateKey": "hero_1",
      "html": "<div class='hero'><h1>Transform Your Body in 30 Days</h1><p>Join our proven weight loss program</p></div>",
      "css": ".hero { text-align: center; padding: 50px; }",
      "js": "console.log('Hero loaded');",
      "assets": ["hero-image.jpg"],
      "basicInfo": {
        "title": "Weight Loss Program - Hero",
        "description": "Transform your body with our proven program",
        "keywords": "weight loss, fitness, transformation",
        "socialTitle": "Transform Your Body in 30 Days",
        "socialDescription": "Join our proven weight loss program"
      },
      "order": 1,
      "isEnabled": true
    },
    {
      "pageId": "page_2", 
      "name": "Features Section",
      "type": "features",
      "selectedTemplateKey": "features_1",
      "html": "<div class='features'><h2>Program Features</h2><ul><li>Custom meal plans</li><li>Workout routines</li></ul></div>",
      "css": ".features { padding: 40px; }",
      "js": "",
      "assets": [],
      "basicInfo": {
        "title": "Program Features",
        "description": "What's included in our weight loss program"
      },
      "order": 2,
      "isEnabled": true
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "funnel_id_here",
    "name": "Weight Loss Landing Page",
    "funnelUrl": "weight-loss-program",
    "stages": [...],
    "coachId": "{{coachId}}",
    "createdAt": "2024-01-XX...",
    "updatedAt": "2024-01-XX..."
  }
}
```

### **1.2 Get All Funnels for Coach**
```http
GET {{baseUrl}}/api/funnels/coach/{{coachId}}/funnels
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "funnel_id_here",
      "name": "Weight Loss Landing Page",
      "funnelUrl": "weight-loss-program",
      "stages": [...],
      "coachId": "{{coachId}}"
    }
  ]
}
```

### **1.3 Get Specific Funnel by ID**
```http
GET {{baseUrl}}/api/funnels/coach/{{coachId}}/funnels/{{funnelId}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "{{funnelId}}",
    "name": "Weight Loss Landing Page",
    "stages": [...],
    "coachId": "{{coachId}}"
  }
}
```

### **1.4 Update Funnel**
```http
PUT {{baseUrl}}/api/funnels/coach/{{coachId}}/funnels/{{funnelId}}
```
**Payload:**
```json
{
  "name": "Updated Weight Loss Landing Page",
  "description": "Updated description for the landing page"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "{{funnelId}}",
    "name": "Updated Weight Loss Landing Page",
    "description": "Updated description for the landing page",
    "stages": [...],
    "coachId": "{{coachId}}"
  }
}
```

---

## **📄 2. Stage Management Testing**

### **2.1 Add New Stage to Funnel**
```http
POST {{baseUrl}}/api/funnels/{{funnelId}}/stages
```
**Payload:**
```json
{
  "pageId": "page_3",
  "name": "Testimonials Section",
  "type": "testimonials",
  "selectedTemplateKey": "testimonials_1",
  "html": "<div class='testimonials'><h2>Success Stories</h2><p>Real results from our clients</p></div>",
  "css": ".testimonials { background: #f5f5f5; padding: 40px; }",
  "js": "",
  "assets": [],
  "basicInfo": {
    "title": "Client Testimonials",
    "description": "Success stories from our weight loss program"
  },
  "order": 3,
  "isEnabled": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Stage 'Testimonials Section' (testimonials) added successfully.",
  "data": {
    "_id": "stage_id_here",
    "pageId": "page_3",
    "name": "Testimonials Section",
    "type": "testimonials",
    "order": 3
  }
}
```

### **2.2 Edit Funnel Stage**
```http
PUT {{baseUrl}}/api/funnels/{{funnelId}}/stages/{{stageId}}
```
**Payload:**
```json
{
  "name": "Updated Testimonials Section",
  "css": ".testimonials { background: #e0e0e0; padding: 50px; }"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Funnel stage updated successfully.",
  "data": {
    "_id": "{{stageId}}",
    "name": "Updated Testimonials Section",
    "css": ".testimonials { background: #e0e0e0; padding: 50px; }"
  }
}
```

---

## **📊 3. Analytics & Tracking Testing**

### **3.1 Track Funnel Event (Public Route)**
```http
POST {{baseUrl}}/api/funnels/track
```
**Payload:**
```json
{
  "funnelId": "{{funnelId}}",
  "stageId": "{{stageId}}",
  "eventType": "page_view",
  "sessionId": "session_123",
  "userId": "user_456",
  "metadata": {
    "source": "google_ads",
    "campaign": "weight_loss_q1"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Funnel event tracked successfully",
  "data": {
    "_id": "event_id_here",
    "funnelId": "{{funnelId}}",
    "eventType": "page_view",
    "sessionId": "session_123"
  }
}
```

### **3.2 Get Funnel Analytics**
```http
GET {{baseUrl}}/api/funnels/{{funnelId}}/analytics
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "funnelId": "{{funnelId}}",
    "totalViews": 150,
    "stageBreakdown": [...],
    "conversionRate": 0.25
  }
}
```

---

## **🗑️ 4. Cleanup Testing**

### **4.1 Delete Funnel**
```http
DELETE {{baseUrl}}/api/funnels/coach/{{coachId}}/funnels/{{funnelId}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Funnel deleted successfully."
}
```

---

## **✅ Testing Checklist:**

### **Funnel Management:**
- [ ] Create new funnel with stages
- [ ] Get all funnels for coach
- [ ] Get specific funnel by ID
- [ ] Update funnel details
- [ ] Delete funnel

### **Stage Management:**
- [ ] Add new stage to funnel
- [ ] Edit existing stage
- [ ] Verify stage ordering

### **Analytics & Tracking:**
- [ ] Track funnel event (public route)
- [ ] Get funnel analytics

### **Error Handling:**
- [ ] Try to access another coach's funnel (should get 403)
- [ ] Try to create funnel with invalid data
- [ ] Try to add duplicate pageId stage

---

## **🔍 Important Notes:**

1. **Route Structure:** All routes are prefixed with `/api/funnels`
2. **Coach Authorization:** Most routes require `coachId` in the URL path
3. **Stage Management:** Stages are embedded in the funnel document, not separate collections
4. **Public Tracking:** Only the `/track` endpoint is public (no authentication required)
5. **Custom Domains:** Can be linked to funnels if the coach has active custom domains

---

## **📱 Next Section:**
After completing funnel testing, we'll move to **Lead Management & CRM** testing.
