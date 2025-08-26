# 🚀 Advanced MLM System with Hierarchy Management & Commission System

## 📖 What is This System?

Think of this like a **digital family tree for business people** (we call them "coaches") where everyone can help each other grow and earn money together. It's like having a big team where each person can have their own smaller team under them.

## 🎯 Real-Life Example

Imagine you're starting a fitness coaching business:

1. **You** are the main coach (Level 1)
2. **Your friends** who join under you become Level 2 coaches
3. **Their friends** who join become Level 3 coaches
4. And so on...

When any of these coaches make money, you get a small percentage as a "thank you" for helping them get started. This is called a **commission**.

## 🏗️ How the System Works (In Simple Terms)

### 🌱 Planting Seeds (Coach Signup)
- New coaches join the system
- They pick who they want to work with (their "sponsor")
- The system creates a unique ID for each coach (like a special name tag)
- They get placed in the right spot in the team tree

### 🌳 Growing the Tree (Building Teams)
- Coaches can add more people to their team
- Each new person becomes part of a bigger family
- The system keeps track of who works with whom
- Everyone can see their team structure

### 💰 Sharing the Success (Commissions)
- When coaches make money, the system calculates who should get a bonus
- Higher-level coaches get a small cut from their team's earnings
- It's like a "thank you" for building and leading the team
- The system automatically figures out who gets what

### 📊 Keeping Track (Reports & Analytics)
- Coaches can see how their team is performing
- They get reports showing who's doing well
- The system tracks progress over time
- It's like having a scoreboard for your business

## 🔧 How Each Route Works (Backend Magic Explained)

### 🌟 **Public Routes (Anyone Can Use)**

#### 1. **Get Hierarchy Levels** - `GET /api/advanced-mlm/hierarchy-levels`
**What it does:** Shows all the different levels in the system
**Real-life example:** Like showing the different ranks in a video game (Beginner, Intermediate, Advanced, Expert)
**What happens in the backend:**
- The system looks at a special list of all possible levels
- It checks if this list exists in the database
- If not, it creates the basic levels (Level 1, Level 2, Level 3, etc.)
- It sends back all the levels with their names and descriptions
- It's like opening a menu and seeing all the available options

#### 2. **Generate Coach ID** - `POST /api/advanced-mlm/generate-coach-id`
**What it does:** Creates a unique identification number for new coaches
**Real-life example:** Like getting a student ID when you join a school
**What happens in the backend:**
- The system looks at how many coaches already exist
- It creates a new number by adding 1 to the last coach's number
- It formats this number nicely (like "COACH-2024-0001")
- It checks if this number is already taken (to avoid duplicates)
- It saves this new ID in the database
- It's like a librarian giving you the next available library card number

#### 3. **Search for Sponsors** - `GET /api/advanced-mlm/search-sponsor`
**What it does:** Helps new coaches find experienced coaches to work with
**Real-life example:** Like looking for a mentor or teacher to guide you
**What happens in the backend:**
- The system takes the search word (like "John" or "Sarah")
- It looks through all existing coaches in the database
- It matches names, emails, or coach IDs that contain the search word
- It filters out coaches who are already too busy or inactive
- It sends back a list of potential sponsors with their details
- It's like using Google to find people who can help you

#### 4. **Create External Sponsor** - `POST /api/advanced-mlm/external-sponsor`
**What it does:** Adds someone from outside the system as a sponsor
**Real-life example:** Like adding your uncle who's a successful businessman to your business network
**What happens in the backend:**
- The system takes the person's information (name, phone, email, company)
- It creates a new record in the database for this external person
- It gives them a special status showing they're not a full coach yet
- It saves their contact information for future reference
- It sends back a confirmation that the sponsor was created
- It's like adding a new contact to your phone's address book

#### 5. **Coach Signup with Hierarchy** - `POST /api/advanced-mlm/signup`
**What it does:** Creates a new coach account and places them in the right team position
**Real-life example:** Like joining a sports team and being assigned to a specific position
**What happens in the backend:**
- The system takes all the coach's information (name, email, password, etc.)
- It checks if the email is already used (to avoid duplicates)
- It creates a new user account with the provided details
- It places the coach in the correct level and team based on their choices
- It connects them to their chosen sponsor
- It sends a welcome email and creates their profile
- It's like a school registrar creating your student file and assigning you to a class

### 🔒 **Private Routes (Only for Logged-in Coaches)**

#### 6. **Lock Hierarchy** - `POST /api/advanced-mlm/lock-hierarchy`
**What it does:** Prevents coaches from changing their team position after they start
**Real-life example:** Like locking your house door after you move in - you can't just pick up and move to a different house
**What happens in the backend:**
- The system checks if the coach is logged in and verified
- It looks at the coach's current position in the team
- It marks their position as "locked" in the database
- It prevents any future changes to their team placement
- It sends back a confirmation that their position is now secure
- It's like a security guard putting a seal on your office door

#### 7. **Submit Admin Request** - `POST /api/advanced-mlm/admin-request`
**What it does:** Allows coaches to ask for special changes to their account
**Real-life example:** Like writing a letter to the principal asking to change your class schedule
**What happens in the backend:**
- The system takes the coach's request details (what they want to change and why)
- It creates a new "ticket" in the database for this request
- It marks the request as "pending" (waiting for approval)
- It notifies the admin team that there's a new request to review
- It sends back a confirmation with a request number
- It's like a customer service representative creating a support ticket for you

#### 8. **Get Coach Commissions** - `GET /api/advanced-mlm/commissions/:coachId`
**What it does:** Shows how much money a coach has earned from their team
**Real-life example:** Like checking your bank statement to see how much interest you've earned
**What happens in the backend:**
- The system looks up the coach's ID in the database
- It finds all the commission records for this coach
- It calculates the total earnings from different sources
- It groups the earnings by month and year
- It shows pending commissions (money not yet paid)
- It's like an accountant going through your financial records and creating a summary

### 👥 **Team Management Routes**

#### 9. **Add Downline Coach** - `POST /api/advanced-mlm/downline`
**What it does:** Adds a new coach to someone's team
**Real-life example:** Like hiring a new employee to work in your department
**What happens in the backend:**
- The system takes the new coach's information
- It creates a new user account for them
- It places them under the specified sponsor in the team structure
- It sends them a welcome email with login instructions
- It updates the sponsor's team statistics
- It's like HR processing a new hire and adding them to the company directory

#### 10. **Get Direct Downline** - `GET /api/advanced-mlm/downline/:sponsorId`
**What it does:** Shows all the coaches directly under a specific sponsor
**Real-life example:** Like looking at your class roster to see all the students in your class
**What happens in the backend:**
- The system finds the sponsor's ID in the database
- It looks for all coaches who have this person as their direct sponsor
- It gets basic information about each team member
- It calculates their performance metrics (if requested)
- It sends back a list of all direct team members
- It's like a teacher looking up their class list and seeing each student's grades

#### 11. **Get Full Hierarchy** - `GET /api/advanced-mlm/hierarchy/:coachId`
**What it does:** Shows the complete team structure under a coach
**Real-life example:** Like looking at a family tree that shows everyone from grandparents to great-grandchildren
**What happens in the backend:**
- The system starts with the specified coach
- It finds all their direct team members
- For each of those, it finds their team members
- It continues this process for the requested number of levels
- It creates a tree-like structure showing all relationships
- It's like a genealogist researching your family history and creating a family tree

### 📊 **Performance & Reporting Routes**

#### 12. **Get Team Performance** - `GET /api/advanced-mlm/team-performance/:sponsorId`
**What it does:** Shows how well a coach's entire team is performing
**Real-life example:** Like a sports coach getting a report card showing how all their players are doing
**What happens in the backend:**
- The system looks at all team members under the sponsor
- It collects data about their sales, commissions, and activities
- It calculates team totals and averages
- It compares current performance to previous periods
- It identifies top performers and areas for improvement
- It's like a business analyst creating a comprehensive report for the CEO

#### 13. **Generate Team Report** - `POST /api/advanced-mlm/generate-report`
**What it does:** Creates a detailed analysis of team performance
**Real-life example:** Like asking a professional photographer to take pictures of your event and create a beautiful album
**What happens in the backend:**
- The system takes the report requirements (what data to include, time period)
- It gathers all the relevant information from the database
- It analyzes the data to find patterns and trends
- It creates charts and graphs showing performance
- It saves the report for future reference
- It's like a data scientist analyzing research data and writing a detailed report

### 👑 **Admin Routes (Only for System Administrators)**

#### 14. **Get Pending Admin Requests** - `GET /api/advanced-mlm/admin/pending-requests`
**What it does:** Shows all the requests from coaches that need admin approval
**Real-life example:** Like a teacher collecting all the permission slips that need to be signed
**What happens in the backend:**
- The system checks if the user has admin privileges
- It searches the database for all requests marked as "pending"
- It sorts them by date (oldest first)
- It shows the details of each request
- It allows admins to see what needs their attention
- It's like a manager checking their inbox for items that need approval

#### 15. **Process Admin Request** - `PUT /api/advanced-mlm/admin/process-request/:requestId`
**What it does:** Allows admins to approve or reject coach requests
**Real-life example:** Like a principal approving or denying a student's request to change classes
**What happens in the backend:**
- The system checks if the user has admin privileges
- It finds the specific request in the database
- It updates the request status to "approved" or "rejected"
- It adds admin notes explaining the decision
- If approved, it makes the requested changes to the coach's account
- It notifies the coach about the decision
- It's like a judge making a ruling and updating the court records

#### 16. **Change Coach Upline** - `PUT /api/advanced-mlm/admin/change-upline`
**What it does:** Moves a coach to work under a different sponsor
**Real-life example:** Like transferring a student from one teacher's class to another
**What happens in the backend:**
- The system checks if the user has admin privileges
- It finds the coach's current position in the database
- It removes their connection to the old sponsor
- It creates a new connection to the new sponsor
- It updates all the team statistics for both sponsors
- It logs this change for audit purposes
- It's like a school administrator updating a student's class assignment

#### 17. **Get Commission Settings** - `GET /api/advanced-mlm/admin/commission-settings`
**What it does:** Shows the current rules for how commissions are calculated
**Real-life example:** Like looking at the rulebook that explains how points are scored in a game
**What happens in the backend:**
- The system checks if the user has admin privileges
- It looks up the commission configuration in the database
- It shows the percentage rates for different levels
- It displays minimum and maximum commission amounts
- It shows any special rules or exceptions
- It's like a bank manager checking the current interest rates

#### 18. **Update Commission Settings** - `PUT /api/advanced-mlm/admin/commission-settings`
**What it does:** Changes the rules for how commissions are calculated
**Real-life example:** Like updating the rules of a game to make it fairer or more exciting
**What happens in the backend:**
- The system checks if the user has admin privileges
- It takes the new commission rules from the admin
- It validates that the new rules make sense
- It updates the commission configuration in the database
- It logs this change for audit purposes
- It notifies relevant coaches about the rule changes
- It's like a game designer updating the rulebook and telling all players

#### 19. **Calculate Commission** - `POST /api/advanced-mlm/admin/calculate-commission`
**What it does:** Figures out how much commission should be paid for a specific sale
**Real-life example:** Like calculating how much tip a waiter should get based on the bill amount
**What happens in the backend:**
- The system takes the sale details (amount, who made the sale, who referred them)
- It looks up the commission rules for the relevant levels
- It calculates the commission for each level in the chain
- It checks if there are any special circumstances or bonuses
- It creates commission records in the database
- It's like a cashier calculating change by looking at the price and counting backwards

#### 20. **Process Monthly Commissions** - `POST /api/advanced-mlm/admin/process-monthly-commissions`
**What it does:** Pays out all the commissions earned in a specific month
**Real-life example:** Like a company doing payroll - calculating everyone's salary and sending out checks
**What happens in the backend:**
- The system looks at all commissions earned in the specified month
- It groups them by coach to see total earnings
- It checks if there are any pending issues or disputes
- It creates payment records for each coach
- It updates the commission status to "paid"
- It sends payment confirmations to coaches
- It's like an accountant processing monthly payroll for all employees

## 🎮 How It All Works Together (The Big Picture)

Think of this system like a **giant digital business game**:

1. **Players (Coaches)** join the game and get placed on teams
2. **Team Leaders (Sponsors)** help their team members succeed
3. **The Game Rules (Commission System)** determine how rewards are shared
4. **Scoreboards (Reports)** show how everyone is performing
5. **Game Masters (Admins)** can adjust rules and help players

## 🔄 The Daily Flow

### Morning:
- Coaches log in and check their team performance
- They see who needs help or encouragement
- They plan activities for the day

### During the Day:
- Coaches work with their team members
- They make sales and earn commissions
- The system automatically tracks everything

### Evening:
- Coaches review their daily progress
- They see how much money they've earned
- They plan improvements for tomorrow

## 💡 Why This System is Awesome

1. **Fair Play:** Everyone knows the rules and can see how they're doing
2. **Team Support:** Coaches help each other succeed
3. **Automatic Tracking:** No need to manually calculate commissions
4. **Growth Opportunities:** Coaches can build bigger teams over time
5. **Transparency:** Everyone can see their performance and earnings

## 🚀 Getting Started

1. **Join the System:** Sign up as a new coach
2. **Choose Your Sponsor:** Pick someone experienced to guide you
3. **Build Your Team:** Start adding people to your team
4. **Earn Commissions:** Make sales and earn money from your team
5. **Grow and Scale:** Help your team members build their own teams

## 🎯 Success Tips

- **Be Patient:** Building a team takes time
- **Help Others:** The more you help your team, the more you earn
- **Stay Active:** Regular activity keeps your team motivated
- **Learn and Grow:** Take advantage of training and support
- **Follow the Rules:** Play fair and everyone benefits

## 🔧 Technical Features

- **Real-time Updates:** See changes immediately
- **Secure Access:** Only authorized users can see sensitive information
- **Mobile Friendly:** Works on phones, tablets, and computers
- **Backup Systems:** Your data is safe and secure
- **24/7 Availability:** Access your information anytime, anywhere

## 📞 Need Help?

If you have questions or need assistance:
- Check the help documentation
- Contact your team leader
- Reach out to system administrators
- Use the built-in support features

---

**Remember:** This system is designed to help everyone succeed together. The more you help your team, the more successful you'll become! 🚀✨

# FunnelsEye Advanced MLM System Documentation

## 📈 Funnel Management System

The Funnel Management System provides comprehensive functionality for creating, managing, and tracking marketing funnels. This system allows coaches to build multi-stage conversion funnels with detailed analytics and event tracking.

### 🔗 Base URL
```
/api/funnels
```

---

## 📋 API Endpoints

### 1. **Get All Funnels for a Coach**
**GET** `/api/funnels/coach/:coachId/funnels`

**Description:** Retrieve all funnels associated with a specific coach.

**Authentication:** Required (Coach only)

**Path Parameters:**
- `coachId` (string, required): The unique identifier of the coach

**Query Parameters:** None

**Sample Request:**
```bash
GET /api/funnels/coach/64f1a2b3c4d5e6f7a8b9c0d1/funnels
Authorization: Bearer <jwt_token>
```

**Sample Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "coachId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Weight Loss Funnel",
      "description": "Complete weight loss transformation funnel",
      "isActive": true,
      "funnelUrl": "weight-loss-funnel",
      "customDomain": null,
      "targetAudience": "customer",
      "stages": [
        {
          "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
          "pageId": "landing-page",
          "name": "Landing Page",
          "type": "Landing",
          "selectedTemplateKey": "weight-loss-landing",
          "html": "<div>Welcome to our weight loss program...</div>",
          "css": "body { font-family: Arial; }",
          "js": "console.log('Landing page loaded');",
          "assets": ["image1.jpg", "video1.mp4"],
          "basicInfo": {
            "title": "Transform Your Life - Weight Loss Program",
            "description": "Join our proven weight loss program",
            "favicon": null,
            "keywords": "weight loss, transformation, fitness",
            "socialTitle": "Weight Loss Transformation",
            "socialImage": null,
            "socialDescription": "Start your weight loss journey today",
            "customHtmlHead": "",
            "customHtmlBody": ""
          },
          "order": 0,
          "isEnabled": true
        }
      ],
      "createdAt": "2024-01-20T10:00:00.000Z",
      "lastUpdated": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:00:00.000Z"
    }
  ]
}
```

---

### 2. **Get Single Funnel Details**
**GET** `/api/funnels/coach/:coachId/funnels/:funnelId`

**Description:** Retrieve detailed information about a specific funnel.

**Authentication:** Required (Coach only)

**Path Parameters:**
- `coachId` (string, required): The unique identifier of the coach
- `funnelId` (string, required): The unique identifier of the funnel

**Sample Request:**
```bash
GET /api/funnels/coach/64f1a2b3c4d5e6f7a8b9c0d1/funnels/64f1a2b3c4d5e6f7a8b9c0d2
Authorization: Bearer <jwt_token>
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "coachId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Weight Loss Funnel",
    "description": "Complete weight loss transformation funnel",
    "isActive": true,
    "funnelUrl": "weight-loss-funnel",
    "customDomain": null,
    "targetAudience": "customer",
    "stages": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
        "pageId": "landing-page",
        "name": "Landing Page",
        "type": "Landing",
        "selectedTemplateKey": "weight-loss-landing",
        "html": "<div>Welcome to our weight loss program...</div>",
        "css": "body { font-family: Arial; }",
        "js": "console.log('Landing page loaded');",
        "assets": ["image1.jpg", "video1.mp4"],
        "basicInfo": {
          "title": "Transform Your Life - Weight Loss Program",
          "description": "Join our proven weight loss program",
          "favicon": null,
          "keywords": "weight loss, transformation, fitness",
          "socialTitle": "Weight Loss Transformation",
          "socialImage": null,
          "socialDescription": "Start your weight loss journey today",
          "customHtmlHead": "",
          "customHtmlBody": ""
        },
        "order": 0,
        "isEnabled": true
      },
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
        "pageId": "checkout-page",
        "name": "Checkout Page",
        "type": "Checkout",
        "selectedTemplateKey": "weight-loss-checkout",
        "html": "<div>Complete your purchase...</div>",
        "css": "body { font-family: Arial; }",
        "js": "console.log('Checkout page loaded');",
        "assets": ["checkout-image.jpg"],
        "basicInfo": {
          "title": "Complete Your Purchase",
          "description": "Secure checkout for weight loss program",
          "favicon": null,
          "keywords": "checkout, purchase, weight loss",
          "socialTitle": "Complete Purchase",
          "socialImage": null,
          "socialDescription": "Secure checkout process",
          "customHtmlHead": "",
          "customHtmlBody": ""
        },
        "order": 1,
        "isEnabled": true
      }
    ],
    "createdAt": "2024-01-20T10:00:00.000Z",
    "lastUpdated": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

---

### 3. **Create New Funnel**
**POST** `/api/funnels/coach/:coachId/funnels`

**Description:** Create a new funnel for a coach.

**Authentication:** Required (Coach only)

**Path Parameters:**
- `coachId` (string, required): The unique identifier of the coach

**Request Body:**
```json
{
  "name": "Weight Loss Funnel",
  "description": "Complete weight loss transformation funnel",
  "funnelUrl": "weight-loss-funnel",
  "customDomain": null,
  "targetAudience": "customer",
  "stages": [
    {
      "pageId": "landing-page",
      "name": "Landing Page",
      "type": "Landing",
      "selectedTemplateKey": "weight-loss-landing",
      "html": "<div>Welcome to our weight loss program...</div>",
      "css": "body { font-family: Arial; }",
      "js": "console.log('Landing page loaded');",
      "assets": ["image1.jpg", "video1.mp4"],
      "basicInfo": {
        "title": "Transform Your Life - Weight Loss Program",
        "description": "Join our proven weight loss program",
        "favicon": null,
        "keywords": "weight loss, transformation, fitness",
        "socialTitle": "Weight Loss Transformation",
        "socialImage": null,
        "socialDescription": "Start your weight loss journey today",
        "customHtmlHead": "",
        "customHtmlBody": ""
      },
      "order": 0,
      "isEnabled": true
    }
  ]
}
```

**Field Descriptions:**

**Top Level Fields:**
- `name` (string, required): Funnel name (3-100 characters)
- `description` (string, optional): Funnel description (max 500 characters)
- `funnelUrl` (string, required): Unique URL slug for the funnel
- `customDomain` (string, optional): Custom domain if applicable
- `targetAudience` (string, required): Either "customer" or "coach"
- `stages` (array, optional): Array of funnel stages

**Stage Fields:**
- `pageId` (string, required): Unique identifier for the stage within the funnel
- `name` (string, required): Display name of the stage
- `type` (string, required): Type of stage (e.g., "Landing", "Checkout", "ThankYou")
- `selectedTemplateKey` (string, optional): Template identifier
- `html` (string, required): HTML content for the stage
- `css` (string, optional): CSS styles for the stage
- `js` (string, optional): JavaScript code for the stage
- `assets` (array, optional): Array of asset file names
- `basicInfo` (object, required): SEO and social media information
- `order` (number, optional): Display order of the stage
- `isEnabled` (boolean, optional): Whether the stage is active

**Basic Info Fields:**
- `title` (string, required): Page title for SEO
- `description` (string, optional): Meta description
- `favicon` (string, optional): Favicon URL
- `keywords` (string, optional): Meta keywords
- `socialTitle` (string, optional): Social media title
- `socialImage` (string, optional): Social media image URL
- `socialDescription` (string, optional): Social media description
- `customHtmlHead` (string, optional): Custom HTML for head section
- `customHtmlBody` (string, optional): Custom HTML for body section

**Sample Request:**
```bash
POST /api/funnels/coach/64f1a2b3c4d5e6f7a8b9c0d1/funnels
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Weight Loss Funnel",
  "description": "Complete weight loss transformation funnel",
  "funnelUrl": "weight-loss-funnel",
  "targetAudience": "customer",
  "stages": []
}
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "coachId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Weight Loss Funnel",
    "description": "Complete weight loss transformation funnel",
    "isActive": true,
    "funnelUrl": "weight-loss-funnel",
    "customDomain": null,
    "targetAudience": "customer",
    "stages": [],
    "createdAt": "2024-01-20T10:00:00.000Z",
    "lastUpdated": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

---

### 4. **Update Funnel**
**PUT** `/api/funnels/coach/:coachId/funnels/:funnelId`

**Description:** Update an existing funnel.

**Authentication:** Required (Coach only)

**Path Parameters:**
- `coachId` (string, required): The unique identifier of the coach
- `funnelId` (string, required): The unique identifier of the funnel

**Request Body:** Partial or complete funnel data (same structure as create)

**Sample Request:**
```bash
PUT /api/funnels/coach/64f1a2b3c4d5e6f7a8b9c0d1/funnels/64f1a2b3c4d5e6f7a8b9c0d2
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Weight Loss Funnel",
  "description": "Enhanced weight loss transformation funnel"
}
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "coachId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Updated Weight Loss Funnel",
    "description": "Enhanced weight loss transformation funnel",
    "isActive": true,
    "funnelUrl": "weight-loss-funnel",
    "customDomain": null,
    "targetAudience": "customer",
    "stages": [],
    "createdAt": "2024-01-20T10:00:00.000Z",
    "lastUpdated": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

---

### 5. **Delete Funnel**
**DELETE** `/api/funnels/coach/:coachId/funnels/:funnelId`

**Description:** Delete a funnel.

**Authentication:** Required (Coach only)

**Path Parameters:**
- `coachId` (string, required): The unique identifier of the coach
- `funnelId` (string, required): The unique identifier of the funnel

**Sample Request:**
```bash
DELETE /api/funnels/coach/64f1a2b3c4d5e6f7a8b9c0d1/funnels/64f1a2b3c4d5e6f7a8b9c0d2
Authorization: Bearer <jwt_token>
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Funnel deleted successfully."
}
```

---

### 6. **Add Stage to Funnel**
**POST** `/api/funnels/:funnelId/stages`

**Description:** Add a new stage to an existing funnel.

**Authentication:** Required (Coach only)

**Path Parameters:**
- `funnelId` (string, required): The unique identifier of the funnel

**Request Body:**
```json
{
  "pageId": "checkout-page",
  "name": "Checkout Page",
  "type": "Checkout",
  "selectedTemplateKey": "weight-loss-checkout",
  "html": "<div>Complete your purchase...</div>",
  "css": "body { font-family: Arial; }",
  "js": "console.log('Checkout page loaded');",
  "assets": ["checkout-image.jpg"],
  "basicInfo": {
    "title": "Complete Your Purchase",
    "description": "Secure checkout for weight loss program",
    "favicon": null,
    "keywords": "checkout, purchase, weight loss",
    "socialTitle": "Complete Purchase",
    "socialImage": null,
    "socialDescription": "Secure checkout process",
    "customHtmlHead": "",
    "customHtmlBody": ""
  },
  "order": 1,
  "isEnabled": true
}
```

**Sample Request:**
```bash
POST /api/funnels/64f1a2b3c4d5e6f7a8b9c0d2/stages
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "pageId": "checkout-page",
  "name": "Checkout Page",
  "type": "Checkout",
  "html": "<div>Complete your purchase...</div>",
  "basicInfo": {
    "title": "Complete Your Purchase",
    "description": "Secure checkout for weight loss program"
  }
}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Stage 'Checkout Page' (Checkout) added successfully.",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
    "pageId": "checkout-page",
    "name": "Checkout Page",
    "type": "Checkout",
    "selectedTemplateKey": null,
    "html": "<div>Complete your purchase...</div>",
    "css": "",
    "js": "",
    "assets": [],
    "basicInfo": {
      "title": "Complete Your Purchase",
      "description": "Secure checkout for weight loss program",
      "favicon": null,
      "keywords": "",
      "socialTitle": "",
      "socialImage": null,
      "socialDescription": "",
      "customHtmlHead": "",
      "customHtmlBody": ""
    },
    "order": 1,
    "isEnabled": true
  }
}
```

---

### 7. **Update Funnel Stage**
**PUT** `/api/funnels/:funnelId/stages/:stageId`

**Description:** Update an existing stage within a funnel.

**Authentication:** Required (Coach only)

**Path Parameters:**
- `funnelId` (string, required): The unique identifier of the funnel
- `stageId` (string, required): The unique identifier of the stage (MongoDB _id)

**Request Body:** Partial or complete stage data

**Sample Request:**
```bash
PUT /api/funnels/64f1a2b3c4d5e6f7a8b9c0d2/stages/64f1a2b3c4d5e6f7a8b9c0d4
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Checkout Page",
  "isEnabled": false
}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Funnel stage updated successfully.",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
    "pageId": "checkout-page",
    "name": "Updated Checkout Page",
    "type": "Checkout",
    "selectedTemplateKey": null,
    "html": "<div>Complete your purchase...</div>",
    "css": "",
    "js": "",
    "assets": [],
    "basicInfo": {
      "title": "Complete Your Purchase",
      "description": "Secure checkout for weight loss program",
      "favicon": null,
      "keywords": "",
      "socialTitle": "",
      "socialImage": null,
      "socialDescription": "",
      "customHtmlHead": "",
      "customHtmlBody": ""
    },
    "order": 1,
    "isEnabled": false
  }
}
```

---

### 8. **Track Funnel Event**
**POST** `/api/funnels/track`

**Description:** Track user interactions and events within a funnel (Public endpoint).

**Authentication:** Not required (Public)

**Request Body:**
```json
{
  "funnelId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "stageId": "64f1a2b3c4d5e6f7a8b9c0d4",
  "eventType": "PageView",
  "sessionId": "sess_123456789",
  "userId": null,
  "metadata": {
    "ref": "facebook_ad",
    "utm_source": "facebook",
    "utm_campaign": "weight_loss_q1"
  }
}
```

**Field Descriptions:**
- `funnelId` (string, required): The unique identifier of the funnel
- `stageId` (string, optional): The unique identifier of the specific stage
- `eventType` (string, required): Type of event (see Event Types below)
- `sessionId` (string, required): Unique session identifier
- `userId` (string, optional): User ID if logged in
- `metadata` (object, optional): Additional event-specific data

**Event Types:**
- `PageView`: User viewed a page in the funnel
- `FormSubmission`: User submitted a form
- `ButtonInteraction`: User clicked a specific button (e.g., CTA)
- `AppointmentBooked`: User booked an appointment
- `ProductPurchased`: User completed a purchase
- `WACommunityJoined`: User joined a WhatsApp community
- `VideoWatched`: User watched a video (e.g., on a VSL page)
- `StageCompleted`: User successfully completed a stage (moved to next)
- `FunnelCompleted`: User completed the entire funnel goal
- `FunnelAbandoned`: User explicitly left the funnel before completion
- `QuizCompleted`: User completed a quiz
- `FileDownloaded`: User downloaded a file/lead magnet

**Sample Request:**
```bash
POST /api/funnels/track
Content-Type: application/json

{
  "funnelId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "eventType": "PageView",
  "sessionId": "sess_123456789"
}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Funnel event tracked successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
    "funnelId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "stageId": null,
    "eventType": "PageView",
    "sessionId": "sess_123456789",
    "userId": null,
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

---

### 9. **Get Funnel Analytics**
**GET** `/api/funnels/:funnelId/analytics`

**Description:** Retrieve comprehensive analytics data for a specific funnel.

**Authentication:** Required (Coach only)

**Path Parameters:**
- `funnelId` (string, required): The unique identifier of the funnel

**Query Parameters:**
- `startDate` (string, optional): Start date for analytics (ISO 8601 format)
- `endDate` (string, optional): End date for analytics (ISO 8601 format)

**Sample Request:**
```bash
GET /api/funnels/64f1a2b3c4d5e6f7a8b9c0d2/analytics?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
Authorization: Bearer <jwt_token>
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "funnelId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "funnelName": "Weight Loss Funnel",
    "dateRange": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.000Z"
    },
    "overallMetrics": {
      "totalViews": 1500,
      "uniqueVisitors": 1200,
      "leadsCaptured": 180,
      "appointmentsBooked": 45,
      "productsPurchased": 32,
      "funnelCompletions": 28,
      "conversionToLead": 15.0,
      "funnelCompletionRate": 2.33
    },
    "loggedInUserMetrics": {
      "totalViews": 800,
      "uniqueVisitors": 600,
      "leadsCaptured": 120,
      "appointmentsBooked": 35,
      "productsPurchased": 25,
      "funnelCompletions": 20,
      "conversionToLead": 20.0,
      "funnelCompletionRate": 3.33
    },
    "guestUserMetrics": {
      "totalViews": 700,
      "uniqueVisitors": 600,
      "leadsCaptured": 60,
      "appointmentsBooked": 10,
      "productsPurchased": 7,
      "funnelCompletions": 8,
      "conversionToLead": 10.0,
      "funnelCompletionRate": 1.33
    },
    "stagePerformance": [
      {
        "stageId": "64f1a2b3c4d5e6f7a8b9c0d3",
        "stageName": "Landing Page",
        "pageId": "landing-page",
        "type": "Landing",
        "totalViews": 1500,
        "uniqueVisitors": 1200,
        "conversionRate": 12.0,
        "nextStageConversions": 180
      },
      {
        "stageId": "64f1a2b3c4d5e6f7a8b9c0d4",
        "stageName": "Checkout Page",
        "pageId": "checkout-page",
        "type": "Checkout",
        "totalViews": 180,
        "uniqueVisitors": 180,
        "conversionRate": 17.78,
        "nextStageConversions": 32
      }
    ],
    "eventBreakdown": {
      "PageView": 1500,
      "FormSubmission": 180,
      "ButtonInteraction": 450,
      "AppointmentBooked": 45,
      "ProductPurchased": 32,
      "FunnelCompleted": 28
    },
    "topReferrers": [
      {
        "source": "facebook",
        "count": 800,
        "conversionRate": 18.75
      },
      {
        "source": "google",
        "count": 400,
        "conversionRate": 12.5
      },
      {
        "source": "direct",
        "count": 300,
        "conversionRate": 10.0
      }
    ]
  }
}
```

---

## 🔧 Data Models

### Funnel Schema
```javascript
{
  _id: ObjectId,
  coachId: ObjectId (ref: 'Coach'),
  name: String (3-100 chars),
  description: String (max 500 chars),
  isActive: Boolean (default: true),
  funnelUrl: String (unique),
  customDomain: String (optional),
  targetAudience: String (enum: ['customer', 'coach']),
  stages: [StageSchema],
  createdAt: Date,
  lastUpdated: Date,
  updatedAt: Date
}
```

### Stage Schema
```javascript
{
  _id: ObjectId,
  pageId: String (required),
  name: String (required),
  type: String (required),
  selectedTemplateKey: String (optional),
  html: String (required),
  css: String (optional),
  js: String (optional),
  assets: [String] (optional),
  basicInfo: BasicInfoSchema (required),
  order: Number (optional),
  isEnabled: Boolean (default: true)
}
```

### BasicInfo Schema
```javascript
{
  title: String (required),
  description: String (optional),
  favicon: String (optional),
  keywords: String (optional),
  socialTitle: String (optional),
  socialImage: String (optional),
  socialDescription: String (optional),
  customHtmlHead: String (optional),
  customHtmlBody: String (optional)
}
```

### FunnelEvent Schema
```javascript
{
  _id: ObjectId,
  funnelId: ObjectId (ref: 'Funnel'),
  stageId: ObjectId (optional),
  eventType: String (enum of event types),
  sessionId: String (required),
  userId: ObjectId (ref: 'User', optional),
  ipAddress: String (optional),
  userAgent: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📊 Analytics & Tracking

The Funnel Management System provides comprehensive analytics including:

- **Overall Funnel Performance**: Total views, unique visitors, conversion rates
- **User Segmentation**: Separate metrics for logged-in vs. guest users
- **Stage Performance**: Individual stage conversion rates and flow analysis
- **Event Tracking**: Detailed breakdown of all user interactions
- **Referrer Analysis**: Traffic source performance and conversion rates
- **Date Range Filtering**: Customizable time periods for analysis

---

## 🚀 Best Practices

1. **Stage Naming**: Use descriptive names for stages to improve analytics clarity
2. **Page IDs**: Ensure unique pageId values within each funnel
3. **Event Tracking**: Implement comprehensive event tracking for better insights
4. **Performance Optimization**: Use appropriate indexes for large-scale funnels
5. **Security**: Always validate funnel ownership before modifications
6. **Custom Domains**: Verify custom domain ownership before assignment

---

## ⚠️ Error Handling

The system returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid input data or missing required fields
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions or ownership issues
- **404 Not Found**: Funnel or stage not found
- **409 Conflict**: Duplicate pageId or funnelUrl
- **500 Internal Server Error**: Server-side processing errors

---

## 🔐 Security Features

- **Authentication Required**: All funnel management endpoints require valid JWT tokens
- **Coach Authorization**: Coaches can only access and modify their own funnels
- **Input Validation**: Comprehensive validation of all input data
- **Custom Domain Verification**: Validation of custom domain ownership
- **Rate Limiting**: Protection against abuse and spam

This comprehensive documentation covers all aspects of the Funnel Management System, providing developers with complete information to integrate and utilize the system effectively.
