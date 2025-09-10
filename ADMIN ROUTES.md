# ADMIN ROUTES DOCUMENTATION

This document provides a comprehensive overview of all admin routes available in the YCT Final project. All admin routes require proper authentication using `verifyAdminToken` middleware and appropriate permissions.

## Table of Contents

1. [Authentication Routes](#authentication-routes)
2. [User Management Routes](#user-management-routes)
3. [Financial Management Routes](#financial-management-routes)
4. [System Management Routes](#system-management-routes)
5. [Security & Compliance Routes](#security--compliance-routes)
6. [Audit Logs Routes](#audit-logs-routes)
7. [MLM Management Routes](#mlm-management-routes)
8. [Product Management Routes](#product-management-routes)
9. [Payment Management Routes](#payment-management-routes)
10. [Advanced MLM Routes](#advanced-mlm-routes)

---

## Authentication Routes

**Base Path:** `/api/admin/auth`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/login` | Admin login | Public |
| POST | `/logout` | Admin logout | Private (Admin) |
| GET | `/profile` | Get admin profile | Private (Admin) |
| PUT | `/profile` | Update admin profile | Private (Admin) |
| PUT | `/change-password` | Change admin password | Private (Admin) |
| GET | `/verify` | Verify admin token | Private (Admin) |
| POST | `/refresh` | Refresh admin token | Private (Admin) |

**Rate Limiting:** Login endpoint has 5 requests per 15 minutes limit.

---

## User Management Routes

**Base Path:** `/api/admin/users`

| Method | Endpoint | Description | Access | Permission Required |
|--------|----------|-------------|---------|-------------------|
| GET | `/` | Get all users with filtering and pagination | Private (Admin) | userManagement |
| GET | `/:id` | Get user by ID | Private (Admin) | userManagement |
| PUT | `/:id` | Update user | Private (Admin) | userManagement |
| PATCH | `/:id/status` | Update user status | Private (Admin) | userManagement |
| DELETE | `/:id` | Delete user (soft delete) | Private (Admin) | userManagement |
| GET | `/analytics` | Get user analytics | Private (Admin) | viewAnalytics |
| POST | `/bulk-update` | Bulk update users | Private (Admin) | userManagement |
| GET | `/export` | Export users data | Private (Admin) | exportData |

**Rate Limiting:**
- Update user: 20 requests per 5 minutes
- Update status: 10 requests per 5 minutes
- Delete user: 5 requests per 15 minutes
- Bulk update: 5 requests per 15 minutes
- Export: 5 requests per hour

---

## Financial Management Routes

**Base Path:** `/api/admin/financial`

### Credit System Management
| Method | Endpoint | Description | Access | Permission Required |
|--------|----------|-------------|---------|-------------------|
| GET | `/credit-system` | Get credit system configuration | Private (Admin) | systemSettings |
| PUT | `/credit-system` | Update credit system configuration | Private (Admin) | systemSettings |
| GET | `/credit-packages` | Get credit packages | Private (Admin) | viewAnalytics |
| GET | `/credit-usage` | Get credit usage analytics | Private (Admin) | viewAnalytics |

### Revenue & Analytics
| Method | Endpoint | Description | Access | Permission Required |
|--------|----------|-------------|---------|-------------------|
| GET | `/revenue-analytics` | Get revenue analytics | Private (Admin) | viewAnalytics |
| GET | `/payment-failures` | Get payment failure analytics | Private (Admin) | viewAnalytics |
| GET | `/gateway-markup` | Get gateway markup analytics | Private (Admin) | viewAnalytics |
| GET | `/payment-analytics` | Get payment analytics (enhanced) | Private (Admin) | financialReports |

### Payment Settings & Commission Payouts
| Method | Endpoint | Description | Access | Permission Required |
|--------|----------|-------------|---------|-------------------|
| GET | `/payment-settings` | Get payment settings | Private (Admin) | paymentSettings |
| PUT | `/payment-settings` | Update payment settings | Private (Admin) | paymentSettings |
| GET | `/commission-payouts` | Get commission payouts | Private (Admin) | financialReports |
| POST | `/commission-payouts/:paymentId/process` | Process commission payout | Private (Admin) | paymentManagement |

### Payment Gateway Management
| Method | Endpoint | Description | Access | Permission Required |
|--------|----------|-------------|---------|-------------------|
| GET | `/payment-gateways` | Get payment gateway configurations | Private (Admin) | paymentSettings |
| PUT | `/payment-gateways/:gatewayName` | Update payment gateway configuration | Private (Admin) | paymentSettings |
| POST | `/payment-gateways/:gatewayName/test` | Test payment gateway | Private (Admin) | paymentSettings |

**Rate Limiting:**
- Update payment settings: 10 requests per 5 minutes
- Process commission payout: 20 requests per 5 minutes
- Update gateway: 10 requests per 5 minutes
- Test gateway: 5 requests per 15 minutes

---

## System Management Routes

**Base Path:** `/api/admin/system`

| Method | Endpoint | Description | Access | Permission Required |
|--------|----------|-------------|---------|-------------------|
| GET | `/dashboard` | Get system dashboard data | Private (Admin) | viewAnalytics |
| GET | `/health` | Get system health status | Private (Admin) | systemLogs |
| GET | `/settings` | Get system settings | Private (Admin) | systemSettings |
| PUT | `/settings` | Update system settings | Private (Admin) | systemSettings |
| PATCH | `/settings/:section` | Update specific settings section | Private (Admin) | systemSettings |
| POST | `/maintenance` | Toggle maintenance mode | Private (Admin) | maintenanceMode |
| GET | `/logs` | Get system logs | Private (Admin) | systemLogs |
| DELETE | `/logs` | Clear old system logs | Private (Admin) | systemLogs |
| GET | `/analytics` | Get system analytics | Private (Admin) | viewAnalytics |
| GET | `/analytics/export` | Export system analytics | Private (Admin) | exportData |

**Rate Limiting:**
- Update settings: 10 requests per 5 minutes
- Update section: 20 requests per 5 minutes
- Maintenance mode: 5 requests per 15 minutes
- Clear logs: 5 requests per hour
- Export analytics: 5 requests per hour

---

## Security & Compliance Routes

**Base Path:** `/api/admin/security`

| Method | Endpoint | Description | Access | Permission Required |
|--------|----------|-------------|---------|-------------------|
| GET | `/settings` | Get security settings | Private (Admin) | systemSettings |
| PUT | `/settings` | Update security settings | Private (Admin) | systemSettings |
| GET | `/active-sessions` | Get active sessions | Private (Admin) | systemSettings |
| DELETE | `/sessions/:sessionId` | Terminate session | Private (Admin) | systemSettings |
| GET | `/incidents` | Get security incidents | Private (Admin) | viewAnalytics |
| GET | `/threat-summary` | Get threat detection summary | Private (Admin) | viewAnalytics |
| PUT | `/mfa/:adminId` | Enable/disable MFA for admin | Private (Admin) | systemSettings |
| GET | `/compliance` | Get compliance report | Private (Admin) | viewAnalytics |

**Rate Limiting:**
- Update settings: 10 requests per 5 minutes
- Terminate session: 10 requests per 5 minutes
- Update MFA: 10 requests per 5 minutes

---

## Audit Logs Routes

**Base Path:** `/api/admin/audit-logs`

| Method | Endpoint | Description | Access | Permission Required |
|--------|----------|-------------|---------|-------------------|
| GET | `/` | Get audit logs with filtering and pagination | Private (Admin) | systemLogs |
| GET | `/export` | Export audit logs | Private (Admin) | exportData |
| GET | `/:id` | Get specific audit log details | Private (Admin) | systemLogs |

**Rate Limiting:**
- Export logs: 5 requests per hour

---

## MLM Management Routes

**Base Path:** `/api/admin/mlm`

| Method | Endpoint | Description | Access | Permission Required |
|--------|----------|-------------|---------|-------------------|
| GET | `/commission-structure` | Get MLM commission structure | Private (Admin) | systemSettings |
| PUT | `/commission-structure` | Update MLM commission structure | Private (Admin) | systemSettings |
| GET | `/analytics` | Get MLM performance analytics | Private (Admin) | viewAnalytics |
| GET | `/pending-payouts` | Get pending payouts | Private (Admin) | paymentManagement |
| POST | `/process-payouts` | Process payouts | Private (Admin) | paymentManagement |
| GET | `/eligibility-report` | Get commission eligibility report | Private (Admin) | viewAnalytics |

---

## Product Management Routes

**Base Path:** `/api/paymentsv1/admin/products`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/` | Create a new admin product | Private (Admin) |
| GET | `/` | Get all admin products | Private (Admin) |
| GET | `/available-for-coaches` | Get products available for coaches | Private (Admin) |
| GET | `/:productId` | Get admin product by ID | Private (Admin) |
| PUT | `/:productId` | Update admin product | Private (Admin) |
| DELETE | `/:productId` | Delete admin product | Private (Admin) |
| GET | `/:productId/stats` | Get product statistics | Private (Admin) |
| PUT | `/:productId/status` | Update product status | Private (Admin) |

---

## Payment Management Routes

### Razorpay Payout Management
**Base Path:** `/api/paymentsv1/sending`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/setup-razorpay-coach/:coachId` | Setup coach for Razorpay payouts | Private (Admin) |
| POST | `/razorpay-payout` | Process Razorpay payout | Private (Admin) |
| POST | `/monthly-razorpay-payouts` | Process monthly Razorpay payouts | Private (Admin) |
| POST | `/monthly-mlm-commission-payouts` | Process monthly MLM commission payouts | Private (Admin) |
| GET | `/mlm-commission-summary/:coachId` | Get MLM commission summary for coach | Private (Admin) |
| GET | `/razorpay-payout-status/:payoutId` | Get Razorpay payout status | Private (Admin) |
| POST | `/sync-razorpay-status/:payoutId` | Sync Razorpay payout status | Private (Admin) |
| GET | `/pending-payouts` | Get pending payouts | Private (Admin) |
| GET | `/payout-statistics` | Get payout statistics | Private (Admin) |
| PUT | `/payout/:payoutId/status` | Update payout status | Private (Admin) |

### MLM Commission Settings
**Base Path:** `/api/paymentsv1/admin`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/update-mlm-commission-settings` | Update MLM commission settings | Private (Admin) |
| GET | `/mlm-commission-settings` | Get current MLM commission settings | Private (Admin) |
| POST | `/razorpay-config` | Update Razorpay configuration settings | Private (Admin) |
| POST | `/setup-coach-payment-collection/:coachId` | Setup coach payment collection | Private (Admin) |
| GET | `/razorpay-status` | Check Razorpay configuration status | Private (Admin) |
| GET | `/test-razorpay` | Test Razorpay module functionality | Private (Admin) |

### Unified Payment Management
**Base Path:** `/api/unified-payments`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/settings` | Get global payment settings | Private (Admin) |
| PUT | `/settings` | Update global payment settings | Private (Admin) |
| GET | `/admin/payments` | Get all payments (Admin) | Private (Admin) |
| PUT | `/admin/payment/:id/status` | Update payment status (Admin) | Private (Admin) |
| DELETE | `/admin/payment/:id` | Delete payment (Admin) | Private (Admin) |

### Funnelseye Payment Management
**Base Path:** `/api/funnelseye-payments/admin`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/payments` | Get all payments (admin) | Private (Admin) |
| PUT | `/payment/:paymentId/status` | Update payment status (admin) | Private (Admin) |
| GET | `/gateways` | Get payment gateway configurations | Private (Admin) |
| POST | `/gateway` | Create payment gateway configuration | Private (Admin) |
| PUT | `/gateway/:gatewayName` | Update payment gateway configuration | Private (Admin) |
| DELETE | `/gateway/:gatewayName` | Delete payment gateway configuration | Private (Admin) |
| POST | `/gateway/:gatewayName/test` | Test payment gateway | Private (Admin) |

### Coach Payment Analytics
**Base Path:** `/api/coach-payments/admin`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/analytics` | Get admin payment analytics | Private (Admin) |

---

## Advanced MLM Routes

**Base Path:** `/api/advanced-mlm/admin`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/pending-requests` | Get all pending admin requests | Private (Admin) |
| PUT | `/process-request/:requestId` | Process admin request (approve/reject) | Private (Admin) |
| PUT | `/change-upline` | Change coach upline | Private (Admin) |
| GET | `/commission-settings` | Get commission settings | Private (Admin) |
| PUT | `/commission-settings` | Update commission settings | Private (Admin) |
| POST | `/calculate-commission` | Calculate and create commission for subscription | Private (Admin) |
| POST | `/process-monthly-commissions` | Process monthly commission payments | Private (Admin) |

---

## Authentication & Authorization

### Middleware Used
- **`verifyAdminToken`**: Verifies admin JWT token
- **`checkAdminPermission`**: Checks specific admin permissions
- **`adminRateLimit`**: Applies rate limiting to admin routes
- **`logAdminActivity`**: Logs admin activities for audit

### Permission Types
- `userManagement`: User CRUD operations
- `systemSettings`: System configuration access
- `viewAnalytics`: Analytics and reporting access
- `paymentSettings`: Payment configuration access
- `paymentManagement`: Payment processing access
- `financialReports`: Financial reporting access
- `systemLogs`: System logs access
- `maintenanceMode`: Maintenance mode control
- `exportData`: Data export permissions

### Rate Limiting
Most admin routes have rate limiting applied to prevent abuse:
- **Low frequency operations** (5 requests per 15 minutes): Login, maintenance mode, bulk operations
- **Medium frequency operations** (10 requests per 5 minutes): Settings updates, user management
- **High frequency operations** (20 requests per 5 minutes): Payment processing, analytics queries
- **Export operations** (5 requests per hour): Data export endpoints

---

## Notes

1. **Authentication**: All admin routes require valid admin JWT token
2. **Permissions**: Most routes require specific admin permissions
3. **Rate Limiting**: Applied to prevent abuse and ensure system stability
4. **Audit Logging**: All admin activities are logged for security and compliance
5. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
6. **Validation**: Input validation on all endpoints
7. **Documentation**: All routes include comprehensive JSDoc comments

---

*Last Updated: $(date)*
*Total Admin Routes: 100+*
