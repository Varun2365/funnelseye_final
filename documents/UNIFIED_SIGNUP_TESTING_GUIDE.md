# 🔐 Unified Signup System Testing Guide

## Overview
The system now has a **unified signup approach** where:
- **Everyone signs up the same way** using `/api/auth/signup`
- **MLM coaches can be created during signup** by setting `role: 'coach'`
- **Existing users can upgrade to coaches later** using `/api/auth/upgrade-to-coach`
- **No separate MLM signup process needed**

## 🧪 Testing Scenarios

### 1. **Regular User Signup** (Non-MLM)
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Passw0rd!",
  "role": "client"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. An OTP has been sent to your email for verification.",
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "email": "john@example.com",
  "role": "client"
}
```

**What Happens Backend:**
- Creates basic user account
- Sends OTP for verification
- User can access platform features (no MLM access)

---

### 2. **Coach Signup During Registration** (MLM)
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "name": "Sarah Coach",
  "email": "sarah@example.com",
  "password": "Passw0rd!",
  "role": "coach",
  "sponsorId": "W1234567",
  "teamRankName": "Team A",
  "presidentTeamRankName": "President Team"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Coach registered successfully with MLM hierarchy. An OTP has been sent to your email for verification.",
  "userId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "email": "sarah@example.com",
  "role": "coach",
  "selfCoachId": "W1703123456789",
  "message": "You can now build your downline and earn commissions!"
}
```

**What Happens Backend:**
- Creates coach account with MLM hierarchy
- Generates unique `selfCoachId` (W + timestamp + random)
- Sets `currentLevel: 1` and `hierarchyLocked: false`
- Links to sponsor if provided
- Sends OTP for verification
- User can immediately access MLM features

---

### 3. **Upgrade Existing User to Coach** (Later MLM Join)
**Endpoint:** `POST /api/auth/upgrade-to-coach`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Request Body:**
```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "sponsorId": "W1234567",
  "teamRankName": "Team B"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User successfully upgraded to coach with MLM hierarchy!",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "coach",
    "selfCoachId": "W1703123456790",
    "currentLevel": 1
  },
  "message": "You can now build your downline and earn commissions!"
}
```

**What Happens Backend:**
- Finds existing verified user
- Changes role from `client` to `coach`
- Generates new unique `selfCoachId`
- Sets MLM hierarchy fields
- User now has access to MLM features

---

## 🔍 Testing Checklist

### ✅ **Basic Signup Testing**
- [ ] Regular user signup (role: client)
- [ ] Admin signup (role: admin)
- [ ] Coach signup during registration (role: coach)
- [ ] Coach signup with sponsor details
- [ ] Coach signup without sponsor details

### ✅ **Upgrade Testing**
- [ ] Upgrade verified client to coach
- [ ] Upgrade verified client to coach with sponsor
- [ ] Try to upgrade unverified user (should fail)
- [ ] Try to upgrade existing coach (should fail)

### ✅ **Validation Testing**
- [ ] Missing required fields (should fail)
- [ ] Invalid role (should fail)
- [ ] Duplicate email (should fail)
- [ ] Invalid sponsor ID format

### ✅ **MLM Integration Testing**
- [ ] New coach appears in MLM hierarchy
- [ ] Coach can access MLM routes
- [ ] Sponsor relationship is established
- [ ] Team performance tracking works

---

## 🚀 **Quick Test Sequence**

1. **Test Regular Signup:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"Passw0rd!","role":"client"}'
   ```

2. **Test Coach Signup:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Coach","email":"coach@example.com","password":"Passw0rd!","role":"coach","teamRankName":"Test Team"}'
   ```

3. **Test Upgrade to Coach:**
   ```bash
   # First login to get token
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Passw0rd!"}'
   
   # Then upgrade to coach
   curl -X POST http://localhost:3000/api/auth/upgrade-to-coach \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"userId":"<USER_ID>"}'
   ```

---

## 💡 **Key Benefits of Unified System**

1. **Single Entry Point:** All users sign up the same way
2. **Flexible MLM Join:** Users can become coaches anytime
3. **No Duplicate Accounts:** One account, multiple role possibilities
4. **Seamless Upgrade:** Easy transition from client to coach
5. **Consistent Experience:** Same verification and login process

---

## 🔧 **Backend Processing Flow**

### **During Signup:**
1. Validate input fields
2. Check email uniqueness
3. If role is 'coach':
   - Generate unique `selfCoachId`
   - Set MLM hierarchy fields
   - Create Coach discriminator
4. Create user account
5. Send OTP for verification

### **During Upgrade:**
1. Verify user exists and is verified
2. Check current role (must not be coach)
3. Generate new `selfCoachId`
4. Update role and MLM fields
5. Save changes

### **After Both:**
1. User can verify with OTP
2. Coach users get access to MLM routes
3. Regular users get basic platform access
4. All users can upgrade to coach later

---

## 🚨 **Common Issues & Solutions**

### **Issue: "User is already a coach"**
- **Cause:** Trying to upgrade someone already in MLM
- **Solution:** Check current role before upgrade

### **Issue: "User must be verified before becoming coach"**
- **Cause:** Trying to upgrade unverified user
- **Solution:** Complete OTP verification first

### **Issue: "Invalid sponsor ID"**
- **Cause:** Sponsor doesn't exist in system
- **Solution:** Use valid sponsor ID or leave empty

---

## 📝 **Notes for Testing**

- **OTP Verification:** All signups require email verification
- **JWT Tokens:** Upgrade route requires authentication
- **Role Changes:** Once a coach, cannot change back to client
- **Sponsor Linking:** Optional during signup/upgrade
- **Team Names:** Can be set later through MLM routes

This unified system makes it much easier for users to join the MLM network while maintaining a clean, single signup process!
