# Advanced MLM System Documentation

## Overview

The Advanced MLM (Multi-Level Marketing) System is a comprehensive platform that provides sophisticated hierarchy management, commission tracking, and team performance analytics for coaches. The system supports both digital system sponsors and external sponsors, with advanced features for hierarchy locking, admin request management, and automated commission calculations.

## Current Status

### ✅ Implemented Features

#### Core MLM Infrastructure
1. **12-Level Hierarchy System** with customizable ranks
2. **Dual Sponsor System** (Digital + External sponsors)
3. **Hierarchy Locking** mechanism for security
4. **Admin Request System** for hierarchy changes
5. **Commission Management** with multiple calculation types
6. **Team Performance Analytics** with comprehensive metrics
7. **Report Generation** system for business intelligence
8. **Health Check** and system monitoring

#### Advanced Features
1. **Intelligent Coach ID Generation** with uniqueness validation
2. **Sponsor Search** across digital and external systems
3. **Commission Settings** with flexible configuration
4. **Monthly Commission Processing** with automated workflows
5. **Team Performance Tracking** with detailed analytics
6. **Comprehensive Reporting** with multiple report types
7. **Database Cleanup** and maintenance tools

### 🔄 Active Components

- **Controllers**: `advancedMlmController.js` (1,744 lines)
- **Routes**: `advancedMlmRoutes.js` (24 endpoints)
- **Schemas**: `CoachHierarchyLevel.js`, `Commission.js`, `CommissionSettings.js`, `AdminRequest.js`, `ExternalSponsor.js`, `CoachReport.js`
- **Services**: Integrated with payment and user management systems
- **Testing**: `testAdvancedMlm.js` for system validation

## System Architecture

### Hierarchy Levels

The system implements a **12-level hierarchy** structure:

```javascript
const defaultLevels = [
    { level: 1, name: 'Distributor Coach', description: 'Entry level coach' },
    { level: 2, name: 'Senior Consultant', description: 'Intermediate coach' },
    { level: 3, name: 'Success Builder', description: 'Advanced coach' },
    { level: 4, name: 'Supervisor', description: 'Expert coach' },
    { level: 5, name: 'World Team', description: 'Master coach' },
    { level: 6, name: 'G.E.T Team', description: 'Elite coach' },
    { level: 7, name: 'Get 2500 Team', description: 'Premier coach' },
    { level: 8, name: 'Millionaire Team', description: 'Distinguished coach' },
    { level: 9, name: 'Millionaire 7500 Team', description: 'Honored coach' },
    { level: 10, name: 'President\'s Team', description: 'Esteemed coach' },
    { level: 11, name: 'Chairman\'s Club', description: 'Legendary coach' },
    { level: 12, name: 'Founder\'s Circle', description: 'Ultimate coach' }
];
```

### Data Models

#### CoachHierarchyLevel Schema

```javascript
{
    level: Number,                    // 1-12, required, unique
    name: String,                    // Required, e.g., "Distributor Coach"
    description: String,             // Optional description
    isActive: Boolean,               // Default: true
    createdBy: ObjectId,             // Reference to User (admin)
    lastModifiedBy: ObjectId,        // Reference to User
    lastModifiedAt: Date,            // Timestamp
    createdAt: Date,                // Auto-generated
    updatedAt: Date                  // Auto-generated
}
```

#### Commission Schema

```javascript
{
    commissionId: String,             // Unique identifier (COM_...)
    coachId: ObjectId,               // Reference to User (coach)
    subscriptionId: ObjectId,         // Reference to Subscription
    referredBy: ObjectId,            // Reference to User (sponsor)
    subscriptionAmount: Number,       // Original subscription amount
    commissionPercentage: Number,    // 0-100, commission rate
    commissionAmount: Number,        // Calculated commission
    currency: String,                // Default: 'USD'
    status: String,                  // pending, approved, paid, cancelled
    paymentDate: Date,               // When commission was paid
    month: Number,                   // 1-12, commission month
    year: Number,                    // Commission year
    isActive: Boolean,               // Default: true
    notes: String                    // Optional notes
}
```

#### CommissionSettings Schema

```javascript
{
    settingId: String,               // Unique identifier (SET_...)
    commissionPercentage: Number,     // Base commission rate (0-100)
    minimumSubscriptionAmount: Number, // Minimum amount for commission
    maximumCommissionAmount: Number,  // Maximum commission limit
    subscriptionCommissions: {
        monthly: Number,              // Monthly subscription rate
        yearly: Number,               // Yearly subscription rate
        lifetime: Number,             // Lifetime subscription rate
        default: Number               // Default rate
    },
    levelMultipliers: {
        1: Number,                    // Level 1 multiplier
        2: Number,                    // Level 2 multiplier
        // ... up to level 12
    },
    effectiveFrom: Date,             // When settings take effect
    effectiveTo: Date,               // When settings expire
    isActive: Boolean,                // Default: true
    createdBy: ObjectId,             // Reference to User (admin)
    notes: String                    // Optional notes
}
```

## API Routes

### Health & System Management

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/health` | MLM system health check | Public |
| `GET` | `/test-middleware` | Test middleware chain | Admin |
| `POST` | `/setup-hierarchy` | Setup default hierarchy levels | Admin |

### Hierarchy Management

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/hierarchy-levels` | Get all hierarchy levels | Public |
| `POST` | `/generate-coach-id` | Generate unique coach ID | Public |
| `POST` | `/lock-hierarchy` | Lock hierarchy after first login | Coach |

### Sponsor Management

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/search-sponsor` | Search for sponsors | Public |
| `POST` | `/external-sponsor` | Create external sponsor | Public |

### Admin Request System

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/admin-request` | Submit admin request | Coach |
| `GET` | `/admin-requests/:coachId` | Get coach admin requests | Coach/Admin |
| `GET` | `/admin/pending-requests` | Get pending admin requests | Admin |
| `PUT` | `/admin/process-request/:requestId` | Process admin request | Admin |
| `PUT` | `/admin/change-upline` | Change coach upline | Admin |

### Commission System

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/admin/commission-settings` | Get commission settings | Admin |
| `PUT` | `/admin/commission-settings` | Update commission settings | Admin |
| `POST` | `/admin/calculate-commission` | Calculate commission | Admin |
| `POST` | `/calculate-subscription-commission` | Calculate subscription commission | Admin |
| `GET` | `/commissions/:coachId` | Get coach commissions | Coach/Admin |
| `POST` | `/admin/process-monthly-commissions` | Process monthly commissions | Admin |

### Team Management

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/downline` | Add coach to downline | Coach |
| `GET` | `/downline/:sponsorId` | Get direct downline | Coach/Admin |
| `GET` | `/hierarchy/:coachId` | Get complete hierarchy | Coach/Admin |
| `GET` | `/team-performance/:sponsorId` | Get team performance | Coach/Admin |

### Reporting System

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/generate-report` | Generate team report | Coach |
| `GET` | `/reports/:sponsorId` | Get generated reports | Coach/Admin |
| `GET` | `/reports/detail/:reportId` | Get report details | Coach/Admin |

## Key Features

### 1. Intelligent Coach ID Generation

The system generates unique coach IDs with the format `W{7-digit-number}`:

```javascript
// Example generation logic
async function generateCoachId() {
    let coachId;
    let isUnique = false;
    
    while (!isUnique) {
        const randomNum = Math.floor(Math.random() * 9000000) + 1000000;
        coachId = `W${randomNum}`;
        
        // Check if ID already exists
        const existingCoach = await User.findOne({ 
            'selfCoachId': coachId,
            role: 'coach'
        });
        
        if (!existingCoach) {
            isUnique = true;
        }
    }
    
    return coachId;
}
```

### 2. Dual Sponsor System

The system supports both digital system sponsors and external sponsors:

```javascript
// Digital system sponsor (existing user)
{
    sponsorId: ObjectId,             // Reference to User
    externalSponsorId: null
}

// External sponsor (non-system user)
{
    sponsorId: null,
    externalSponsorId: ObjectId      // Reference to ExternalSponsor
}
```

### 3. Hierarchy Locking

Coaches can lock their hierarchy after first login to prevent unauthorized changes:

```javascript
// Lock hierarchy
const lockHierarchy = async (req, res) => {
    const { coachId } = req.body;
    
    const coach = await User.findById(coachId);
    coach.hierarchyLocked = true;
    coach.hierarchyLockedAt = new Date();
    await coach.save();
};
```

### 4. Admin Request System

Coaches can submit requests for hierarchy changes that require admin approval:

```javascript
// Submit admin request
const adminRequest = new AdminRequest({
    requestId: `REQ_${Date.now()}_${randomString}`,
    coachId: coachId,
    requestType: 'level_change',      // level_change, sponsor_change, team_rank_change
    requestedData: {
        currentLevel: 3,
        reason: 'Performance-based promotion'
    },
    reason: 'Detailed explanation',
    supportingDocuments: ['document1.pdf', 'document2.pdf'],
    status: 'pending'
});
```

### 5. Commission Calculation System

The system supports multiple commission calculation types:

#### Subscription Commission
```javascript
// Calculate commission for subscription
const commissionAmount = subscriptionAmount * commissionPercentage;
const commission = new Commission({
    commissionId: `COM_${Date.now()}_${randomString}`,
    coachId: referredBy,
    subscriptionId: subscriptionId,
    subscriptionAmount: subscriptionAmount,
    commissionPercentage: settings.commissionPercentage,
    commissionAmount: commissionAmount,
    status: 'pending'
});
```

#### Level-Based Commission
```javascript
// Different commission rates for different subscription types
switch (subscriptionType) {
    case 'monthly':
        commissionPercentage = 0.10; // 10%
        break;
    case 'yearly':
        commissionPercentage = 0.15; // 15%
        break;
    case 'lifetime':
        commissionPercentage = 0.20; // 20%
        break;
}

// Apply level-based multiplier
const levelMultiplier = settings.levelMultipliers[coach.currentLevel] || 1.0;
commissionPercentage *= levelMultiplier;
```

### 6. Team Performance Analytics

Comprehensive team performance tracking with multiple metrics:

```javascript
// Team performance summary
const teamSummary = {
    teamSize: downline.length,
    totalLeads: 0,
    totalSales: 0,
    totalRevenue: 0,
    averageConversionRate: 0,
    topPerformers: [],
    underPerformers: [],
    memberDetails: []
};

// Individual member metrics
const memberDetail = {
    coachId: member._id,
    name: member.name,
    email: member.email,
    leads: {
        total: leads.totalLeads,
        qualified: leads.qualifiedLeads,
        converted: leads.convertedLeads,
        conversionRate: conversionRate
    },
    sales: {
        total: sales.totalSales,
        revenue: sales.totalRevenue,
        averageDealSize: sales.averageDealSize
    },
    tasks: {
        total: tasks.totalTasks,
        completed: tasks.completedTasks,
        completionRate: taskCompletionRate
    },
    performance: {
        level: performance.performanceRating.level,
        score: performance.performanceRating.score,
        isActive: performance.isActive,
        lastActivity: performance.lastActivity
    }
};
```

### 7. Report Generation System

Asynchronous report generation with multiple report types:

```javascript
// Generate comprehensive team report
const report = new CoachReport({
    reportId: `REP_${Date.now()}_${randomString}`,
    generatedBy: sponsorId,
    reportType: 'team_performance',   // team_performance, commission_summary, etc.
    reportPeriod: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        period: 'monthly'
    },
    config: {
        includePerformance: true,
        includeCommissions: true,
        includeLeads: true
    },
    status: 'generating'
});
```

## Usage Examples

### Setting Up Hierarchy Levels

```javascript
// Setup default hierarchy (Admin only)
const response = await fetch('/api/advanced-mlm/setup-hierarchy', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${adminToken}`
    }
});

// Get hierarchy levels
const levelsResponse = await fetch('/api/advanced-mlm/hierarchy-levels');
const levels = await levelsResponse.json();
```

### Creating a Coach with Hierarchy

```javascript
// Generate coach ID
const coachIdResponse = await fetch('/api/advanced-mlm/generate-coach-id', {
    method: 'POST'
});
const { coachId } = await coachIdResponse.json();

// Create coach with hierarchy
const coachData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123',
    role: 'coach',
    selfCoachId: coachId,
    currentLevel: 1,
    sponsorId: 'sponsorId123',
    hierarchyLocked: false
};

const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(coachData)
});
```

### Searching for Sponsors

```javascript
// Search for sponsors
const searchResponse = await fetch('/api/advanced-mlm/search-sponsor?query=john');
const sponsors = await searchResponse.json();

// Create external sponsor
const externalSponsorData = {
    name: 'External Company',
    phone: '+1234567890',
    email: 'contact@external.com',
    company: 'External Corp',
    notes: 'External sponsor for MLM system'
};

const sponsorResponse = await fetch('/api/advanced-mlm/external-sponsor', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(externalSponsorData)
});
```

### Managing Commissions

```javascript
// Update commission settings (Admin)
const settingsData = {
    commissionPercentage: 15,
    minimumSubscriptionAmount: 50,
    maximumCommissionAmount: 1000,
    notes: 'Updated commission structure'
};

const settingsResponse = await fetch('/api/advanced-mlm/admin/commission-settings', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(settingsData)
});

// Calculate commission
const commissionData = {
    subscriptionId: 'subscriptionId123',
    referredBy: 'coachId456'
};

const commissionResponse = await fetch('/api/advanced-mlm/admin/calculate-commission', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(commissionData)
});

// Get coach commissions
const commissionsResponse = await fetch('/api/advanced-mlm/commissions/coachId123?status=pending&month=12&year=2024');
const commissions = await commissionsResponse.json();
```

### Team Management

```javascript
// Add coach to downline
const downlineData = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'securePassword123',
    sponsorId: 'sponsorId123'
};

const downlineResponse = await fetch('/api/advanced-mlm/downline', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${coachToken}`
    },
    body: JSON.stringify(downlineData)
});

// Get team performance
const performanceResponse = await fetch('/api/advanced-mlm/team-performance/sponsorId123?period=monthly&includePerformance=true');
const performance = await performanceResponse.json();

// Generate team report
const reportData = {
    sponsorId: 'sponsorId123',
    reportType: 'team_performance',
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    config: {
        includePerformance: true,
        includeCommissions: true
    }
};

const reportResponse = await fetch('/api/advanced-mlm/generate-report', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${coachToken}`
    },
    body: JSON.stringify(reportData)
});
```

## System Integration

### Payment System Integration

The MLM system integrates with the payment system for commission calculations:

```javascript
// Commission calculation in payment processing
case 'mlm_commission':
    if (mlmLevel && this.settings.commission.mlmLevels[mlmLevel - 1]) {
        mlmCommissionPercentage = this.settings.commission.mlmLevels[mlmLevel - 1].percentage;
        commissionAmount = (grossAmount * mlmCommissionPercentage) / 100;
    }
    break;
```

### User Management Integration

Coaches are managed through the User model with role discrimination:

```javascript
// Coach user structure
{
    name: String,
    email: String,
    password: String,
    role: 'coach',
    selfCoachId: String,             // Unique coach ID
    currentLevel: Number,            // 1-12 hierarchy level
    sponsorId: ObjectId,              // Digital sponsor reference
    externalSponsorId: ObjectId,     // External sponsor reference
    hierarchyLocked: Boolean,        // Hierarchy lock status
    hierarchyLockedAt: Date,          // When hierarchy was locked
    isActive: Boolean,                // Coach status
    isVerified: Boolean              // Email verification status
}
```

### Performance Tracking Integration

The system tracks coach performance for analytics:

```javascript
// Performance tracking
const performanceRecord = new CoachPerformance({
    coachId: newCoach._id,
    sponsorId: sponsorId,
    performanceRating: {
        level: 1,
        score: 0
    },
    isActive: true,
    lastActivity: new Date(),
    activityStreak: 0
});
```

## Best Practices

### 1. Hierarchy Management

- **Lock hierarchies** after first login to prevent unauthorized changes
- **Use admin requests** for any hierarchy modifications
- **Validate coach IDs** for uniqueness before assignment
- **Track hierarchy changes** with audit logs

### 2. Commission Management

- **Set appropriate commission rates** based on business model
- **Use level multipliers** to incentivize higher performance
- **Implement minimum amounts** to ensure commission viability
- **Process commissions monthly** for consistent cash flow

### 3. Team Performance

- **Monitor team metrics** regularly for insights
- **Identify top performers** for recognition and rewards
- **Support underperformers** with training and guidance
- **Generate reports** for strategic decision-making

### 4. Security & Compliance

- **Validate all inputs** to prevent injection attacks
- **Implement proper authentication** for all admin functions
- **Audit all changes** for compliance and transparency
- **Backup commission data** regularly

## Future Enhancements

### Planned Features

1. **Advanced Analytics Dashboard** with real-time metrics
2. **Mobile App Integration** for on-the-go management
3. **Automated Commission Processing** with payment gateway integration
4. **Advanced Reporting** with custom report builder
5. **Team Communication Tools** for better collaboration
6. **Performance Gamification** with badges and rewards
7. **Multi-language Support** for international expansion
8. **API Rate Limiting** for system stability

### Technical Improvements

1. **Database Optimization** for large-scale operations
2. **Caching Layer** for improved performance
3. **Real-time Notifications** for important events
4. **Advanced Security** with multi-factor authentication
5. **Scalability Improvements** for growing user base

## Support & Troubleshooting

### Common Issues

1. **Hierarchy Setup Failures**: Check database connection and admin permissions
2. **Commission Calculation Errors**: Verify commission settings and subscription data
3. **Coach ID Conflicts**: Ensure uniqueness validation is working
4. **Performance Issues**: Monitor database indexes and query optimization

### Debug Information

Enable debug logging:
```bash
DEBUG=mlm:*
NODE_ENV=development
```

### System Testing

Run the MLM system test:
```bash
node misc/testAdvancedMlm.js
```

This will validate:
- Hierarchy levels setup
- Commission settings configuration
- Coach data integrity
- External sponsor management
- Coach ID generation
- Database indexes

### Contact Information

For technical support or feature requests, contact the development team or create an issue in the project repository.

---

*Last Updated: January 2024*
*Version: 1.0.0*
