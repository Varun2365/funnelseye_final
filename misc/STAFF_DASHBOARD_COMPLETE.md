# Staff Dashboard Complete API Documentation

## 🎨 UI Design Prompt for Chakra UI Implementation

**For the AI implementing the React UI with Chakra UI:**

You are a professional minimal and elegant React UI designer with extensive experience in creating beautifully animated React pages. Your task is to create an optimized, error-free staff dashboard interface using Chakra UI components.

### Design Standards & Guidelines:

**Typography & Spacing:**
- **Font Sizes**: Use these standardized values:
  - Headers: `2xl` (24px), `xl` (20px), `lg` (18px)
  - Body text: `md` (16px), `sm` (14px)
  - Small text: `xs` (12px)
- **Line Heights**: `1.5` for body text, `1.2` for headers
- **Font Weights**: `600` for headers, `400` for body, `500` for emphasis

**Spacing & Padding:**
- **Container Padding**: `6` (24px) for main containers, `4` (16px) for cards
- **Component Spacing**: `4` (16px) between major sections, `2` (8px) between related items
- **Card Padding**: `6` (24px) for large cards, `4` (16px) for compact cards
- **Button Padding**: `3` (12px) vertical, `6` (24px) horizontal for primary buttons

**Button Standards:**
- **Primary Buttons**: `colorScheme="blue"`, `size="md"`, `fontWeight="500"`
- **Secondary Buttons**: `variant="outline"`, `colorScheme="gray"`, `size="md"`
- **Small Buttons**: `size="sm"` for actions, `size="xs"` for icons
- **Button Spacing**: `2` (8px) between button groups

**Color Palette:**
- **Primary**: Blue (`blue.500`, `blue.600`, `blue.700`)
- **Success**: Green (`green.500`, `green.600`)
- **Warning**: Orange (`orange.500`, `orange.600`)
- **Error**: Red (`red.500`, `red.600`)
- **Neutral**: Gray (`gray.50`, `gray.100`, `gray.200`, `gray.500`, `gray.700`, `gray.900`)

**Layout Principles:**
- **Grid System**: Use `Grid` with `templateColumns` for responsive layouts
- **Card Design**: Subtle shadows (`shadow="sm"`), rounded corners (`borderRadius="md"`)
- **Responsive**: Mobile-first approach with `breakpoints={{ base: "1", md: "2", lg: "3" }}`
- **Animation**: Subtle transitions (`transition="all 0.2s"`) for hover states and loading

**Component Guidelines:**
- **Tables**: Use `Table` with `variant="simple"` and `size="sm"`
- **Forms**: Consistent `FormControl` spacing with `mb={4}`
- **Modals**: `size="lg"` for forms, `size="md"` for confirmations
- **Loading States**: Use `Spinner` with `size="md"` and appropriate colors
- **Icons**: Consistent sizing with `boxSize={4}` for small, `boxSize={6}` for medium

**Performance Optimization:**
- Use `React.memo()` for expensive components
- Implement proper loading states with `Skeleton` components
- Use `useCallback` and `useMemo` for expensive operations
- Implement virtual scrolling for large lists

**Accessibility:**
- Ensure proper `aria-label` attributes
- Use semantic HTML elements
- Implement keyboard navigation
- Maintain proper color contrast ratios

Create a clean, professional interface that feels modern and intuitive. Focus on usability, consistency, and subtle animations that enhance the user experience without being distracting.

---

## 📋 Question Response Submission Endpoint

**For Appointment Booking Forms (No Authentication Required):**

### Submit Question Responses
- **Endpoint**: `POST /api/leads/question-responses`
- **Purpose**: Submit question responses during appointment booking without requiring authentication tokens
- **Security**: Public endpoint for appointment booking forms
- **Use Case**: Allows leads to answer qualification questions during appointment booking process

**Request Body:**
```json
{
  "leadId": "507f1f77bcf86cd799439011",
  "questionResponses": {
    "clientQuestions": {
      "watchedVideo": "Yes",
      "readyToStart": "Yes",
      "willingToInvest": "Yes",
      "seriousnessScale": 9,
      "currentChallenges": "Weight loss and energy levels",
      "motivation": "Health and confidence"
    },
    "coachQuestions": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "whatsappNumber": "+1234567890",
      "instagramUsername": "@johndoe",
      "description": "Business owner",
      "watchedVideo": "Yes, 100%",
      "reasonForBooking": "Want to start coaching business",
      "supplements": "Currently taking multivitamins",
      "mlmExperience": "None",
      "readiness": "100% ready",
      "commitment": "Yes, fully committed",
      "timeCommitment": "3-4 hours/day",
      "canAttendZoom": "Yes",
      "understandsOpportunity": "Yes",
      "additionalInfo": "Ready to start immediately"
    }
  },
  "appointmentData": {
    "preferredTime": "14:00",
    "preferredDate": "2024-01-20",
    "timezone": "America/New_York",
    "notes": "Prefer afternoon appointments"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Question responses submitted successfully",
  "data": {
    "leadId": "507f1f77bcf86cd799439011",
    "score": 85,
    "insights": [
      "Watched full video - high engagement",
      "Ready to start within 7 days - high urgency",
      "Willing to invest - high conversion potential",
      "High seriousness level - strong commitment"
    ],
    "status": "Qualified"
  }
}
```

**Features:**
- ✅ **No Authentication Required**: Perfect for public appointment booking forms
- ✅ **Automatic Scoring**: Recalculates lead score based on responses
- ✅ **Status Update**: Updates lead status to "Qualified" when questions are answered
- ✅ **Event Publishing**: Publishes events for automation workflows
- ✅ **Validation**: Validates lead ID and question responses
- ✅ **Flexible**: Supports both client and coach question types

---

## Overview

The Unified Staff Dashboard API provides a comprehensive set of endpoints for staff members to manage their tasks, calendar, appointments, performance tracking, and team collaboration. This API consolidates all staff-related functionality into a single, maintainable system with proper authentication, authorization, and admin global settings awareness.

## Base URL
```
/api/staff-dashboard/unified
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Middleware Applied

- **Authentication**: `protect` - Ensures user is authenticated
- **Activity Tracking**: `updateLastActive` - Updates user's last active timestamp
- **Permission Population**: `populateStaffPermissions` - Populates staff permissions
- **Staff Validation**: `validateStaffAccess` - Validates staff account is active and checks global settings

## Global Settings Awareness

The API automatically checks:
- **Maintenance Mode**: Blocks access when system is under maintenance
- **Staff Deactivation**: Prevents access for deactivated staff accounts
- **System Timezone**: Uses configured timezone for date/time operations
- **Date/Time Formats**: Uses configured formats for data display

---

## 📊 Dashboard Overview

### Get Complete Dashboard Data
```http
GET /api/staff-dashboard/unified/data
```

**Description**: Get complete unified dashboard data with all sections

**Query Parameters**:
- `timeRange` (optional): Number of days to look back (default: 30)
- `sections` (optional): Comma-separated list of sections to include (default: all)
  - Available sections: `overview`, `tasks`, `performance`, `achievements`, `team`, `calendar`, `notifications`, `analytics`

**Response**:
```json
{
  "success": true,
  "data": {
    "metadata": {
      "staffId": "string",
      "coachId": "string",
      "timeRange": 30,
      "requestedSections": ["overview", "tasks", "performance"],
      "lastUpdated": "2024-01-15T10:30:00.000Z",
      "globalSettings": {
        "maintenanceMode": false,
        "maintenanceMessage": null,
        "systemTimezone": "UTC",
        "dateFormat": "MM/DD/YYYY",
        "timeFormat": "12h"
      }
    },
    "overview": {
      "metrics": {
        "totalTasks": 25,
        "completedTasks": 18,
        "pendingTasks": 5,
        "overdueTasks": 2,
        "taskCompletionRate": 72,
        "totalLeads": 12,
        "convertedLeads": 8,
        "conversionRate": 66.67,
        "currentScore": 85,
        "rank": 3
      },
      "quickActions": [
        {
          "name": "View Tasks",
          "action": "view_tasks",
          "icon": "📋",
          "route": "/tasks"
        }
      ]
    },
    "tasks": { /* task data */ },
    "performance": { /* performance data */ }
  }
}
```

### Get Overview Data
```http
GET /api/staff-dashboard/unified/overview
```

**Description**: Get overview data with key metrics

**Response**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalTasks": 25,
      "completedTasks": 18,
      "pendingTasks": 5,
      "overdueTasks": 2,
      "taskCompletionRate": 72,
      "totalLeads": 12,
      "convertedLeads": 8,
      "conversionRate": 66.67,
      "currentScore": 85,
      "rank": 3
    },
    "quickActions": [
      {
        "name": "View Tasks",
        "action": "view_tasks",
        "icon": "📋",
        "route": "/tasks"
      }
    ]
  }
}
```

### Get Notifications
```http
GET /api/staff-dashboard/unified/notifications
```

**Description**: Get staff notifications and alerts

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "overdue_tasks",
      "type": "warning",
      "title": "Overdue Tasks",
      "message": "You have 2 overdue task(s)",
      "action": "view_tasks",
      "priority": "HIGH",
      "count": 2,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 📋 Task Management

### Get All Tasks
```http
GET /api/staff-dashboard/unified/tasks
```

**Description**: Get all tasks assigned to staff member

**Query Parameters**:
- `status` (optional): Filter by task status (`Pending`, `In Progress`, `Completed`, `Overdue`)
- `priority` (optional): Filter by task priority (`URGENT`, `HIGH`, `MEDIUM`, `LOW`)
- `stage` (optional): Filter by task stage (`LEAD_GENERATION`, `LEAD_QUALIFICATION`, `PROPOSAL`, `CLOSING`, `ONBOARDING`)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of tasks per page (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "task_id",
        "name": "Follow up with lead",
        "description": "Call the lead to discuss their requirements",
        "status": "In Progress",
        "priority": "HIGH",
        "stage": "LEAD_QUALIFICATION",
        "dueDate": "2024-01-20T15:00:00.000Z",
        "estimatedHours": 2,
        "actualHours": null,
        "assignedTo": "staff_id",
        "relatedLead": {
          "_id": "lead_id",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890",
          "status": "Qualified"
        },
        "createdBy": {
          "_id": "coach_id",
          "name": "Coach Name",
          "email": "coach@example.com"
        },
        "comments": [],
        "timeLogs": [],
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "summary": {
      "total": 25,
      "pending": 5,
      "inProgress": 8,
      "completed": 10,
      "overdue": 2
    }
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}
```

### Get Personal Task Overview
```http
GET /api/staff-dashboard/unified/tasks/my-tasks
```

**Description**: Get staff's personal task overview

**Query Parameters**:
- `timeRange` (optional): Number of days to look back (default: 30)

**Response**:
```json
{
  "success": true,
  "data": {
    "tasks": [ /* array of tasks */ ],
    "summary": {
      "total": 25,
      "byStatus": {
        "pending": 5,
        "inProgress": 8,
        "completed": 10,
        "overdue": 2
      }
    },
    "recentTasks": [ /* last 10 tasks */ ],
    "upcomingDeadlines": [ /* next 5 upcoming tasks */ ]
  }
}
```

### Get Overdue Tasks
```http
GET /api/staff-dashboard/unified/tasks/overdue
```

**Description**: Get overdue tasks

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "task_id",
      "name": "Overdue Task",
      "dueDate": "2024-01-10T15:00:00.000Z",
      "status": "In Progress",
      "priority": "HIGH"
    }
  ]
}
```

### Get Upcoming Tasks
```http
GET /api/staff-dashboard/unified/tasks/upcoming
```

**Description**: Get upcoming tasks

**Query Parameters**:
- `days` (optional): Number of days ahead to look (default: 7)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "task_id",
      "name": "Upcoming Task",
      "dueDate": "2024-01-18T15:00:00.000Z",
      "status": "Pending",
      "priority": "MEDIUM"
    }
  ]
}
```

### Get Specific Task
```http
GET /api/staff-dashboard/unified/tasks/:id
```

**Description**: Get specific task details

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "task_id",
    "name": "Task Name",
    "description": "Task description",
    "status": "In Progress",
    "priority": "HIGH",
    "stage": "LEAD_QUALIFICATION",
    "dueDate": "2024-01-20T15:00:00.000Z",
    "estimatedHours": 2,
    "actualHours": null,
    "assignedTo": {
      "_id": "staff_id",
      "name": "Staff Name",
      "email": "staff@example.com"
    },
    "relatedLead": {
      "_id": "lead_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "Qualified"
    },
    "createdBy": {
      "_id": "coach_id",
      "name": "Coach Name",
      "email": "coach@example.com"
    },
    "comments": [],
    "timeLogs": [],
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Update Task Status
```http
PUT /api/staff-dashboard/unified/tasks/:id/status
```

**Description**: Update task status

**Request Body**:
```json
{
  "status": "Completed",
  "notes": "Task completed successfully"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "_id": "task_id",
    "status": "Completed",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Complete Task
```http
POST /api/staff-dashboard/unified/tasks/:id/complete
```

**Description**: Complete task with detailed completion data

**Request Body**:
```json
{
  "completionNotes": "Task completed successfully",
  "actualHours": 1.5,
  "outcome": "Lead qualified and interested",
  "qualityRating": 9,
  "feedback": "Great interaction with the lead"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Task completed successfully",
  "data": {
    "_id": "task_id",
    "status": "Completed",
    "completedAt": "2024-01-15T10:30:00.000Z",
    "actualHours": 1.5,
    "outcome": "Lead qualified and interested",
    "qualityRating": 9,
    "feedback": "Great interaction with the lead",
    "efficiency": 133.33,
    "performance": {
      "onTime": true,
      "efficiency": 133.33,
      "quality": 9
    }
  }
}
```

### Start Task
```http
POST /api/staff-dashboard/unified/tasks/:id/start
```

**Description**: Start working on task

**Response**:
```json
{
  "success": true,
  "message": "Task started successfully",
  "data": {
    "_id": "task_id",
    "status": "in_progress",
    "startedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Pause Task
```http
POST /api/staff-dashboard/unified/tasks/:id/pause
```

**Description**: Pause working on task

**Response**:
```json
{
  "success": true,
  "message": "Task paused successfully",
  "data": {
    "_id": "task_id",
    "status": "paused",
    "pausedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Add Task Comment
```http
POST /api/staff-dashboard/unified/tasks/:id/comments
```

**Description**: Add comment to task

**Request Body**:
```json
{
  "comment": "Working on this task, will complete by end of day"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "task_id",
    "comments": [
      {
        "user": "staff_id",
        "userName": "Staff Name",
        "comment": "Working on this task, will complete by end of day",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Log Time to Task
```http
POST /api/staff-dashboard/unified/tasks/:id/time-log
```

**Description**: Log time to task

**Request Body**:
```json
{
  "hours": 1.5,
  "description": "Initial research and preparation"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Time logged successfully",
  "data": {
    "_id": "task_id",
    "timeLogs": [
      {
        "user": "staff_id",
        "userName": "Staff Name",
        "hours": 1.5,
        "description": "Initial research and preparation",
        "loggedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "totalLoggedHours": 1.5
  }
}
```

### Bulk Update Tasks
```http
PUT /api/staff-dashboard/unified/tasks/bulk-update
```

**Description**: Bulk update tasks

**Request Body**:
```json
{
  "taskIds": ["task_id_1", "task_id_2", "task_id_3"],
  "updates": {
    "status": "In Progress",
    "priority": "HIGH"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "3 tasks updated successfully",
  "data": {
    "modifiedCount": 3,
    "matchedCount": 3
  }
}
```

---

## 📅 Calendar Management

### Get Calendar Events
```http
GET /api/staff-dashboard/unified/calendar
```

**Description**: Get calendar events

**Query Parameters**:
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `eventType` (optional): Filter by event type (`task`, `meeting`, `break`, `unavailable`, `custom`)
- `status` (optional): Filter by event status (`scheduled`, `in_progress`, `completed`, `cancelled`, `rescheduled`)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of events per page (default: 50)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "event_id",
      "staffId": "staff_id",
      "coachId": "coach_id",
      "eventType": "meeting",
      "title": "Team Meeting",
      "description": "Weekly team sync",
      "startTime": "2024-01-15T10:00:00.000Z",
      "endTime": "2024-01-15T11:00:00.000Z",
      "duration": 60,
      "status": "scheduled",
      "priority": "medium",
      "isRecurring": false,
      "location": "Conference Room A",
      "attendees": [
        {
          "userId": "staff_id",
          "name": "Staff Name",
          "email": "staff@example.com",
          "role": "staff"
        }
      ],
      "notes": "Bring project updates",
      "tags": ["meeting", "team"],
      "color": "#3788d8",
      "isPublic": false,
      "reminder": {
        "enabled": true,
        "time": 15,
        "sent": false
      },
      "metadata": {
        "createdBy": "staff_id",
        "lastModifiedBy": "staff_id",
        "source": "manual"
      },
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

### Create Calendar Event
```http
POST /api/staff-dashboard/unified/calendar
```

**Description**: Create calendar event

**Request Body**:
```json
{
  "staffId": "staff_id",
  "eventType": "meeting",
  "title": "Client Call",
  "description": "Follow-up call with potential client",
  "startTime": "2024-01-16T14:00:00.000Z",
  "endTime": "2024-01-16T15:00:00.000Z",
  "priority": "high",
  "isRecurring": false,
  "location": "Office",
  "attendees": [
    {
      "userId": "staff_id",
      "name": "Staff Name",
      "email": "staff@example.com",
      "role": "staff"
    }
  ],
  "notes": "Prepare proposal beforehand",
  "tags": ["client", "call"],
  "color": "#ff6b6b",
  "isPublic": false,
  "reminder": {
    "enabled": true,
    "time": 30
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Calendar event created successfully",
  "data": {
    "_id": "event_id",
    "staffId": "staff_id",
    "coachId": "coach_id",
    "eventType": "meeting",
    "title": "Client Call",
    "startTime": "2024-01-16T14:00:00.000Z",
    "endTime": "2024-01-16T15:00:00.000Z",
    "duration": 60,
    "status": "scheduled",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Calendar Event
```http
PUT /api/staff-dashboard/unified/calendar/:id
```

**Description**: Update calendar event

**Request Body**:
```json
{
  "title": "Updated Client Call",
  "startTime": "2024-01-16T15:00:00.000Z",
  "endTime": "2024-01-16T16:00:00.000Z",
  "notes": "Updated notes"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Calendar event updated successfully",
  "data": {
    "_id": "event_id",
    "title": "Updated Client Call",
    "startTime": "2024-01-16T15:00:00.000Z",
    "endTime": "2024-01-16T16:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Delete Calendar Event
```http
DELETE /api/staff-dashboard/unified/calendar/:id
```

**Description**: Delete calendar event

**Response**:
```json
{
  "success": true,
  "message": "Calendar event deleted successfully"
}
```

### Get Staff Availability
```http
GET /api/staff-dashboard/unified/calendar/staff/:staffId/availability
```

**Description**: Get staff availability for a time range

**Query Parameters**:
- `startTime`: Start time for availability check
- `endTime`: End time for availability check

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "event_id",
      "startTime": "2024-01-16T10:00:00.000Z",
      "endTime": "2024-01-16T11:00:00.000Z",
      "duration": 60,
      "eventType": "meeting"
    }
  ]
}
```

---

## 📅 Appointment Management

### Assign Appointment to Staff
```http
POST /api/staff-dashboard/unified/appointments/assign
```

**Description**: Assign an appointment to a staff member (Coach/Admin only)

**Request Body**:
```json
{
  "appointmentId": "appointment_id",
  "staffId": "staff_id"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Appointment assigned to staff successfully",
  "data": {
    "_id": "appointment_id",
    "assignedStaffId": {
      "_id": "staff_id",
      "name": "Staff Name",
      "email": "staff@example.com"
    },
    "leadId": {
      "_id": "lead_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "startTime": "2024-01-16T14:00:00.000Z",
    "duration": 30,
    "status": "scheduled"
  }
}
```

### Get Staff Appointments
```http
GET /api/staff-dashboard/unified/appointments/staff/:staffId
```

**Description**: Get all appointments assigned to a specific staff member

**Query Parameters**:
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `status` (optional): Filter by appointment status
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of appointments per page (default: 20)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "appointment_id",
      "assignedStaffId": "staff_id",
      "leadId": {
        "_id": "lead_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "coachId": {
        "_id": "coach_id",
        "name": "Coach Name",
        "email": "coach@example.com"
      },
      "startTime": "2024-01-16T14:00:00.000Z",
      "duration": 30,
      "status": "scheduled",
      "notes": "Initial consultation",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### Get Available Staff
```http
GET /api/staff-dashboard/unified/appointments/available-staff
```

**Description**: Get available staff members for appointment assignment (Coach/Admin only)

**Query Parameters**:
- `appointmentDate`: Date for the appointment
- `appointmentTime`: Time for the appointment
- `duration` (optional): Duration in minutes (default: 30)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "staff_id",
      "name": "Staff Name",
      "email": "staff@example.com",
      "permissions": ["calendar:read", "calendar:write"],
      "hasConflicts": false,
      "conflictCount": 0
    }
  ],
  "appointmentTime": {
    "start": "2024-01-16T14:00:00.000Z",
    "end": "2024-01-16T14:30:00.000Z",
    "duration": 30
  }
}
```

### Unassign Appointment
```http
PUT /api/staff-dashboard/unified/appointments/:appointmentId/unassign
```

**Description**: Unassign an appointment from staff (Coach/Admin only)

**Response**:
```json
{
  "success": true,
  "message": "Appointment unassigned successfully",
  "data": {
    "_id": "appointment_id",
    "assignedStaffId": null,
    "leadId": {
      "_id": "lead_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "coachId": {
      "_id": "coach_id",
      "name": "Coach Name",
      "email": "coach@example.com"
    }
  }
}
```

---

## 📊 Performance & Analytics

### Get Staff Performance
```http
GET /api/staff-dashboard/unified/performance
```

**Description**: Get staff performance data

**Query Parameters**:
- `timeRange` (optional): Number of days to look back (default: 30)

**Response**:
```json
{
  "success": true,
  "data": {
    "currentScore": 85,
    "scoreBreakdown": {
      "taskCompletion": 90,
      "qualityRating": 85,
      "efficiency": 80,
      "leadership": 75,
      "total": 85
    },
    "metrics": {
      "tasksCompleted": 18,
      "tasksOnTime": 16,
      "leadsConverted": 8,
      "averageResponseTime": 2.5
    },
    "progress": {
      "scoreChange": 5,
      "trend": "up"
    },
    "trends": {
      "scoreTrend": [80, 82, 85, 83, 85],
      "taskTrend": [15, 18, 20, 17, 18],
      "conversionTrend": [60, 65, 70, 68, 67]
    },
    "recommendations": [
      {
        "type": "efficiency",
        "title": "Improve Efficiency",
        "description": "Work on completing tasks within estimated timeframes",
        "priority": "MEDIUM"
      }
    ]
  }
}
```

### Get Performance Metrics
```http
GET /api/staff-dashboard/unified/performance/metrics
```

**Description**: Get comprehensive performance metrics

**Query Parameters**:
- `timeRange` (optional): Number of days to look back (default: 30)
- `includeDetails` (optional): Include detailed metrics (default: false)

**Response**:
```json
{
  "success": true,
  "data": {
    "staffId": "staff_id",
    "staffName": "Staff Name",
    "period": {
      "start": "2023-12-16T00:00:00.000Z",
      "end": "2024-01-15T23:59:59.999Z"
    },
    "overallScore": 85,
    "taskMetrics": {
      "totalTasks": 25,
      "completedTasks": 18,
      "inProgressTasks": 5,
      "overdueTasks": 2,
      "onTimeCompletion": 16,
      "breakdown": {
        "total": 25,
        "completed": 18,
        "inProgress": 5,
        "overdue": 2,
        "onTime": 16,
        "completionRate": 72,
        "onTimeRate": 88.89
      }
    },
    "leadMetrics": {
      "totalLeads": 12,
      "managedLeads": 10,
      "convertedLeads": 8,
      "qualifiedLeads": 9,
      "breakdown": {
        "total": 12,
        "managed": 10,
        "converted": 8,
        "qualified": 9,
        "managementRate": 83.33,
        "conversionRate": 80,
        "qualificationRate": 90
      }
    },
    "calendarMetrics": {
      "totalEvents": 15,
      "completedEvents": 12,
      "cancelledEvents": 1,
      "totalDuration": 1200,
      "availabilityPercentage": 75,
      "breakdown": {
        "total": 15,
        "completed": 12,
        "cancelled": 1,
        "totalDuration": 1200,
        "availabilityPercentage": 75
      }
    },
    "responseMetrics": {
      "averageResponseTime": 2.5,
      "responseRate": 95,
      "totalResponses": 50,
      "breakdown": {
        "averageResponseTime": 2.5,
        "responseRate": 95,
        "totalResponses": 50
      }
    },
    "summary": {
      "totalTasks": 25,
      "completedTasks": 18,
      "totalLeads": 12,
      "managedLeads": 10,
      "availability": 75,
      "averageResponseTime": 2.5
    }
  }
}
```

### Get Performance Comparison
```http
GET /api/staff-dashboard/unified/performance/comparison
```

**Description**: Get performance comparison between staff members

**Query Parameters**:
- `timeRange` (optional): Number of days to look back (default: 30)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "staffId": "staff_id_1",
      "staffName": "Top Performer",
      "overallScore": 95,
      "summary": {
        "totalTasks": 30,
        "completedTasks": 28,
        "totalLeads": 15,
        "managedLeads": 14,
        "availability": 90,
        "averageResponseTime": 1.5
      }
    },
    {
      "staffId": "staff_id_2",
      "staffName": "Current Staff",
      "overallScore": 85,
      "summary": {
        "totalTasks": 25,
        "completedTasks": 18,
        "totalLeads": 12,
        "managedLeads": 10,
        "availability": 75,
        "averageResponseTime": 2.5
      }
    }
  ]
}
```

### Get Performance Trends
```http
GET /api/staff-dashboard/unified/performance/trends
```

**Description**: Get performance trends over time

**Query Parameters**:
- `period` (optional): Period for trends (`monthly`, `weekly`, `daily`) (default: monthly)
- `months` (optional): Number of months to look back (default: 6)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "period": "2023-08",
      "overallScore": 75,
      "summary": {
        "totalTasks": 20,
        "completedTasks": 15,
        "totalLeads": 8,
        "managedLeads": 6,
        "availability": 70,
        "averageResponseTime": 3.0
      }
    },
    {
      "period": "2023-09",
      "overallScore": 80,
      "summary": {
        "totalTasks": 22,
        "completedTasks": 17,
        "totalLeads": 10,
        "managedLeads": 8,
        "availability": 75,
        "averageResponseTime": 2.8
      }
    }
  ]
}
```

### Get Staff Achievements
```http
GET /api/staff-dashboard/unified/achievements
```

**Description**: Get staff achievements

**Query Parameters**:
- `timeRange` (optional): Number of days to look back (default: 30)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "achievement": "task_master",
      "title": "Task Master",
      "description": "Complete 50 tasks",
      "earned": true,
      "earnedAt": "2024-01-10T10:00:00.000Z",
      "progress": 100
    },
    {
      "achievement": "lead_champion",
      "title": "Lead Champion",
      "description": "Convert 20 leads",
      "earned": false,
      "earnedAt": null,
      "progress": 75
    }
  ]
}
```

### Get Team Leaderboard
```http
GET /api/staff-dashboard/unified/team/leaderboard
```

**Description**: Get team leaderboard

**Query Parameters**:
- `timeRange` (optional): Number of days to look back (default: 30)
- `limit` (optional): Number of staff to return (default: 20)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "staffId": "staff_id_1",
      "name": "Top Performer",
      "score": 95,
      "rank": 1,
      "metrics": {
        "tasksCompleted": 28,
        "leadsConverted": 12,
        "efficiency": 95
      }
    },
    {
      "staffId": "staff_id_2",
      "name": "Current Staff",
      "score": 85,
      "rank": 3,
      "metrics": {
        "tasksCompleted": 18,
        "leadsConverted": 8,
        "efficiency": 85
      }
    }
  ]
}
```

### Get Analytics Data
```http
GET /api/staff-dashboard/unified/analytics
```

**Description**: Get staff analytics and insights

**Query Parameters**:
- `timeRange` (optional): Number of days to look back (default: 30)

**Response**:
```json
{
  "success": true,
  "data": {
    "taskEfficiency": {
      "totalTasks": 25,
      "completedTasks": 18,
      "onTimeTasks": 16,
      "efficiencyRate": 88.89
    },
    "leadConversion": {
      "totalLeads": 12,
      "convertedLeads": 8,
      "conversionRate": 66.67
    },
    "timeManagement": {
      "averageAccuracy": 85,
      "tasks": 15
    },
    "trends": {
      "scoreTrend": [80, 82, 85, 83, 85],
      "taskTrend": [15, 18, 20, 17, 18],
      "conversionTrend": [60, 65, 70, 68, 67]
    },
    "insights": [
      {
        "type": "info",
        "message": "Lead conversion rate could be improved. Focus on qualification and follow-up.",
        "action": "improve_conversion"
      }
    ]
  }
}
```

---

## 🔒 Error Responses

### Common Error Codes

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Validation error message",
  "error": "Detailed error information"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "message": "Access denied",
  "code": "ACCESS_DENIED"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**409 Conflict**:
```json
{
  "success": false,
  "message": "Event overlaps with existing calendar events",
  "overlappingEvents": [
    {
      "id": "event_id",
      "title": "Existing Event",
      "startTime": "2024-01-16T14:00:00.000Z",
      "endTime": "2024-01-16T15:00:00.000Z"
    }
  ]
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**503 Service Unavailable**:
```json
{
  "success": false,
  "message": "System is under maintenance. Please try again later.",
  "code": "MAINTENANCE_MODE"
}
```

---

## 📝 Sample Data Examples

### Task Creation Sample
```json
{
  "name": "Follow up with lead",
  "description": "Call the lead to discuss their requirements and schedule a demo",
  "priority": "HIGH",
  "stage": "LEAD_QUALIFICATION",
  "dueDate": "2024-01-20T15:00:00.000Z",
  "estimatedHours": 2,
  "relatedLead": "lead_id",
  "assignedTo": "staff_id"
}
```

### Calendar Event Creation Sample
```json
{
  "staffId": "staff_id",
  "eventType": "meeting",
  "title": "Client Demo",
  "description": "Product demonstration for potential client",
  "startTime": "2024-01-16T14:00:00.000Z",
  "endTime": "2024-01-16T15:00:00.000Z",
  "priority": "high",
  "location": "Conference Room B",
  "attendees": [
    {
      "userId": "staff_id",
      "name": "Staff Name",
      "email": "staff@example.com",
      "role": "staff"
    }
  ],
  "notes": "Prepare demo materials and client background",
  "tags": ["client", "demo", "sales"],
  "color": "#4CAF50",
  "isPublic": false,
  "reminder": {
    "enabled": true,
    "time": 30
  }
}
```

### Performance Metrics Sample
```json
{
  "taskMetrics": {
    "totalTasks": 25,
    "completedTasks": 18,
    "inProgressTasks": 5,
    "overdueTasks": 2,
    "onTimeCompletion": 16,
    "breakdown": {
      "completionRate": 72,
      "onTimeRate": 88.89
    }
  },
  "leadMetrics": {
    "totalLeads": 12,
    "managedLeads": 10,
    "convertedLeads": 8,
    "qualifiedLeads": 9,
    "breakdown": {
      "managementRate": 83.33,
      "conversionRate": 80,
      "qualificationRate": 90
    }
  },
  "calendarMetrics": {
    "totalEvents": 15,
    "completedEvents": 12,
    "availabilityPercentage": 75
  }
}
```

---

## 🚀 Getting Started

### 1. Authentication
First, authenticate to get a JWT token:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "staff@example.com",
  "password": "password123"
}
```

### 2. Get Dashboard Data
```http
GET /api/staff-dashboard/unified/data?timeRange=30&sections=overview,tasks
Authorization: Bearer <jwt_token>
```

### 3. Create a Task
```http
POST /api/staff-dashboard/unified/tasks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Follow up with lead",
  "description": "Call the lead to discuss requirements",
  "priority": "HIGH",
  "dueDate": "2024-01-20T15:00:00.000Z",
  "estimatedHours": 2
}
```

### 4. Create Calendar Event
```http
POST /api/staff-dashboard/unified/calendar
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "eventType": "meeting",
  "title": "Team Meeting",
  "startTime": "2024-01-16T10:00:00.000Z",
  "endTime": "2024-01-16T11:00:00.000Z",
  "priority": "medium"
}
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/your_database

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

# Global Settings
SYSTEM_TIMEZONE=UTC
DATE_FORMAT=MM/DD/YYYY
TIME_FORMAT=12h
```

### Global Settings Schema
```json
{
  "platformConfig": {
    "maintenanceMode": false,
    "maintenanceMessage": null,
    "systemTimezone": "UTC",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h",
    "debugMode": false
  }
}
```

---

## 📚 Additional Resources

- **Staff Schema**: Defines staff member structure and permissions
- **Task Schema**: Defines task structure and relationships
- **Calendar Schema**: Defines calendar event structure
- **Appointment Schema**: Defines appointment structure
- **Performance Service**: Handles performance calculations
- **Leaderboard Service**: Handles ranking and scoring

---

## 🆘 Support

For technical support or questions about the Staff Dashboard API:

1. Check the error responses for specific error codes
2. Verify authentication and permissions
3. Ensure staff account is active and not deactivated
4. Check global system settings for maintenance mode
5. Contact system administrator for access issues

---

*This documentation covers all endpoints and functionality available in the Unified Staff Dashboard API. The API is designed to be comprehensive, secure, and maintainable while providing all necessary features for staff management and productivity tracking.*
