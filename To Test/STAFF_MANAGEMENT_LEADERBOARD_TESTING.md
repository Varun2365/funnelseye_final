# 👥 STAFF MANAGEMENT & LEADERBOARD TESTING GUIDE

## 📋 **Overview**
This guide covers testing of the complete Staff Management system and Staff Leaderboard & Scoring system including staff creation, management, performance tracking, and leaderboard functionality.

---

## 🔑 **PREREQUISITES**
- Server running on localhost:3000
- Postman or similar API testing tool
- Test database with sample data
- Valid authentication tokens (coach and admin)
- Sample staff members and performance data

---

## 📊 **TESTING SEQUENCE**

### **Phase 1: Staff Management (Core Functions)**
### **Phase 2: Staff Leaderboard & Scoring**
### **Phase 3: Staff Dashboard Integration**
### **Phase 4: Performance Analytics & Reports**

---

## 👥 **PHASE 1: STAFF MANAGEMENT (Core Functions)**

### **1.1 Create Staff Under Coach**
```http
POST /api/staff
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "name": "Assistant A",
  "email": "assistant@ex.com",
  "password": "Passw0rd!",
  "permissions": ["leads:read", "leads:update"],
  "role": "assistant",
  "phone": "+1234567890",
  "department": "Sales",
  "hireDate": "2025-01-01"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "staff_123",
    "name": "Assistant A",
    "email": "assistant@ex.com",
    "role": "assistant",
    "permissions": ["leads:read", "leads:update"],
    "coachId": "coach_123",
    "status": "active",
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
```

**Test Cases:**
- ✅ Should create staff account under coach
- ✅ Should assign correct permissions
- ✅ Should require coach authentication
- ✅ Should validate email and password

---

### **1.2 List Staff of Coach**
```http
GET /api/staff?coachId=coach_123
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "staff_123",
      "name": "Assistant A",
      "email": "assistant@ex.com",
      "role": "assistant",
      "permissions": ["leads:read", "leads:update"],
      "status": "active",
      "hireDate": "2025-01-01",
      "lastActive": "2025-01-20T09:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

**Test Cases:**
- ✅ Should return coach's staff members
- ✅ Should include pagination
- ✅ Should require coach authentication
- ✅ Should filter by coach ID

---

### **1.3 Update Staff Information**
```http
PUT /api/staff/staff_123
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "name": "Assistant A2",
  "permissions": ["leads:read", "leads:update", "leads:create"],
  "role": "senior_assistant",
  "department": "Sales & Marketing"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "staff_123",
    "name": "Assistant A2",
    "permissions": ["leads:read", "leads:update", "leads:create"],
    "role": "senior_assistant",
    "department": "Sales & Marketing",
    "updatedAt": "2025-01-20T10:05:00Z"
  }
}
```

**Test Cases:**
- ✅ Should update staff information
- ✅ Should modify permissions
- ✅ Should require coach authentication
- ✅ Should validate permission changes

---

### **1.4 Deactivate Staff**
```http
DELETE /api/staff/staff_123
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Staff deactivated successfully",
    "staffId": "staff_123",
    "deactivatedAt": "2025-01-20T10:10:00Z"
  }
}
```

**Test Cases:**
- ✅ Should deactivate staff account
- ✅ Should require coach authentication
- ✅ Should maintain data integrity
- ✅ Should prevent login access

---

## 🏆 **PHASE 2: STAFF LEADERBOARD & SCORING**

### **2.1 Get Staff Leaderboard**
```http
GET /api/staff-leaderboard/leaderboard?coachId=coach_123&period=monthly&limit=20
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "coachId": "coach_123",
    "leaderboard": [
      {
        "rank": 1,
        "staffId": "staff_123",
        "name": "Assistant A",
        "score": 95.5,
        "performance": {
          "taskCompletion": 0.95,
          "qualityRating": 0.92,
          "efficiency": 0.88,
          "leadership": 0.85
        },
        "achievements": ["Top Performer", "Quality Champion"],
        "trend": "up"
      }
    ],
    "totalParticipants": 15,
    "lastUpdated": "2025-01-20T10:00:00Z"
  }
}
```

**Test Cases:**
- ✅ Should return ranked staff list
- ✅ Should include performance scores
- ✅ Should show achievements
- ✅ Should require coach authentication

---

### **2.2 Get Individual Staff Score**
```http
GET /api/staff-leaderboard/staff/staff_123/score?coachId=coach_123&period=monthly
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "staffId": "staff_123",
    "name": "Assistant A",
    "period": "monthly",
    "overallScore": 95.5,
    "scoreBreakdown": {
      "taskCompletion": {
        "score": 38.0,
        "weight": 0.4,
        "rawValue": 0.95
      },
      "qualityRating": {
        "score": 27.6,
        "weight": 0.3,
        "rawValue": 0.92
      },
      "efficiency": {
        "score": 17.6,
        "weight": 0.2,
        "rawValue": 0.88
      },
      "leadership": {
        "score": 12.3,
        "weight": 0.1,
        "rawValue": 0.85
      }
    },
    "rank": 1,
    "totalParticipants": 15
  }
}
```

**Test Cases:**
- ✅ Should return detailed score breakdown
- ✅ Should show weighted calculations
- ✅ Should include ranking information
- ✅ Should require coach authentication

---

### **2.3 Get Staff Achievements**
```http
GET /api/staff-leaderboard/staff/staff_123/achievements?coachId=coach_123
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "staffId": "staff_123",
    "name": "Assistant A",
    "achievements": [
      {
        "id": "ach_123",
        "name": "Top Performer",
        "description": "Achieved highest score this month",
        "category": "performance",
        "earnedAt": "2025-01-20T10:00:00Z",
        "badge": "🏆",
        "points": 100
      },
      {
        "id": "ach_124",
        "name": "Quality Champion",
        "description": "Maintained 90%+ quality rating",
        "category": "quality",
        "earnedAt": "2025-01-19T10:00:00Z",
        "badge": "⭐",
        "points": 50
      }
    ],
    "totalPoints": 150,
    "achievementCount": 2
  }
}
```

**Test Cases:**
- ✅ Should return staff achievements
- ✅ Should include achievement details
- ✅ Should show points and badges
- ✅ Should require coach authentication

---

### **2.4 Get Staff Progress Over Time**
```http
GET /api/staff-leaderboard/staff/staff_123/progress?coachId=coach_123&timeRange=30
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "staffId": "staff_123",
    "name": "Assistant A",
    "timeRange": 30,
    "progress": [
      {
        "date": "2025-01-01",
        "score": 85.2,
        "rank": 3,
        "tasksCompleted": 12,
        "qualityRating": 0.88
      },
      {
        "date": "2025-01-15",
        "score": 90.1,
        "rank": 2,
        "tasksCompleted": 18,
        "qualityRating": 0.91
      },
      {
        "date": "2025-01-20",
        "score": 95.5,
        "rank": 1,
        "tasksCompleted": 25,
        "qualityRating": 0.92
      }
    ],
    "trend": "up",
    "improvement": 10.3
  }
}
```

**Test Cases:**
- ✅ Should return progress over time
- ✅ Should show score trends
- ✅ Should include ranking changes
- ✅ Should require coach authentication

---

### **2.5 Get Team Analytics**
```http
GET /api/staff-leaderboard/team/analytics?coachId=coach_123&period=monthly
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coachId": "coach_123",
    "period": "monthly",
    "teamMetrics": {
      "totalStaff": 15,
      "activeStaff": 14,
      "averageScore": 78.3,
      "topScore": 95.5,
      "lowestScore": 45.2,
      "scoreDistribution": {
        "excellent": 3,
        "good": 7,
        "average": 3,
        "needsImprovement": 2
      }
    },
    "performanceTrends": {
      "overallImprovement": 12.5,
      "topPerformers": 5,
      "improvingStaff": 8,
      "decliningStaff": 1
    },
    "departmentBreakdown": {
      "Sales": {
        "count": 8,
        "averageScore": 82.1
      },
      "Marketing": {
        "count": 4,
        "averageScore": 75.8
      },
      "Support": {
        "count": 3,
        "averageScore": 71.2
      }
    }
  }
}
```

**Test Cases:**
- ✅ Should return team performance metrics
- ✅ Should show score distribution
- ✅ Should include department breakdown
- ✅ Should require coach authentication

---

### **2.6 Get Most Improved Staff Member**
```http
GET /api/staff-leaderboard/team/most-improved?coachId=coach_123&period=monthly
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coachId": "coach_123",
    "period": "monthly",
    "mostImproved": {
      "staffId": "staff_456",
      "name": "Assistant B",
      "improvement": 25.3,
      "previousScore": 60.2,
      "currentScore": 85.5,
      "rankChange": 8,
      "previousRank": 12,
      "currentRank": 4,
      "factors": [
        "Increased task completion rate",
        "Improved quality ratings",
        "Better time management"
      ]
    }
  }
}
```

**Test Cases:**
- ✅ Should identify most improved staff
- ✅ Should show improvement metrics
- ✅ Should include rank changes
- ✅ Should require coach authentication

---

### **2.7 Get Team Performance Trends**
```http
GET /api/staff-leaderboard/team/trends?coachId=coach_123&timeRange=90
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coachId": "coach_123",
    "timeRange": 90,
    "trends": {
      "overallScore": {
        "trend": "up",
        "change": 8.7,
        "data": [
          { "date": "2024-10-20", "score": 72.1 },
          { "date": "2024-11-20", "score": 75.3 },
          { "date": "2024-12-20", "score": 78.9 },
          { "date": "2025-01-20", "score": 80.8 }
        ]
      },
      "participation": {
        "trend": "stable",
        "change": 0.0,
        "data": [
          { "date": "2024-10-20", "count": 15 },
          { "date": "2024-11-20", "count": 15 },
          { "date": "2024-12-20", "count": 15 },
          { "date": "2025-01-20", "count": 15 }
        ]
      }
    },
    "insights": [
      "Overall team performance improving steadily",
      "Consistent participation levels maintained",
      "Quality metrics showing positive trend"
    ]
  }
}
```

**Test Cases:**
- ✅ Should return performance trends
- ✅ Should show data over time
- ✅ Should include trend analysis
- ✅ Should require coach authentication

---

### **2.8 Compare Staff Performance**
```http
GET /api/staff-leaderboard/staff/comparison?coachId=coach_123&staffIds=staff_123,staff_456&period=monthly
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coachId": "coach_123",
    "period": "monthly",
    "comparison": [
      {
        "staffId": "staff_123",
        "name": "Assistant A",
        "overallScore": 95.5,
        "rank": 1,
        "breakdown": {
          "taskCompletion": 0.95,
          "qualityRating": 0.92,
          "efficiency": 0.88,
          "leadership": 0.85
        }
      },
      {
        "staffId": "staff_456",
        "name": "Assistant B",
        "overallScore": 85.5,
        "rank": 4,
        "breakdown": {
          "taskCompletion": 0.88,
          "qualityRating": 0.85,
          "efficiency": 0.82,
          "leadership": 0.78
        }
      }
    ],
    "analysis": {
      "strengths": {
        "staff_123": ["Task completion", "Quality focus"],
        "staff_456": ["Consistent performance", "Team collaboration"]
      },
      "areasForImprovement": {
        "staff_123": ["Leadership development"],
        "staff_456": ["Task efficiency", "Quality standards"]
      }
    }
  }
}
```

**Test Cases:**
- ✅ Should compare multiple staff members
- ✅ Should show performance breakdown
- ✅ Should include analysis insights
- ✅ Should require coach authentication

---

### **2.9 Get Ranking Levels Configuration**
```http
GET /api/staff-leaderboard/config/ranking-levels?coachId=coach_123
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coachId": "coach_123",
    "rankingLevels": [
      {
        "level": "excellent",
        "minScore": 90.0,
        "maxScore": 100.0,
        "badge": "🏆",
        "color": "#28a745",
        "description": "Exceptional performance"
      },
      {
        "level": "good",
        "minScore": 75.0,
        "maxScore": 89.9,
        "badge": "⭐",
        "color": "#17a2b8",
        "description": "Above average performance"
      },
      {
        "level": "average",
        "minScore": 60.0,
        "maxScore": 74.9,
        "badge": "📊",
        "color": "#ffc107",
        "description": "Meets expectations"
      },
      {
        "level": "needsImprovement",
        "minScore": 0.0,
        "maxScore": 59.9,
        "badge": "⚠️",
        "color": "#dc3545",
        "description": "Below expectations"
      }
    ]
  }
}
```

**Test Cases:**
- ✅ Should return ranking level configuration
- ✅ Should include score ranges
- ✅ Should show badges and colors
- ✅ Should require coach authentication

---

### **2.10 Get Achievements Configuration**
```http
GET /api/staff-leaderboard/config/achievements?coachId=coach_123
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coachId": "coach_123",
    "achievements": [
      {
        "id": "ach_001",
        "name": "Top Performer",
        "description": "Achieve highest score in ranking period",
        "category": "performance",
        "badge": "🏆",
        "points": 100,
        "criteria": "Rank #1 in monthly leaderboard",
        "isActive": true
      },
      {
        "id": "ach_002",
        "name": "Quality Champion",
        "description": "Maintain 90%+ quality rating",
        "category": "quality",
        "badge": "⭐",
        "points": 50,
        "criteria": "Quality rating >= 0.90 for 7 consecutive days",
        "isActive": true
      }
    ]
  }
}
```

**Test Cases:**
- ✅ Should return achievements configuration
- ✅ Should include achievement criteria
- ✅ Should show points and badges
- ✅ Should require coach authentication

---

### **2.11 Get Scoring Weights Configuration**
```http
GET /api/staff-leaderboard/config/scoring-weights?coachId=coach_123
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coachId": "coach_123",
    "scoringWeights": {
      "taskCompletion": {
        "weight": 0.4,
        "description": "Task completion rate",
        "maxScore": 40
      },
      "qualityRating": {
        "weight": 0.3,
        "description": "Quality of work delivered",
        "maxScore": 30
      },
      "efficiency": {
        "weight": 0.2,
        "description": "Time efficiency and productivity",
        "maxScore": 20
      },
      "leadership": {
        "weight": 0.1,
        "description": "Leadership and initiative",
        "maxScore": 10
      }
    },
    "totalWeight": 1.0,
    "maxTotalScore": 100
  }
}
```

**Test Cases:**
- ✅ Should return scoring weights configuration
- ✅ Should show weight distribution
- ✅ Should include max scores
- ✅ Should require coach authentication

---

### **2.12 Update Scoring Weights**
```http
PUT /api/staff-leaderboard/config/scoring-weights
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "weights": {
    "taskCompletion": 0.35,
    "qualityRating": 0.35,
    "efficiency": 0.2,
    "leadership": 0.1
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Scoring weights updated successfully",
    "updatedWeights": {
      "taskCompletion": 0.35,
      "qualityRating": 0.35,
      "efficiency": 0.2,
      "leadership": 0.1
    },
    "updatedAt": "2025-01-20T10:15:00Z"
  }
}
```

**Test Cases:**
- ✅ Should update scoring weights
- ✅ Should validate total equals 1.0
- ✅ Should require coach authentication
- ✅ Should recalculate existing scores

---

## 🧪 **TESTING CHECKLIST**

### **Staff Management:**
- [ ] Create staff under coach
- [ ] List staff of coach
- [ ] Update staff information
- [ ] Deactivate staff

### **Staff Leaderboard:**
- [ ] Get staff leaderboard
- [ ] Get individual staff score
- [ ] Get staff achievements
- [ ] Get staff progress over time
- [ ] Get team analytics
- [ ] Get most improved staff
- [ ] Get team performance trends
- [ ] Compare staff performance

### **Configuration:**
- [ ] Get ranking levels configuration
- [ ] Get achievements configuration
- [ ] Get scoring weights configuration
- [ ] Update scoring weights

---

## 🚨 **ERROR HANDLING TESTS**

### **Authentication Errors:**
- [ ] Test without token
- [ ] Test with invalid token
- [ ] Test with expired token

### **Validation Errors:**
- [ ] Test with missing required fields
- [ ] Test with invalid data formats
- [ ] Test with non-existent staff IDs

### **Permission Errors:**
- [ ] Test coach accessing other coach's staff
- [ ] Test staff accessing leaderboard data
- [ ] Test unauthorized configuration changes

---

## 📊 **PERFORMANCE TESTS**

### **Load Testing:**
- [ ] Test with 100+ staff members
- [ ] Test with 1000+ performance records
- [ ] Test leaderboard generation with large datasets

### **Response Time:**
- [ ] Leaderboard queries < 3 seconds
- [ ] Performance analytics < 5 seconds
- [ ] Score calculations < 1 second

---

## 🔍 **DEBUGGING TIPS**

### **Common Issues:**
1. **Staff Not Found** - Check staff ID and coach relationship
2. **Score Calculation Errors** - Verify scoring weights configuration
3. **Permission Denied** - Check authentication and coach ownership
4. **Data Not Syncing** - Verify performance data updates

### **Database Queries:**
- Check MongoDB connection
- Verify collection indexes
- Monitor aggregation pipeline performance

### **API Responses:**
- Check response status codes
- Verify response data structure
- Monitor error messages

---

## ✅ **COMPLETION CHECKLIST**

- [ ] All staff management routes tested
- [ ] All leaderboard routes tested
- [ ] All configuration routes tested
- [ ] Error handling verified
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Issues logged and resolved

---

**🎯 Ready to start testing! Begin with Phase 1 (Staff Management) and work through systematically.**
