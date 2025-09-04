# Workflow & Staff Management System Documentation

## Overview

The Workflow & Staff Management System is a comprehensive platform that combines task management, staff administration, performance tracking, and automated workflow orchestration. The system provides coaches with powerful tools to manage their team, track performance, and automate business processes through intelligent task assignment and workflow management.

## Current Status

### ✅ Implemented Features

#### Workflow Management
1. **Complete Task Management** with Kanban board interface
2. **Intelligent Task Assignment** based on workload and skills
3. **Workflow Stages** (Lead Generation → Qualification → Proposal → Closing → Onboarding)
4. **Task Dependencies** and subtask management
5. **Time Tracking** and logging capabilities
6. **Automated SOP Generation** using AI
7. **Bulk Operations** for task management
8. **Analytics & Reporting** for workflow optimization

#### Staff Management
1. **Complete Staff CRUD Operations** with role-based permissions
2. **Performance Tracking** with comprehensive metrics
3. **Staff Calendar Management** with availability tracking
4. **Staff Dashboard** with real-time insights
5. **Leaderboard System** for gamification
6. **Bulk Staff Actions** for efficient management
7. **Permission System** with granular controls
8. **Performance Analytics** and trend analysis

### 🔄 Active Components

- **Controllers**: `workflowTaskController.js`, `staffController.js`, `staffCalendarController.js`, `staffDashboardController.js`
- **Services**: `workflowTaskService.js`, `staffPerformanceService.js`, `staffDashboardService.js`, `staffLeaderboardService.js`
- **Schemas**: `Task.js`, `Staff.js`, `StaffCalendar.js`
- **Routes**: `workflowRoutes.js`, `staffRoutes.js`, `staffCalendarRoutes.js`

## Workflow Management System

### Core Architecture

The workflow system is built around a **5-stage pipeline** that follows the typical sales process:

1. **LEAD_GENERATION** - Initial lead capture and qualification
2. **LEAD_QUALIFICATION** - Detailed needs assessment and budget discussion
3. **PROPOSAL** - Solution presentation and objection handling
4. **CLOSING** - Final agreement and contract signing
5. **ONBOARDING** - Client setup and first session

### Task Schema Structure

```javascript
{
  name: String,                    // Required
  description: String,            // Optional
  status: String,                 // Pending, In Progress, Completed, Overdue, Cancelled
  priority: String,               // LOW, MEDIUM, HIGH, URGENT
  stage: String,                  // Workflow stage enum
  dueDate: Date,                  // Required
  assignedTo: ObjectId,           // Reference to Staff/Coach
  relatedLead: ObjectId,          // Reference to Lead
  coachId: ObjectId,              // Reference to Coach
  estimatedHours: Number,         // Default: 1
  actualHours: Number,            // Default: 0
  tags: [String],                 // Custom tags
  attachments: [{                 // File attachments
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  comments: [{                    // Task comments
    user: ObjectId,
    content: String,
    createdAt: Date
  }],
  dependencies: [ObjectId],        // Task dependencies
  subtasks: [{                    // Subtasks
    name: String,
    description: String,
    completed: Boolean,
    dueDate: Date
  }],
  timeLogs: [{                    // Time tracking
    user: ObjectId,
    startTime: Date,
    endTime: Date,
    duration: Number,
    description: String
  }],
  reminders: [{                   // Reminders
    time: Date,
    type: String,                 // email, push
    sent: Boolean
  }],
  automationRules: [{             // Automation triggers
    trigger: String,
    action: String,
    config: Mixed
  }]
}
```

### API Routes

#### Base URL: `/api/workflow`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/kanban-board` | Get Kanban board data | Required |
| `POST` | `/tasks` | Create new task with intelligent assignment | Required |
| `GET` | `/tasks` | Get all tasks with filtering | Required |
| `GET` | `/tasks/:id` | Get single task details | Required |
| `PUT` | `/tasks/:id` | Update task | Required |
| `DELETE` | `/tasks/:id` | Delete task | Required |
| `PUT` | `/tasks/:taskId/move` | Move task between stages (Kanban) | Required |
| `POST` | `/tasks/:id/comments` | Add comment to task | Required |
| `POST` | `/tasks/:id/time-log` | Log time to task | Required |
| `POST` | `/tasks/:id/subtasks` | Add subtask | Required |
| `GET` | `/tasks/:id/dependencies` | Get task dependencies | Required |
| `POST` | `/tasks/:id/dependencies` | Add task dependency | Required |
| `DELETE` | `/tasks/:id/dependencies/:dependencyId` | Remove task dependency | Required |
| `GET` | `/analytics` | Get task analytics | Required |
| `POST` | `/auto-assign` | Auto-assign unassigned tasks | Required |
| `GET` | `/upcoming-tasks` | Get upcoming tasks | Required |
| `PUT` | `/bulk-update-status` | Bulk update task status | Required |
| `POST` | `/generate-sop` | Generate SOP for task type | Required |
| `GET` | `/overdue-tasks` | Get overdue tasks | Required |
| `GET` | `/tasks/stage/:stage` | Get tasks by stage | Required |
| `POST` | `/tasks/from-lead/:leadId` | Create task from lead | Required |

### Intelligent Task Assignment

The system uses a sophisticated algorithm to automatically assign tasks based on:

1. **Workload Balance** - Distributes tasks evenly across team members
2. **Skill Matching** - Assigns tasks to staff with relevant skills
3. **Permission Validation** - Ensures staff have required permissions
4. **Performance History** - Considers past performance for optimal assignment
5. **Availability** - Checks staff calendar for availability

```javascript
// Example of intelligent assignment logic
async intelligentTaskAssignment(coachId, taskData) {
    const staffMembers = await Staff.find({ coachId, isActive: true });
    
    // Calculate workload for each staff member
    const workloadData = await Promise.all(
        staffMembers.map(async (staff) => {
            const pendingTasks = await Task.countDocuments({
                assignedTo: staff._id,
                status: { $in: ['Pending', 'In Progress'] }
            });
            const overdueTasks = await Task.countDocuments({
                assignedTo: staff._id,
                status: 'Overdue'
            });
            
            const workloadScore = pendingTasks + (overdueTasks * 2);
            
            return {
                staffId: staff._id,
                workloadScore,
                permissions: staff.permissions,
                skills: staff.skills || []
            };
        })
    );
    
    // Sort by workload and find suitable staff
    workloadData.sort((a, b) => a.workloadScore - b.workloadScore);
    
    const suitableStaff = workloadData.find(staff => {
        const hasPermission = staff.permissions.includes('tasks:manage');
        const hasSkills = this.checkTaskSkills(staff.skills, taskData);
        return hasPermission && hasSkills;
    });
    
    return suitableStaff ? suitableStaff.staffId : workloadData[0].staffId;
}
```

### Kanban Board Implementation

The Kanban board provides a visual workflow management interface:

```javascript
// Kanban board data structure
{
  stages: {
    LEAD_GENERATION: {
      name: 'Lead Generation',
      color: '#3498db',
      tasks: [/* task objects */],
      count: 15
    },
    LEAD_QUALIFICATION: {
      name: 'Lead Qualification',
      color: '#f39c12',
      tasks: [/* task objects */],
      count: 8
    },
    PROPOSAL: {
      name: 'Proposal',
      color: '#e74c3c',
      tasks: [/* task objects */],
      count: 5
    },
    CLOSING: {
      name: 'Closing',
      color: '#27ae60',
      tasks: [/* task objects */],
      count: 3
    },
    ONBOARDING: {
      name: 'Onboarding',
      color: '#9b59b6',
      tasks: [/* task objects */],
      count: 2
    }
  },
  analytics: {
    totalTasks: 33,
    completedToday: 5,
    overdueTasks: 2,
    averageCompletionTime: 3.2
  }
}
```

### Automation Features

#### SOP Generation
The system can automatically generate Standard Operating Procedures using AI:

```javascript
// Example SOP generation
const sop = await workflowTaskService.generateSOP('Lead Follow-up', {
  businessType: 'Fitness Coaching',
  targetAudience: 'Busy professionals',
                  communicationChannel: 'Email' // WhatsApp functionality moved to dustbin/whatsapp-dump/
});

// Generated SOP structure
{
  title: 'Lead Follow-up SOP',
  steps: [
    {
      step: 1,
      action: 'Send welcome message within 5 minutes',
      template: 'Hi {{lead.name}}! Thanks for your interest...',
      timing: 'Immediate'
    },
    {
      step: 2,
      action: 'Schedule follow-up call',
      template: 'Let\'s schedule a quick 15-minute call...',
      timing: 'Within 24 hours'
    }
  ],
  bestPractices: [
    'Always personalize messages',
    'Follow up within 24 hours',
    'Track all interactions'
  ]
}
```

#### Task Dependencies
Tasks can have dependencies to ensure proper workflow sequence:

```javascript
// Example task dependency
{
  taskId: 'task123',
  dependencies: ['task456', 'task789'],
  dependencyTypes: {
    'task456': 'blocks',      // Must complete before this task
    'task789': 'requires'     // Requires this task to be started
  }
}
```

## Staff Management System

### Staff Schema Structure

```javascript
{
  // Inherits from User schema
  name: String,                    // Required
  email: String,                   // Required, unique
  password: String,                // Required, hashed
  role: String,                    // 'staff'
  
  // Staff-specific fields
  coachId: ObjectId,               // Reference to owning coach
  permissions: [String],           // Array of permission strings
  isActive: Boolean,               // Default: true
  isVerified: Boolean,            // Email verification status
  
  // Performance tracking
  performance: {
    overallScore: Number,          // 0-100
    taskCompletionRate: Number,   // Percentage
    leadConversionRate: Number,    // Percentage
    averageResponseTime: Number,   // Minutes
    lastActivity: Date
  },
  
  // Skills and capabilities
  skills: [String],               // e.g., ['sales', 'coaching', 'admin']
  specializations: [String],      // e.g., ['fitness', 'nutrition']
  
  // Work preferences
  workSchedule: {
    startTime: String,             // '09:00'
    endTime: String,               // '17:00'
    timezone: String,              // 'UTC'
    workingDays: [Number]          // [1,2,3,4,5] for Mon-Fri
  }
}
```

### Permission System

The system implements a granular permission system:

```javascript
// Available permissions
const PERMISSIONS = {
  // Lead management
  'leads:read': 'View leads',
  'leads:create': 'Create new leads',
  'leads:update': 'Update lead information',
  'leads:delete': 'Delete leads',
  'leads:assign': 'Assign leads to staff',
  
  // Task management
  'tasks:read': 'View tasks',
  'tasks:create': 'Create new tasks',
  'tasks:update': 'Update task information',
  'tasks:delete': 'Delete tasks',
  'tasks:assign': 'Assign tasks to staff',
  
  // Calendar management
  'calendar:read': 'View calendar',
  'calendar:create': 'Create calendar events',
  'calendar:update': 'Update calendar events',
  'calendar:delete': 'Delete calendar events',
  
  // Staff management
  'staff:read': 'View staff information',
  'staff:create': 'Create new staff members',
  'staff:update': 'Update staff information',
  'staff:delete': 'Delete staff members',
  
  // Analytics and reporting
  'analytics:read': 'View analytics and reports',
  'analytics:export': 'Export reports',
  
  // System administration
  'settings:read': 'View system settings',
  'settings:update': 'Update system settings'
};
```

### API Routes

#### Base URL: `/api/staff`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/` | Create a new staff member | Required |
| `GET` | `/` | List all staff members | Required |
| `GET` | `/:id` | Get specific staff details | Required |
| `PUT` | `/:id` | Update staff information | Required |
| `DELETE` | `/:id` | Deactivate staff (soft delete) | Required |
| `POST` | `/:id/permissions` | Update staff permissions | Required |
| `POST` | `/:id/activate` | Activate staff account | Required |
| `GET` | `/:id/performance` | Get staff performance metrics | Required |
| `GET` | `/performance/comparison` | Compare staff performance | Required |
| `GET` | `/:id/performance/trends` | Get performance trends | Required |
| `POST` | `/bulk-actions` | Perform bulk actions on staff | Required |

### Performance Tracking

The system tracks comprehensive performance metrics:

```javascript
// Performance metrics structure
{
  staffId: ObjectId,
  staffName: String,
  period: {
    start: Date,
    end: Date
  },
  overallScore: 85.5,              // 0-100
  
  // Task performance
  taskMetrics: {
    totalTasks: 45,
    completedTasks: 38,
    inProgressTasks: 5,
    overdueTasks: 2,
    onTimeCompletion: 35,
    completionRate: 84.4,            // Percentage
    onTimeRate: 92.1               // Percentage
  },
  
  // Lead management
  leadMetrics: {
    totalLeads: 120,
    managedLeads: 95,
    convertedLeads: 28,
    qualifiedLeads: 45,
    managementRate: 79.2,          // Percentage
    conversionRate: 29.5,           // Percentage
    qualificationRate: 47.4        // Percentage
  },
  
  // Calendar/availability
  calendarMetrics: {
    totalScheduledHours: 160,
    actualWorkedHours: 152,
    availabilityPercentage: 95.0,   // Percentage
    meetingAttendance: 98.5        // Percentage
  },
  
  // Response time
  responseMetrics: {
    averageResponseTime: 45,        // Minutes
    responseRate: 96.8,             // Percentage
    escalationRate: 3.2            // Percentage
  }
}
```

### Staff Dashboard

The staff dashboard provides real-time insights and quick actions:

```javascript
// Dashboard data structure
{
  overview: {
    totalTasks: 45,
    completedTasks: 38,
    pendingTasks: 5,
    overdueTasks: 2,
    totalLeads: 120,
    convertedLeads: 28,
    conversionRate: 23.3,
    performanceScore: 85.5,
    trends: {
      taskCompletion: '+12%',
      leadConversion: '+8%',
      responseTime: '-15%'
    }
  },
  
  tasks: {
    today: [/* today's tasks */],
    upcoming: [/* upcoming tasks */],
    overdue: [/* overdue tasks */],
    recent: [/* recently completed */]
  },
  
  performance: {
    currentScore: 85.5,
    targetScore: 90.0,
    progress: 85.5,
    achievements: [/* recent achievements */],
    areas: [/* areas for improvement */]
  },
  
  achievements: {
    badges: [/* earned badges */],
    milestones: [/* reached milestones */],
    rewards: [/* earned rewards */],
    streak: 15                    // Days
  },
  
  team: {
    leaderboard: [/* team ranking */],
    collaboration: [/* team activities */],
    support: [/* support requests */]
  },
  
  quickActions: [
    { name: 'View Tasks', action: 'view_tasks', icon: '📋' },
    { name: 'Add Time Log', action: 'add_time_log', icon: '⏱️' },
    { name: 'Update Progress', action: 'update_progress', icon: '📈' },
    { name: 'Request Help', action: 'request_help', icon: '🆘' }
  ]
}
```

### Staff Calendar Management

The calendar system manages staff availability and scheduling:

```javascript
// Calendar event structure
{
  staffId: ObjectId,
  coachId: ObjectId,
  eventType: String,               // task, meeting, break, unavailable, custom
  title: String,                   // Required
  description: String,
  startTime: Date,                 // Required
  endTime: Date,                   // Required
  duration: Number,                 // Minutes (auto-calculated)
  status: String,                   // scheduled, in_progress, completed, cancelled, rescheduled
  priority: String,                // low, medium, high, urgent
  isRecurring: Boolean,             // Default: false
  recurrencePattern: {
    frequency: String,              // daily, weekly, monthly, yearly
    interval: Number,               // Default: 1
    endDate: Date,
    daysOfWeek: [Number],          // 0-6 for Sunday-Saturday
    dayOfMonth: Number
  },
  relatedTask: ObjectId,           // Reference to Task
  relatedLead: ObjectId,           // Reference to Lead
  location: String,
  attendees: [{
    userId: ObjectId,
    name: String,
    email: String,
    role: String
  }],
  notes: String,
  tags: [String],
  color: String,                   // Default: '#3788d8'
  isPublic: Boolean,               // Default: false
  reminder: {
    enabled: Boolean,               // Default: true
    time: Number,                   // Minutes before event
    sent: Boolean                   // Default: false
  }
}
```

### Leaderboard System

The leaderboard system provides gamification and motivation:

```javascript
// Leaderboard structure
{
  period: 'monthly',               // daily, weekly, monthly, yearly
  rankings: [
    {
      rank: 1,
      staffId: ObjectId,
      staffName: String,
      score: 95.5,
      metrics: {
        tasksCompleted: 45,
        leadsConverted: 12,
        responseTime: 30,
        availability: 98.5
      },
      achievements: [/* earned achievements */],
      trend: '+5.2'                // Score change
    }
  ],
  categories: {
    'Task Master': [/* top task performers */],
    'Lead Converter': [/* top lead converters */],
    'Speed Demon': [/* fastest responders */],
    'Team Player': [/* best collaborators */]
  },
  achievements: [/* available achievements */],
  rewards: [/* available rewards */]
}
```

## Integration Features

### Workflow-Staff Integration

1. **Automatic Task Assignment**: Tasks are automatically assigned to suitable staff members
2. **Performance-Based Routing**: High-priority tasks routed to top performers
3. **Workload Balancing**: Distributes tasks evenly across team
4. **Skill Matching**: Assigns tasks based on staff skills and specializations

### Calendar-Workflow Integration

1. **Task Scheduling**: Automatically schedules tasks based on staff availability
2. **Meeting Integration**: Creates calendar events for task-related meetings
3. **Time Tracking**: Logs time spent on tasks to calendar
4. **Conflict Resolution**: Prevents scheduling conflicts

### Analytics Integration

1. **Real-time Metrics**: Live performance tracking
2. **Trend Analysis**: Historical performance trends
3. **Predictive Analytics**: Forecasts future performance
4. **Comparative Analysis**: Staff performance comparisons

## Usage Examples

### Creating a Task with Intelligent Assignment

```javascript
// Create a new task
const taskData = {
  name: 'Follow up with John Doe',
  description: 'Call to discuss fitness goals and program options',
  dueDate: '2024-01-25T10:00:00Z',
  relatedLead: 'leadId123',
  priority: 'HIGH',
  stage: 'LEAD_QUALIFICATION',
  estimatedHours: 1,
  tags: ['follow-up', 'sales', 'fitness']
};

const response = await fetch('/api/workflow/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(taskData)
});

// Task will be automatically assigned to the most suitable staff member
```

### Moving Tasks on Kanban Board

```javascript
// Move task to next stage
const moveResponse = await fetch('/api/workflow/tasks/taskId123/move', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    newStage: 'PROPOSAL'
  })
});
```

### Creating Staff Member

```javascript
// Create new staff member
const staffData = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  password: 'securePassword123',
  permissions: ['leads:read', 'leads:update', 'tasks:read', 'tasks:update'],
  skills: ['sales', 'coaching', 'fitness'],
  specializations: ['weight-loss', 'muscle-gain']
};

const response = await fetch('/api/staff', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(staffData)
});
```

### Getting Staff Performance

```javascript
// Get staff performance metrics
const performanceResponse = await fetch('/api/staff/staffId123/performance?startDate=2024-01-01&endDate=2024-01-31&includeDetails=true', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const performance = await performanceResponse.json();
console.log('Staff Performance:', performance.data);
```

## Best Practices

### Workflow Management

1. **Stage Progression**: Ensure tasks move through all stages systematically
2. **Dependency Management**: Set up proper task dependencies to avoid bottlenecks
3. **Time Tracking**: Encourage regular time logging for accurate analytics
4. **Communication**: Use task comments for team collaboration
5. **Automation**: Leverage SOP generation for consistent processes

### Staff Management

1. **Permission Assignment**: Grant minimal required permissions
2. **Performance Monitoring**: Regularly review performance metrics
3. **Skill Development**: Track and develop staff skills
4. **Workload Balance**: Monitor and adjust workload distribution
5. **Recognition**: Use leaderboard and achievements for motivation

### Calendar Management

1. **Availability Updates**: Keep availability calendar current
2. **Meeting Scheduling**: Use calendar for all team meetings
3. **Time Blocking**: Block time for focused work
4. **Conflict Resolution**: Address scheduling conflicts promptly

## Future Enhancements

### Planned Features

1. **Advanced AI Integration**: Machine learning for task assignment optimization
2. **Mobile App**: Native mobile applications for staff and coaches
3. **Advanced Analytics**: Predictive analytics and forecasting
4. **Integration APIs**: Third-party system integrations
5. **Advanced Automation**: Complex workflow automation rules
6. **Real-time Collaboration**: Live collaboration features
7. **Advanced Reporting**: Custom report builder
8. **Multi-language Support**: Internationalization

### Technical Improvements

1. **Performance Optimization**: Database query optimization
2. **Real-time Updates**: WebSocket integration for live updates
3. **Advanced Security**: Enhanced security features
4. **Scalability**: Horizontal scaling capabilities
5. **API Versioning**: Proper API versioning strategy

## Support & Troubleshooting

### Common Issues

1. **Task Assignment Failures**: Check staff permissions and availability
2. **Performance Calculation Errors**: Verify data integrity
3. **Calendar Conflicts**: Review overlapping events
4. **Permission Issues**: Validate permission assignments

### Debug Information

Enable debug logging:
```bash
DEBUG=workflow:*,staff:*
NODE_ENV=development
```

### Contact Information

For technical support or feature requests, contact the development team or create an issue in the project repository.

---

*Last Updated: January 2024*
*Version: 1.0.0*
