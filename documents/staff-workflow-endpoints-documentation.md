# Staff & Workflow Management - Complete Endpoints Documentation

## Overview
This document lists all staff and workflow related endpoints in the system. Each endpoint includes method, path, and brief description.

---

## 🔐 Staff Management Endpoints (`/api/staff`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Create staff member |
| `GET` | `/` | List all staff members |
| `GET` | `/search` | Search staff members |
| `GET` | `/stats` | Get staff statistics |
| `GET` | `/:id` | Get staff details |
| `PUT` | `/:id` | Update staff information |
| `DELETE` | `/:id` | Deactivate staff (soft delete) |
| `POST` | `/:id/permissions` | Update staff permissions |
| `POST` | `/:id/activate` | Activate staff account |
| `POST` | `/:id/reset-password` | Reset staff password |
| `GET` | `/:id/profile` | Get staff profile with stats |
| `PUT` | `/:id/profile` | Update staff profile |
| `GET` | `/:id/activity` | Get staff activity log |
| `POST` | `/:id/send-invitation` | Send invitation email |
| `GET` | `/:id/performance` | Get performance metrics |
| `GET` | `/:id/performance/trends` | Get performance trends |
| `GET` | `/performance/comparison` | Compare staff performance |
| `POST` | `/bulk-actions` | Bulk operations on staff |

---

## 📅 Staff Calendar Endpoints (`/api/staff-calendar`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Create calendar event |
| `GET` | `/` | List calendar events |
| `GET` | `/:id` | Get specific event |
| `PUT` | `/:id` | Update calendar event |
| `DELETE` | `/:id` | Delete calendar event |
| `GET` | `/staff/:staffId/availability` | Get staff availability |
| `POST` | `/bulk-create` | Bulk create events |

---

## 📋 Staff Appointment Endpoints (`/api/staff-appointments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/assign` | Assign appointment to staff |
| `GET` | `/available-staff` | Get available staff for assignment |
| `POST` | `/bulk-assign` | Bulk assign appointments |
| `GET` | `/staff/:staffId` | Get staff appointments |
| `GET` | `/staff/:staffId/calendar` | Get staff calendar view |
| `PUT` | `/:appointmentId/unassign` | Unassign appointment |

---

## 📊 Staff Dashboard Endpoints (`/api/staff-dashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/data` | Complete dashboard data |
| `GET` | `/overview` | Overview metrics |
| `GET` | `/tasks` | Task data |
| `GET` | `/performance` | Performance data |
| `GET` | `/achievements` | Achievements |
| `GET` | `/team` | Team data |
| `GET` | `/progress` | Staff progress over time |
| `GET` | `/comparison` | Staff comparison with team |
| `GET` | `/goals` | Goals and targets |
| `GET` | `/calendar` | Calendar view |
| `GET` | `/notifications` | Notifications |
| `GET` | `/analytics` | Analytics |

---

## 🏆 Staff Leaderboard Endpoints (`/api/staff-leaderboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get leaderboard |
| `GET` | `/staff/:staffId` | Get staff ranking |
| `GET` | `/stats` | Get leaderboard statistics |
| `POST` | `/recalculate` | Recalculate scores |
| `GET` | `/staff/:staffId/achievements` | Get staff achievements |
| `GET` | `/staff/:staffId/progress` | Get staff progress |
| `GET` | `/team-analytics` | Get team analytics |
| `GET` | `/most-improved` | Get most improved staff |
| `GET` | `/ranking-levels` | Get ranking levels configuration |
| `GET` | `/achievements` | Get achievements configuration |
| `GET` | `/scoring-weights` | Get scoring weights |
| `PUT` | `/scoring-weights` | Update scoring weights |
| `GET` | `/staff-comparison` | Get staff comparison |
| `GET` | `/team-performance-trends` | Get performance trends for all staff |

---

## 🔄 Workflow Management Endpoints (`/api/workflow`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/kanban-board` | Get Kanban board data |
| `POST` | `/tasks` | Create new task with intelligent assignment |
| `GET` | `/tasks` | Get all tasks with filtering |
| `GET` | `/tasks/:id` | Get single task details |
| `PUT` | `/tasks/:id` | Update task |
| `DELETE` | `/tasks/:id` | Delete task |
| `PUT` | `/tasks/:taskId/move` | Move task between stages (Kanban) |
| `POST` | `/tasks/:id/comments` | Add comment to task |
| `POST` | `/tasks/:id/time-log` | Log time to task |
| `POST` | `/tasks/:id/subtasks` | Add subtask |
| `GET` | `/tasks/:id/dependencies` | Get task dependencies |
| `POST` | `/tasks/:id/dependencies` | Add task dependency |
| `DELETE` | `/tasks/:id/dependencies/:dependencyId` | Remove task dependency |
| `GET` | `/analytics` | Get task analytics |
| `POST` | `/auto-assign` | Auto-assign unassigned tasks |
| `GET` | `/upcoming-tasks` | Get upcoming tasks |
| `PUT` | `/bulk-update-status` | Bulk update task status |
| `POST` | `/generate-sop` | Generate SOP for task type |
| `GET` | `/overdue-tasks` | Get overdue tasks |
| `GET` | `/tasks/stage/:stage` | Get tasks by stage |
| `POST` | `/tasks/from-lead/:leadId` | Create task from lead |

---

## 📋 Staff Task Management Endpoints (`/api/staff-tasks`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get staff's assigned tasks |
| `GET` | `/:id` | Get specific task details |
| `PUT` | `/:id/status` | Update task status |
| `POST` | `/:id/complete` | Mark task as complete |
| `POST` | `/:id/start` | Start working on task |
| `POST` | `/:id/pause` | Pause task work |
| `POST` | `/:id/comments` | Add comment to task |
| `POST` | `/:id/time-log` | Log time to task |
| `GET` | `/my-tasks` | Get staff's personal task overview |
| `GET` | `/overdue` | Get staff's overdue tasks |
| `GET` | `/upcoming` | Get staff's upcoming tasks |
| `PUT` | `/bulk-update` | Bulk update multiple tasks |

---

## 📈 Summary Statistics

### Total Endpoints by Category:
- **Staff Management**: 18 endpoints
- **Staff Calendar**: 7 endpoints  
- **Staff Appointments**: 6 endpoints
- **Staff Dashboard**: 12 endpoints
- **Staff Leaderboard**: 14 endpoints
- **Workflow Management**: 20 endpoints
- **Staff Task Management**: 12 endpoints

### **Grand Total: 89 Staff & Workflow Related Endpoints**

---

## 🔐 Authentication & Authorization

All endpoints require authentication via Bearer token. Access levels:
- **Coach**: Can manage their own staff and workflows
- **Admin/Super Admin**: Can manage all staff and workflows
- **Staff**: Can access their own data and assigned tasks

---

*Last Updated: January 2024*
*Version: 1.0.0*
