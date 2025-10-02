# 🔗 Zoom Integration - Complete API Documentation

## Overview

This comprehensive API documentation covers all Zoom integration features including setup, appointment booking, meeting management, staff transfer functionality, and cleanup operations.

## Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Authentication](#authentication)
3. [Setup & Configuration](#setup--configuration)
4. [Meeting Templates](#meeting-templates)
5. [Appointment Booking](#appointment-booking)
6. [Meeting Management](#meeting-management)
7. [Staff Management & Transfer](#staff-management--transfer)
8. [Meeting Cleanup & Maintenance](#meeting-cleanup--maintenance)
9. [Integration Management](#integration-management)
10. [Error Handling](#error-handling)
11. [Examples & Use Cases](#examples--use-cases)

## Quick Start Guide

### 1. Get Setup Guide
```http
GET /api/zoom-integration/setup-guide
```
**No authentication required** - Returns complete step-by-step guide for setting up Zoom API credentials.

### 2. Setup Integration
```http
POST /api/zoom-integration/setup
Authorization: Bearer {your_token}
```

### 3. Book Appointment with Zoom
```http
POST /api/coach-dashboard/appointments
Authorization: Bearer {your_token}
```

## Authentication

All endpoints (except setup guide) require Bearer token authentication:

```http
Authorization: Bearer {your_jwt_token}
```

**Token Requirements:**
- Coach endpoints: Coach role required
- Staff endpoints: Staff role required
- Transfer endpoints: Appropriate permissions required

## Setup & Configuration

### Get Zoom API Setup Guide (Public)
```http
GET /api/zoom-integration/setup-guide
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "🔗 Zoom Integration Setup Guide",
    "description": "Complete step-by-step guide to set up Zoom API integration",
    "steps": [
      {
        "step": 1,
        "title": "Create Zoom Marketplace App",
        "description": "Create a Server-to-Server OAuth app in Zoom Marketplace",
        "details": ["Go to https://marketplace.zoom.us/", "..."],
        "required": true
      }
    ],
    "apiCredentials": {
      "clientId": {
        "description": "Your Zoom OAuth app Client ID",
        "example": "abcd1234efgh5678ijkl9012mnop3456",
        "required": true
      }
    },
    "commonIssues": [
      {
        "issue": "Invalid credentials error",
        "solution": "Double-check your Client ID, Client Secret, and Account ID"
      }
    ]
  }
}
```

### Setup Zoom Integration
```http
POST /api/zoom-integration/setup
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "clientId": "your_zoom_oauth_client_id",
  "clientSecret": "your_zoom_oauth_client_secret",
  "zoomEmail": "your_zoom_account_email@example.com",
  "zoomAccountId": "your_zoom_account_id",
  "meetingSettings": {
    "defaultDuration": 60,
    "defaultType": "scheduled",
    "settings": {
      "hostVideo": true,
      "participantVideo": true,
      "joinBeforeHost": false,
      "muteUponEntry": true,
      "watermark": false,
      "usePersonalMeetingId": false,
      "waitingRoom": true,
      "autoRecording": "none"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Zoom integration setup successfully",
  "data": {
    "integrationId": "64a1b2c3d4e5f6789012345",
    "zoomAccountId": "your_zoom_account_id",
    "zoomEmail": "your_zoom_account_email@example.com",
    "isActive": true
  }
}
```

### Get Integration Details
```http
GET /api/zoom-integration
Authorization: Bearer {coach_token}
```

### Update Integration Settings
```http
PUT /api/zoom-integration
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "meetingSettings": {
    "defaultDuration": 45,
    "settings": {
      "hostVideo": true,
      "participantVideo": false,
      "joinBeforeHost": true,
      "muteUponEntry": true,
      "waitingRoom": false,
      "autoRecording": "local"
    }
  },
  "isActive": true
}
```

### Test Connection
```http
POST /api/zoom-integration/test
Authorization: Bearer {coach_token}
```

### Get Integration Status
```http
GET /api/zoom-integration/status
Authorization: Bearer {coach_token}
```

### Get Usage Statistics
```http
GET /api/zoom-integration/usage
Authorization: Bearer {coach_token}
```

## Meeting Templates

### Create Meeting Template
```http
POST /api/zoom-integration/meeting-templates
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "name": "30-min Coaching Session",
  "description": "Standard 30-minute coaching session with client",
  "duration": 30,
  "settings": {
    "hostVideo": true,
    "participantVideo": true,
    "joinBeforeHost": false,
    "muteUponEntry": true,
    "waitingRoom": true,
    "autoRecording": "none"
  },
  "isDefault": true
}
```

### Get Meeting Templates
```http
GET /api/zoom-integration/meeting-templates
Authorization: Bearer {coach_token}
```

## Appointment Booking

### Book Appointment (Coach)
```http
POST /api/coach-dashboard/appointments
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "leadId": "64a1b2c3d4e5f6789012345",
  "startTime": "2024-12-20T10:00:00.000Z",
  "duration": 60,
  "summary": "Initial consultation session",
  "notes": "First meeting with new client",
  "timeZone": "America/New_York",
  "appointmentType": "online",
  "meetingSettings": {
    "hostVideo": true,
    "participantVideo": true,
    "joinBeforeHost": false,
    "waitingRoom": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012346",
    "coachId": "64a1b2c3d4e5f6789012347",
    "leadId": "64a1b2c3d4e5f6789012345",
    "startTime": "2024-12-20T10:00:00.000Z",
    "duration": 60,
    "summary": "Initial consultation session",
    "appointmentType": "online",
    "zoomMeeting": {
      "meetingId": "123456789",
      "joinUrl": "https://zoom.us/j/123456789?pwd=abcdefgh",
      "startUrl": "https://zoom.us/s/123456789?zak=abcdefgh",
      "password": "ABC12345",
      "createdAt": "2024-12-20T09:30:00.000Z"
    },
    "status": "scheduled",
    "createdAt": "2024-12-20T09:30:00.000Z"
  }
}
```

### Book Appointment (Staff)
```http
POST /api/staff-enhanced/appointments
Authorization: Bearer {staff_token}
```

### Get Available Time Slots
```http
GET /api/coach-dashboard/available-slots?date=2024-12-20&duration=60
Authorization: Bearer {coach_token}
```

### Get Upcoming Appointments
```http
GET /api/coach-dashboard/appointments/upcoming?limit=10&page=1
Authorization: Bearer {coach_token}
```

## Meeting Management

### Get All Coach Meetings
```http
GET /api/zoom-integration/meetings
Authorization: Bearer {coach_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "meetings": [
      {
        "meetingId": "123456789",
        "joinUrl": "https://zoom.us/j/123456789?pwd=ABC12345",
        "startUrl": "https://zoom.us/s/123456789?zak=abcdefgh",
        "password": "ABC12345",
        "appointment": {
          "id": "64a1b2c3d4e5f6789012346",
          "startTime": "2024-12-20T10:00:00.000Z",
          "duration": 60,
          "leadName": "John Doe",
          "leadEmail": "john@example.com",
          "status": "scheduled"
        }
      }
    ],
    "total": 1
  }
}
```

### Get Meeting for Specific Appointment
```http
GET /api/zoom-integration/meetings/appointment/{appointmentId}
Authorization: Bearer {coach_token}
```

### Get Staff Appointments with Meetings
```http
GET /api/staff-dashboard/unified/appointments/staff/{staffId}?includeMeetings=true
Authorization: Bearer {staff_token}
```

## Staff Management & Transfer

### Transfer Appointment from Coach to Staff
```http
PUT /api/staff-dashboard/unified/appointments/transfer-from-coach
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "appointmentId": "64a1b2c3d4e5f6789012346",
  "staffId": "64a1b2c3d4e5f6789012348",
  "hostPermissions": {
    "hasHostAccess": true,
    "canStartMeeting": true,
    "canManageParticipants": true,
    "canShareScreen": true,
    "canRecordMeeting": false
  },
  "reason": "Coach unavailable, transferring to staff member",
  "notes": "Staff has full meeting control and can manage the session",
  "transferDate": "2024-12-20T10:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment transferred successfully",
  "data": {
    "appointmentId": "64a1b2c3d4e5f6789012346",
    "transferredTo": "64a1b2c3d4e5f6789012348",
    "transferredFrom": "64a1b2c3d4e5f6789012347",
    "hostPermissions": {
      "hasHostAccess": true,
      "canStartMeeting": true,
      "canManageParticipants": true,
      "canShareScreen": true,
      "canRecordMeeting": false,
      "transferredFromCoach": true,
      "originalCoachId": "64a1b2c3d4e5f6789012347"
    },
    "transferDate": "2024-12-20T10:00:00.000Z",
    "reason": "Coach unavailable, transferring to staff member"
  }
}
```

### Transfer Appointment Between Staff
```http
PUT /api/staff-dashboard/unified/appointments/transfer
Authorization: Bearer {staff_token}
```

**Request Body:**
```json
{
  "appointmentId": "64a1b2c3d4e5f6789012346",
  "fromStaffId": "64a1b2c3d4e5f6789012348",
  "toStaffId": "64a1b2c3d4e5f6789012349",
  "reason": "Staff member unavailable",
  "notes": "Transferring to backup staff member",
  "transferDate": "2024-12-20T10:00:00.000Z"
}
```

### Assign Appointment to Staff
```http
POST /api/staff-dashboard/unified/appointments/assign
Authorization: Bearer {staff_token}
```

**Request Body:**
```json
{
  "appointmentId": "64a1b2c3d4e5f6789012346",
  "staffId": "64a1b2c3d4e5f6789012348"
}
```

### Unassign Appointment from Staff
```http
PUT /api/staff-dashboard/unified/appointments/{appointmentId}/unassign
Authorization: Bearer {staff_token}
```

## Meeting Cleanup & Maintenance

### Start Automatic Cleanup
```http
POST /api/zoom-integration/cleanup/start
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "retentionDays": 2,
  "interval": "daily"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Zoom cleanup started with 2 days retention, interval: daily",
  "data": {
    "retentionDays": 2,
    "interval": "daily",
    "isRunning": true
  }
}
```

### Stop Automatic Cleanup
```http
POST /api/zoom-integration/cleanup/stop
Authorization: Bearer {coach_token}
```

### Manual Cleanup
```http
POST /api/zoom-integration/cleanup/manual
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "retentionDays": 3
}
```

### Get Cleanup Statistics
```http
GET /api/zoom-integration/cleanup/stats
Authorization: Bearer {coach_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "retentionDays": 2,
    "interval": "daily",
    "lastCleanup": "2024-12-20T02:00:00.000Z",
    "totalMeetingsDeleted": 15,
    "nextScheduledCleanup": "2024-12-21T02:00:00.000Z"
  }
}
```

### Update Retention Period
```http
PUT /api/zoom-integration/cleanup/retention
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "retentionDays": 7
}
```

## Integration Management

### Delete Zoom Integration
```http
DELETE /api/zoom-integration
Authorization: Bearer {coach_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Zoom integration deleted successfully"
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Client ID, Client Secret, Zoom Email, and Account ID are required"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions to transfer appointments"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Zoom integration not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to create Zoom meeting for appointment"
}
```

## Examples & Use Cases

### Complete Setup Workflow

1. **Get Setup Guide**
```http
GET /api/zoom-integration/setup-guide
```

2. **Setup Integration**
```http
POST /api/zoom-integration/setup
```

3. **Create Meeting Templates**
```http
POST /api/zoom-integration/meeting-templates
```

4. **Test Connection**
```http
POST /api/zoom-integration/test
```

### Complete Appointment Booking Workflow

1. **Get Available Slots**
```http
GET /api/coach-dashboard/available-slots?date=2024-12-20&duration=60
```

2. **Book Appointment**
```http
POST /api/coach-dashboard/appointments
```

3. **Get Meeting Details**
```http
GET /api/zoom-integration/meetings/appointment/{appointmentId}
```

### Complete Staff Transfer Workflow

1. **Transfer Appointment from Coach to Staff**
```http
PUT /api/staff-dashboard/unified/appointments/transfer-from-coach
```

2. **Verify Staff Access**
```http
GET /api/staff-dashboard/unified/appointments/staff/{staffId}
```

3. **Transfer Between Staff (if needed)**
```http
PUT /api/staff-dashboard/unified/appointments/transfer
```

### Meeting Cleanup Workflow

1. **Start Automatic Cleanup**
```http
POST /api/zoom-integration/cleanup/start
```

2. **Monitor Cleanup Stats**
```http
GET /api/zoom-integration/cleanup/stats
```

3. **Manual Cleanup (if needed)**
```http
POST /api/zoom-integration/cleanup/manual
```

## Postman Collection Usage

### Import the Collection
1. Download `Zoom-Integration-Complete-API-Collection.json`
2. Import into Postman
3. Set environment variables:
   - `base_url`: Your API base URL
   - `auth_token`: Your JWT token
   - `coach_id`: Your coach ID
   - `staff_id`: Staff member ID
   - `appointment_id`: Appointment ID
   - `lead_id`: Lead ID

### Using Pre-request Scripts
The collection includes pre-request scripts that:
- Auto-populate base URL if not set
- Add timestamps for unique requests

### Using Test Scripts
The collection includes test scripts that:
- Auto-extract IDs from responses
- Set variables for subsequent requests
- Parse meeting and appointment IDs

## Support & Resources

- **Zoom Marketplace**: https://marketplace.zoom.us/
- **Zoom Developer Docs**: https://developers.zoom.us/docs/api/
- **Server-to-Server OAuth Guide**: https://developers.zoom.us/docs/api/guide/using-oauth-credentials/
- **Setup Guide Endpoint**: `GET /api/zoom-integration/setup-guide`

## Rate Limits & Best Practices

- **API Rate Limits**: Respect Zoom API rate limits (typically 120 requests per minute)
- **Token Management**: OAuth tokens are automatically managed and refreshed
- **Error Handling**: Always implement proper error handling for API responses
- **Testing**: Use the test connection endpoint to verify credentials before production use
- **Cleanup**: Set up automatic cleanup to manage meeting storage and costs

---

**Note**: This documentation covers the complete Zoom integration API. All endpoints are fully functional and include comprehensive error handling, authentication, and response formatting.
