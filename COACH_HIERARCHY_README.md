# 🏗️ Coach Hierarchy System

## Overview
The Coach Hierarchy System is a comprehensive MLM (Multi-Level Marketing) structure that allows coaches to be organized in a hierarchical manner with specific levels, sponsors, and team rankings. This system is designed to be locked after initial setup, requiring admin approval for any changes.

## 🎯 Key Features

### 1. **Hierarchy Levels (12 Levels)**
- **Distributor Coach** (Level 1) - Entry level
- **Senior Consultant** (Level 2) - Experienced consultant
- **Success Builder** (Level 3) - Success-focused coach
- **Supervisor** (Level 4) - Supervisory role
- **World Team** (Level 5) - World team level
- **G.E.T Team** (Level 6) - G.E.T team level
- **Get 2500 Team** (Level 7) - 2500 team level
- **Millionaire Team** (Level 8) - Millionaire team level
- **Millionaire 7500 Team** (Level 9) - 7500 millionaire team
- **President's Team** (Level 10) - President team level
- **Chairman's Club** (Level 11) - Chairman club level
- **Founder's Circle** (Level 12) - Founder circle level

### 2. **Coach Identification**
- **Self Coach ID**: Unique identifier for each coach (format: COACH-YYYY-XXXX)
- **Current Level**: Dropdown selection from the 12 levels above
- **Hierarchy Lock**: Prevents changes after initial setup

### 3. **Sponsor Management**
- **Digital System Sponsors**: Coaches already using the system
- **External Sponsors**: Sponsors not using the digital system
- **Sponsor Search**: Find sponsors by name, ID, phone, or email

### 4. **Team Rankings**
- **Team Rank Name**: Optional field for team identification
- **President Team Rank Name**: Optional field for president team

### 5. **Admin Request System**
- Coaches must submit requests for hierarchy changes
- Admin verification and approval required
- Audit trail of all changes

## 🚀 API Endpoints

### Public Routes
```
GET    /api/coach-hierarchy/levels              - Get all hierarchy levels
POST   /api/coach-hierarchy/generate-coach-id   - Generate unique coach ID
GET    /api/coach-hierarchy/search-sponsor      - Search for sponsors
POST   /api/coach-hierarchy/external-sponsor    - Create external sponsor
POST   /api/coach-hierarchy/signup              - Coach signup with hierarchy
```

### Private Routes (Coach Only)
```
POST   /api/coach-hierarchy/lock                - Lock hierarchy after login
POST   /api/coach-hierarchy/admin-request       - Submit change request
GET    /api/coach-hierarchy/details             - Get hierarchy details
```

### Admin Routes
```
GET    /api/coach-hierarchy/admin-requests      - Get pending requests
PUT    /api/coach-hierarchy/admin-request/:id   - Process admin request
```

## 📋 Usage Examples

### 1. **Coach Signup with Hierarchy**
```javascript
// Generate coach ID first
const coachIdResponse = await fetch('/api/coach-hierarchy/generate-coach-id', {
    method: 'POST'
});
const { coachId } = await coachIdResponse.json();

// Signup with hierarchy details
const signupResponse = await fetch('/api/coach-hierarchy/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        selfCoachId: coachId,
        currentLevel: 1,
        sponsorId: '64f1a2b3c4d5e6f7a8b9c0d1', // Optional: digital sponsor
        externalSponsorId: null, // Optional: external sponsor
        teamRankName: 'Alpha Team', // Optional
        presidentTeamRankName: 'President Elite' // Optional
    })
});
```

### 2. **Search for Sponsors**
```javascript
// Search for sponsors
const searchResponse = await fetch('/api/coach-hierarchy/search-sponsor?query=John', {
    method: 'GET'
});
const { digitalSponsors, externalSponsors } = await searchResponse.json();
```

### 3. **Create External Sponsor**
```javascript
const externalSponsorResponse = await fetch('/api/coach-hierarchy/external-sponsor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'External Sponsor Name',
        phone: '+1234567890',
        email: 'sponsor@example.com',
        notes: 'Not using digital system'
    })
});
```

### 4. **Submit Admin Request for Changes**
```javascript
const adminRequestResponse = await fetch('/api/coach-hierarchy/admin-request', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        requestType: 'level_change',
        requestedData: { currentLevel: 2 },
        reason: 'Promotion to Senior Consultant level'
    })
});
```

## 🔒 Security Features

### 1. **Hierarchy Locking**
- Hierarchy details are locked after first login
- No direct editing allowed after lock
- Changes require admin approval

### 2. **Admin Verification**
- All hierarchy changes go through admin review
- Audit trail maintained for compliance
- Verification process ensures data integrity

### 3. **Role-Based Access**
- Public routes for signup and information
- Private routes for authenticated coaches
- Admin routes for authorized personnel only

## 🗄️ Database Schema

### Coach Schema Updates
```javascript
// New hierarchy fields added to coach schema
{
    selfCoachId: String,           // Unique coach identifier
    currentLevel: Number,           // 1-12 hierarchy level
    sponsorId: ObjectId,           // Reference to digital sponsor
    externalSponsorId: ObjectId,   // Reference to external sponsor
    teamRankName: String,          // Optional team rank
    presidentTeamRankName: String, // Optional president team rank
    hierarchyLocked: Boolean,      // Lock status
    hierarchyLockedAt: Date        // Lock timestamp
}
```

### New Collections
- **CoachHierarchyLevel**: Stores the 12 hierarchy levels
- **AdminRequest**: Tracks change requests and approvals
- **ExternalSponsor**: Manages sponsors not using the system

## 🚀 Setup Instructions

### 1. **Seed Hierarchy Levels**
```bash
node misc/seedHierarchyLevels.js
```

### 2. **Database Migration**
The system automatically handles existing coaches by setting default values:
- `selfCoachId`: null (to be set during hierarchy setup)
- `currentLevel`: 1 (default level)
- `hierarchyLocked`: false (unlocked initially)

### 3. **Environment Variables**
Ensure your MongoDB connection is properly configured in your environment.

## 🔄 Workflow

### **Coach Signup Process**
1. Generate unique coach ID
2. Select current level from dropdown
3. Search and select sponsor (digital or external)
4. Optionally add team rank names
5. Complete signup
6. Lock hierarchy after first login

### **Change Request Process**
1. Coach submits admin request with reason
2. Admin reviews request and supporting documentation
3. Admin approves or rejects with notes
4. If approved, changes are automatically applied
5. Audit trail maintained

## 📊 Integration with Existing Systems

### **MLM System**
- Works alongside existing MLM functionality
- Maintains backward compatibility
- Enhances team structure visibility

### **Leaderboard System**
- **No connection** with FunnelsEye leaderboard
- Leaderboard remains independent function
- Hierarchy levels are company-specific, not performance-based

### **Coach Dashboard**
- Hierarchy information displayed in coach profile
- Team structure visualization
- Sponsor relationship tracking

## 🛠️ Maintenance

### **Adding New Levels**
- Contact support team to raise ticket
- Levels can only be modified by support team
- No client-side level management

### **Data Integrity**
- Regular backups of hierarchy data
- Validation rules prevent invalid configurations
- Audit logs for compliance

## 🆘 Support

### **Technical Issues**
- Check API documentation
- Verify database connections
- Review error logs

### **Hierarchy Changes**
- Submit admin request through system
- Contact support team for urgent changes
- Follow verification process

### **Level Modifications**
- Support team handles level name changes
- Client cannot modify level structure
- Changes require system update

## 📝 Notes

- **Hierarchy is separate from performance**: The 12 levels are company hierarchy levels, not performance-based rankings
- **FunnelsEye leaderboard**: Remains unchanged and independent
- **Sponsor flexibility**: Supports both digital system users and external sponsors
- **Security**: All changes require admin approval after initial setup
- **Compliance**: Full audit trail maintained for regulatory requirements

---

*This system is designed to provide a robust, secure, and scalable hierarchy management solution for MLM organizations while maintaining data integrity and compliance requirements.*
