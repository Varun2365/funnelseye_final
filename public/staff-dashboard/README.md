# Staff Dashboard

A modern, responsive staff dashboard built with React and Chakra UI for managing tasks, tracking performance, and viewing achievements.

## Features

- **Authentication**: Secure login system with JWT tokens
- **Dashboard**: Overview of tasks, performance metrics, and recent activity
- **Task Management**: View, update, and log time for assigned tasks
- **Performance Tracking**: Monitor performance scores, trends, and metrics
- **Team Overview**: View team leaderboard and collaboration metrics
- **Achievements**: Track earned achievements and progress toward new ones
- **Profile Management**: Update personal information and security settings

## Technology Stack

- **Frontend**: React 18, Chakra UI, React Router
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Styling**: Chakra UI components and theme system

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the staff dashboard directory:
   ```bash
   cd public/staff-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DashboardLayout.jsx
│   ├── ProtectedRoute.jsx
│   └── Sidebar.jsx
├── contexts/           # React Context providers
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── LoginPage.jsx
│   ├── Dashboard.jsx
│   ├── Tasks.jsx
│   ├── Performance.jsx
│   ├── Team.jsx
│   ├── Achievements.jsx
│   └── Profile.jsx
├── services/           # API service layer
│   └── apiService.js
├── App.jsx            # Main app component
├── index.js           # App entry point
└── theme.js           # Chakra UI theme configuration
```

## API Integration

The dashboard integrates with the backend API through the `apiService.js` file. Key endpoints include:

- **Authentication**: `/api/auth/staff-login`, `/api/auth/me`
- **Dashboard**: `/api/staff-dashboard/data`, `/api/staff-dashboard/overview`
- **Tasks**: `/api/staff-tasks`
- **Performance**: `/api/staff-dashboard/performance`
- **Team**: `/api/staff-dashboard/team`
- **Achievements**: `/api/staff-dashboard/achievements`

## Features Overview

### Dashboard
- Performance metrics overview
- Recent tasks summary
- Quick stats and progress indicators

### Task Management
- View all assigned tasks
- Filter by status and search
- Update task status
- Log time spent on tasks

### Performance Tracking
- Current performance score
- Historical trends
- Detailed metrics breakdown
- Performance recommendations

### Team Overview
- Team leaderboard
- Team performance analytics
- Collaboration metrics

### Achievements
- Earned achievements showcase
- Available achievements with progress
- Achievement categories and descriptions

### Profile Management
- Update personal information
- Change password
- View account details

## Customization

### Theme
The app uses a custom Chakra UI theme defined in `src/theme.js`. You can customize:
- Colors (brand colors, etc.)
- Fonts
- Component default props

### Components
All components are built with Chakra UI and can be easily customized by modifying the component files.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the larger platform system.
