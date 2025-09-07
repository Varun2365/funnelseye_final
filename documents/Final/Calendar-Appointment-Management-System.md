# Calendar & Appointment Management System Documentation

## Overview
The Calendar & Appointment Management System provides comprehensive scheduling capabilities with multi-platform integration, AI scheduling recommendations, booking recovery, automated reminders, and Zoom meeting management. The system supports both online and offline appointments with intelligent availability management.

## System Architecture

### Core Components
- **Calendar Engine** - Multi-platform scheduling integration
- **AI Scheduling Agent** - Optimal slot recommendations
- **Booking Recovery System** - Abandoned booking rescue
- **Automated Reminders** - SMS/Email notification sequences
- **Zoom Integration** - Meeting management and details
- **Availability Management** - Flexible working hours and buffer times
- **Conflict Detection** - Intelligent scheduling conflict prevention

### Database Schema

#### Appointment Schema
```javascript
{
  coachId: ObjectId,               // Reference to User (Coach) - Required
  leadId: ObjectId,               // Reference to Lead - Required
  assignedStaffId: ObjectId,       // Reference to Staff (Optional)
  startTime: Date,                 // Required
  duration: Number,                // in minutes - Required
  summary: String,                 // Required
  notes: String,                   // Optional
  timeZone: String,                // Required
  appointmentType: String,         // 'online', 'offline' - Default: 'online'
  zoomMeeting: {
    meetingId: String,
    joinUrl: String,
    startUrl: String,
    password: String,
    createdAt: Date
  },
  status: String,                  // 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'
  createdAt: Date,
  updatedAt: Date
}
```

#### CoachAvailability Schema
```javascript
{
  coachId: ObjectId,               // Reference to User (Coach) - Required
  workingHours: [{
    dayOfWeek: Number,             // 0-6 (Sunday-Saturday)
    startTime: String,             // "HH:MM" format
    endTime: String,               // "HH:MM" format
    isWorking: Boolean             // Default: true
  }],
  unavailableSlots: [{
    start: Date,
    end: Date,
    reason: String
  }],
  defaultAppointmentDuration: Number, // in minutes - Default: 30
  bufferTime: Number,              // in minutes between appointments
  timeZone: String,                // Default: 'UTC'
  advanceBookingDays: Number,       // How many days in advance bookings allowed
  sameDayBooking: Boolean,         // Allow same-day bookings
  autoConfirm: Boolean,            // Auto-confirm appointments
  reminderSettings: {
    emailReminder: Boolean,
    smsReminder: Boolean,
    reminderTime: Number,          // hours before appointment
    followUpReminder: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Base URL: `/api/coach-dashboard`

### 1. Calendar Management

#### Get Calendar
**GET** `/calendar?startDate=2025-01-20&endDate=2025-01-27`
- **Description**: Get coach's calendar for a date range
- **Authentication**: Coach required
- **Query Parameters**:
  - `startDate`: Start date (YYYY-MM-DD format)
  - `endDate`: End date (YYYY-MM-DD format)
- **Response**:
```json
{
  "success": true,
  "data": {
    "coachId": "65a1b2c3d4e5f6789012345a",
    "dateRange": {
      "startDate": "2025-01-20",
      "endDate": "2025-01-27"
    },
    "appointments": [
      {
        "_id": "65a1b2c3d4e5f6789012345b",
        "leadId": "65a1b2c3d4e5f6789012345c",
        "assignedStaffId": "65a1b2c3d4e5f6789012345d",
        "startTime": "2025-01-22T14:00:00Z",
        "duration": 60,
        "summary": "Discovery Call with John Doe",
        "notes": "Discuss weight loss goals and program details",
        "timeZone": "America/New_York",
        "appointmentType": "online",
        "status": "scheduled",
        "zoomMeeting": {
          "meetingId": "123456789",
          "joinUrl": "https://zoom.us/j/123456789",
          "startUrl": "https://zoom.us/s/123456789",
          "password": "abc123"
        },
        "lead": {
          "_id": "65a1b2c3d4e5f6789012345c",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "assignedStaff": {
          "_id": "65a1b2c3d4e5f6789012345d",
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      }
    ],
    "workingHours": [
      {
        "dayOfWeek": 1,
        "dayName": "Monday",
        "startTime": "09:00",
        "endTime": "17:00",
        "isWorking": true
      }
    ],
    "unavailableSlots": [],
    "summary": {
      "totalAppointments": 5,
      "completedAppointments": 2,
      "upcomingAppointments": 3,
      "cancelledAppointments": 0
    }
  }
}
```

#### Get Available Slots
**GET** `/available-slots?date=2025-01-22`
- **Description**: Get available booking slots for a specific date
- **Authentication**: Coach required
- **Query Parameters**:
  - `date`: Date in YYYY-MM-DD format
- **Response**:
```json
{
  "success": true,
  "data": {
    "date": "2025-01-22",
    "coachId": "65a1b2c3d4e5f6789012345a",
    "availableSlots": [
      {
        "startTime": "2025-01-22T09:00:00Z",
        "duration": 30,
        "timeZone": "America/New_York",
        "slotType": "standard"
      },
      {
        "startTime": "2025-01-22T09:30:00Z",
        "duration": 30,
        "timeZone": "America/New_York",
        "slotType": "standard"
      },
      {
        "startTime": "2025-01-22T14:00:00Z",
        "duration": 60,
        "timeZone": "America/New_York",
        "slotType": "extended"
      }
    ],
    "workingHours": {
      "startTime": "09:00",
      "endTime": "17:00",
      "timeZone": "America/New_York"
    },
    "totalSlots": 16,
    "availableSlots": 12,
    "bookedSlots": 4
  }
}
```

### 2. Appointment Management

#### Book Appointment
**POST** `/appointments`
- **Description**: Book a new appointment
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "leadId": "65a1b2c3d4e5f6789012345c",
  "startTime": "2025-01-22T14:00:00Z",
  "duration": 60,
  "notes": "Discovery call to discuss weight loss goals",
  "timeZone": "America/New_York",
  "appointmentType": "online",
  "assignedStaffId": "65a1b2c3d4e5f6789012345d"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345b",
    "coachId": "65a1b2c3d4e5f6789012345a",
    "leadId": "65a1b2c3d4e5f6789012345c",
    "assignedStaffId": "65a1b2c3d4e5f6789012345d",
    "startTime": "2025-01-22T14:00:00Z",
    "duration": 60,
    "summary": "Discovery Call with John Doe",
    "notes": "Discovery call to discuss weight loss goals",
    "timeZone": "America/New_York",
    "appointmentType": "online",
    "status": "scheduled",
    "zoomMeeting": {
      "meetingId": "123456789",
      "joinUrl": "https://zoom.us/j/123456789",
      "startUrl": "https://zoom.us/s/123456789",
      "password": "abc123",
      "createdAt": "2025-01-20T10:00:00Z"
    },
    "lead": {
      "_id": "65a1b2c3d4e5f6789012345c",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "assignedStaff": {
      "_id": "65a1b2c3d4e5f6789012345d",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Get Upcoming Appointments
**GET** `/appointments/upcoming?limit=10`
- **Description**: Get upcoming appointments
- **Authentication**: Coach required
- **Query Parameters**:
  - `limit`: Number of appointments to return (default: 10)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345b",
      "leadId": "65a1b2c3d4e5f6789012345c",
      "startTime": "2025-01-22T14:00:00Z",
      "duration": 60,
      "summary": "Discovery Call with John Doe",
      "status": "scheduled",
      "appointmentType": "online",
      "lead": {
        "_id": "65a1b2c3d4e5f6789012345c",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "assignedStaff": {
        "_id": "65a1b2c3d4e5f6789012345d",
        "name": "Jane Smith"
      },
      "zoomMeeting": {
        "joinUrl": "https://zoom.us/j/123456789",
        "password": "abc123"
      },
      "timeUntilAppointment": "2 days, 4 hours"
    }
  ],
  "totalUpcoming": 5
}
```

#### Get Today's Appointments
**GET** `/appointments/today`
- **Description**: Get today's appointments
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "date": "2025-01-20",
    "appointments": [
      {
        "_id": "65a1b2c3d4e5f6789012345e",
        "leadId": "65a1b2c3d4e5f6789012345f",
        "startTime": "2025-01-20T10:00:00Z",
        "duration": 30,
        "summary": "Follow-up Call with Sarah",
        "status": "scheduled",
        "appointmentType": "online",
        "lead": {
          "_id": "65a1b2c3d4e5f6789012345f",
          "name": "Sarah Johnson",
          "email": "sarah@example.com"
        },
        "timeUntilAppointment": "2 hours"
      }
    ],
    "summary": {
      "totalAppointments": 3,
      "completedAppointments": 1,
      "upcomingAppointments": 2,
      "nextAppointment": {
        "_id": "65a1b2c3d4e5f6789012345e",
        "startTime": "2025-01-20T10:00:00Z",
        "summary": "Follow-up Call with Sarah"
      }
    }
  }
}
```

#### Reschedule Appointment
**PUT** `/appointments/:appointmentId/reschedule`
- **Description**: Reschedule an existing appointment
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "newStartTime": "2025-01-23T15:00:00Z",
  "reason": "Client requested time change",
  "notifyClient": true
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Appointment rescheduled successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345b",
    "startTime": "2025-01-23T15:00:00Z",
    "duration": 60,
    "status": "scheduled",
    "rescheduleHistory": [
      {
        "originalTime": "2025-01-22T14:00:00Z",
        "newTime": "2025-01-23T15:00:00Z",
        "reason": "Client requested time change",
        "rescheduledAt": "2025-01-20T11:00:00Z",
        "rescheduledBy": "65a1b2c3d4e5f6789012345a"
      }
    ],
    "updatedAt": "2025-01-20T11:00:00Z"
  }
}
```

#### Cancel Appointment
**DELETE** `/appointments/:appointmentId`
- **Description**: Cancel an appointment
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "reason": "Client cancelled",
  "notifyClient": true,
  "rescheduleOffer": true
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345b",
    "status": "cancelled",
    "cancelledAt": "2025-01-20T11:00:00Z",
    "cancellationReason": "Client cancelled",
    "cancelledBy": "65a1b2c3d4e5f6789012345a",
    "rescheduleOffered": true,
    "updatedAt": "2025-01-20T11:00:00Z"
  }
}
```

### 3. Appointment Analytics

#### Get Appointment Statistics
**GET** `/appointments/stats?period=30&startDate=2025-01-01&endDate=2025-01-31`
- **Description**: Get appointment statistics and analytics
- **Authentication**: Coach required
- **Query Parameters**:
  - `period`: Number of days for analysis (default: 30)
  - `startDate`: Start date for analysis
  - `endDate`: End date for analysis
- **Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31",
      "days": 31
    },
    "summary": {
      "totalAppointments": 45,
      "completedAppointments": 38,
      "cancelledAppointments": 4,
      "noShowAppointments": 3,
      "completionRate": 84.4,
      "cancellationRate": 8.9,
      "noShowRate": 6.7
    },
    "byStatus": [
      {
        "status": "completed",
        "count": 38,
        "percentage": 84.4
      },
      {
        "status": "cancelled",
        "count": 4,
        "percentage": 8.9
      },
      {
        "status": "no_show",
        "count": 3,
        "percentage": 6.7
      }
    ],
    "byType": [
      {
        "type": "online",
        "count": 42,
        "percentage": 93.3
      },
      {
        "type": "offline",
        "count": 3,
        "percentage": 6.7
      }
    ],
    "byDuration": [
      {
        "duration": 30,
        "count": 15,
        "percentage": 33.3
      },
      {
        "duration": 60,
        "count": 25,
        "percentage": 55.6
      },
      {
        "duration": 90,
        "count": 5,
        "percentage": 11.1
      }
    ],
    "trends": {
      "weeklyAverage": 10.3,
      "monthlyGrowth": 15.2,
      "peakBookingDay": "Tuesday",
      "peakBookingTime": "14:00-15:00",
      "averageBookingAdvance": 3.2
    },
    "revenue": {
      "totalRevenue": 2250,
      "averageRevenuePerAppointment": 50,
      "completedRevenue": 1900,
      "lostRevenue": 350
    }
  }
}
```

### 4. Availability Management

#### Get Availability Settings
**GET** `/availability`
- **Description**: Get coach's availability settings
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345g",
    "coachId": "65a1b2c3d4e5f6789012345a",
    "workingHours": [
      {
        "dayOfWeek": 1,
        "dayName": "Monday",
        "startTime": "09:00",
        "endTime": "17:00",
        "isWorking": true
      },
      {
        "dayOfWeek": 2,
        "dayName": "Tuesday",
        "startTime": "09:00",
        "endTime": "17:00",
        "isWorking": true
      },
      {
        "dayOfWeek": 6,
        "dayName": "Saturday",
        "startTime": "10:00",
        "endTime": "14:00",
        "isWorking": true
      },
      {
        "dayOfWeek": 0,
        "dayName": "Sunday",
        "startTime": "00:00",
        "endTime": "00:00",
        "isWorking": false
      }
    ],
    "unavailableSlots": [
      {
        "start": "2025-01-25T12:00:00Z",
        "end": "2025-01-25T13:00:00Z",
        "reason": "Lunch break"
      }
    ],
    "defaultAppointmentDuration": 60,
    "bufferTime": 15,
    "timeZone": "America/New_York",
    "advanceBookingDays": 30,
    "sameDayBooking": true,
    "autoConfirm": false,
    "reminderSettings": {
      "emailReminder": true,
      "smsReminder": true,
      "reminderTime": 24,
      "followUpReminder": true
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Set Availability Settings
**PUT** `/availability`
- **Description**: Update coach's availability settings
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "workingHours": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isWorking": true
    },
    {
      "dayOfWeek": 2,
      "startTime": "09:00",
      "endTime": "17:00",
      "isWorking": true
    },
    {
      "dayOfWeek": 0,
      "startTime": "00:00",
      "endTime": "00:00",
      "isWorking": false
    }
  ],
  "defaultAppointmentDuration": 60,
  "bufferTime": 15,
  "timeZone": "America/New_York",
  "advanceBookingDays": 30,
  "sameDayBooking": true,
  "autoConfirm": false,
  "reminderSettings": {
    "emailReminder": true,
    "smsReminder": true,
    "reminderTime": 24,
    "followUpReminder": true
  }
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Availability settings updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345g",
    "coachId": "65a1b2c3d4e5f6789012345a",
    "workingHours": [
      {
        "dayOfWeek": 1,
        "dayName": "Monday",
        "startTime": "09:00",
        "endTime": "17:00",
        "isWorking": true
      }
    ],
    "defaultAppointmentDuration": 60,
    "bufferTime": 15,
    "timeZone": "America/New_York",
    "advanceBookingDays": 30,
    "sameDayBooking": true,
    "autoConfirm": false,
    "reminderSettings": {
      "emailReminder": true,
      "smsReminder": true,
      "reminderTime": 24,
      "followUpReminder": true
    },
    "updatedAt": "2025-01-20T11:00:00Z"
  }
}
```

### 5. Zoom Integration

#### Get Zoom Meetings
**GET** `/zoom-meetings?startDate=2025-01-20&endDate=2025-01-27`
- **Description**: Get all Zoom meetings for the coach
- **Authentication**: Coach required
- **Query Parameters**:
  - `startDate`: Start date for meeting search
  - `endDate`: End date for meeting search
- **Response**:
```json
{
  "success": true,
  "data": {
    "coachId": "65a1b2c3d4e5f6789012345a",
    "meetings": [
      {
        "_id": "65a1b2c3d4e5f6789012345b",
        "appointmentId": "65a1b2c3d4e5f6789012345b",
        "meetingId": "123456789",
        "topic": "Discovery Call with John Doe",
        "startTime": "2025-01-22T14:00:00Z",
        "duration": 60,
        "joinUrl": "https://zoom.us/j/123456789",
        "startUrl": "https://zoom.us/s/123456789",
        "password": "abc123",
        "status": "scheduled",
        "participants": [
          {
            "email": "john@example.com",
            "name": "John Doe",
            "role": "participant"
          },
          {
            "email": "coach@example.com",
            "name": "Coach Name",
            "role": "host"
          }
        ],
        "createdAt": "2025-01-20T10:00:00Z"
      }
    ],
    "summary": {
      "totalMeetings": 5,
      "scheduledMeetings": 3,
      "completedMeetings": 2,
      "cancelledMeetings": 0
    }
  }
}
```

#### Get Zoom Meeting Details
**GET** `/zoom-meetings/appointment/:appointmentId`
- **Description**: Get Zoom meeting details for a specific appointment
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345b",
    "appointmentId": "65a1b2c3d4e5f6789012345b",
    "meetingId": "123456789",
    "topic": "Discovery Call with John Doe",
    "startTime": "2025-01-22T14:00:00Z",
    "duration": 60,
    "joinUrl": "https://zoom.us/j/123456789",
    "startUrl": "https://zoom.us/s/123456789",
    "password": "abc123",
    "status": "scheduled",
    "settings": {
      "waitingRoom": true,
      "joinBeforeHost": false,
      "muteUponEntry": true,
      "autoRecording": "cloud",
      "breakoutRoom": false
    },
    "participants": [
      {
        "email": "john@example.com",
        "name": "John Doe",
        "role": "participant",
        "joinTime": null,
        "leaveTime": null,
        "duration": null
      },
      {
        "email": "coach@example.com",
        "name": "Coach Name",
        "role": "host",
        "joinTime": null,
        "leaveTime": null,
        "duration": null
      }
    ],
    "recording": {
      "available": false,
      "downloadUrl": null,
      "fileSize": null,
      "duration": null
    },
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
```

### 6. Booking Recovery System

#### Get Abandoned Bookings
**GET** `/booking-recovery/abandoned`
- **Description**: Get abandoned booking attempts
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345h",
      "leadId": "65a1b2c3d4e5f6789012345i",
      "selectedSlot": {
        "startTime": "2025-01-22T14:00:00Z",
        "duration": 60
      },
      "abandonedAt": "2025-01-20T10:30:00Z",
      "recoveryAttempts": 1,
      "lastRecoveryAttempt": "2025-01-20T11:00:00Z",
      "status": "pending",
      "lead": {
        "_id": "65a1b2c3d4e5f6789012345i",
        "name": "Mike Wilson",
        "email": "mike@example.com",
        "phone": "+1234567890"
      }
    }
  ],
  "totalAbandoned": 3,
  "recoveryRate": 33.3
}
```

#### Send Recovery Message
**POST** `/booking-recovery/:abandonedBookingId/recover`
- **Description**: Send recovery message to abandoned booking
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "messageType": "email",
  "customMessage": "Hi Mike, I noticed you were interested in booking a call. I'd love to help you get started with your fitness journey. Would you like to reschedule?",
  "offerIncentive": true,
  "incentiveType": "discount",
  "incentiveValue": 20
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Recovery message sent successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345h",
    "recoveryAttempts": 2,
    "lastRecoveryAttempt": "2025-01-20T12:00:00Z",
    "recoveryMessage": {
      "type": "email",
      "sentAt": "2025-01-20T12:00:00Z",
      "customMessage": "Hi Mike, I noticed you were interested in booking a call...",
      "incentiveOffered": {
        "type": "discount",
        "value": 20
      }
    },
    "status": "recovery_sent"
  }
}
```

## AI Scheduling Features

### Optimal Slot Recommendations
The system uses AI to recommend optimal appointment slots based on:
- **Lead Behavior**: Previous engagement patterns
- **Coach Availability**: Working hours and preferences
- **Success Patterns**: Historical conversion rates by time
- **Lead Timezone**: Automatic timezone conversion
- **Urgency Level**: Based on lead temperature and score

### Smart Scheduling Suggestions
```json
{
  "aiRecommendations": [
    {
      "slot": "2025-01-22T14:00:00Z",
      "confidence": 0.92,
      "reasons": [
        "High conversion rate for similar leads at this time",
        "Lead is in optimal timezone",
        "Coach has high energy during this period"
      ],
      "expectedOutcome": "High probability of conversion"
    },
    {
      "slot": "2025-01-23T10:00:00Z",
      "confidence": 0.78,
      "reasons": [
        "Good alternative time slot",
        "Lead shows morning engagement patterns"
      ],
      "expectedOutcome": "Moderate probability of conversion"
    }
  ]
}
```

## Automated Reminders

### Reminder Types
1. **Email Reminders**: 24 hours before appointment
2. **SMS Reminders**: 2 hours before appointment
3. **Push Notifications**: 30 minutes before appointment
4. **Follow-up Reminders**: After missed appointments

### Reminder Templates
```json
{
  "emailReminder": {
    "subject": "Reminder: Your appointment with [Coach Name] tomorrow",
    "body": "Hi [Lead Name], this is a reminder that you have an appointment scheduled for [Date] at [Time]. Join here: [Zoom Link]"
  },
  "smsReminder": {
    "body": "Hi [Lead Name], your appointment with [Coach Name] is in 2 hours. Join: [Zoom Link]"
  },
  "followUpReminder": {
    "subject": "Missed your appointment? Let's reschedule",
    "body": "Hi [Lead Name], I noticed you missed our scheduled appointment. No worries! Let's find a time that works better for you."
  }
}
```

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

All endpoints require coach authentication.

## Rate Limiting

- **Calendar Endpoints**: 1000 requests per hour
- **Appointment Management**: 500 requests per hour
- **Zoom Integration**: 200 requests per hour
- **Analytics Endpoints**: 100 requests per hour

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict (time slot not available)
- **500**: Internal Server Error
