---
description: Repository Information Overview
alwaysApply: true
---

# Trisandhya - Repository Information Overview

## Repository Summary
Trisandhya is a full-stack spiritual practice alarm application featuring web and mobile platforms. It provides a comprehensive alarm system with user authentication, cloud synchronization, customizable alarms, and spiritual practice reminders. Built with TypeScript, React, and React Native for cross-platform compatibility.

## Repository Structure
**Web Application** (`client/` + `server/`): Express.js backend with React/Vite frontend for web browsers
**Mobile Application** (`mobile/`): React Native/Expo-based cross-platform mobile app for iOS and Android
**Shared Code** (`shared/`): TypeScript schemas and utilities shared between web and mobile applications

### Main Repository Components
- **Server** (`server/`): Node.js/Express backend with authentication, database, and API routes
- **Client** (`client/`): React application with Vite bundler for frontend UI
- **Mobile** (`mobile/`): React Native application with native alarm scheduling capabilities
- **Database** (`shared/schema.ts`): Drizzle ORM schema definitions for PostgreSQL

## Projects

### Web Application (Server + Client)
**Configuration File**: `package.json`, `tsconfig.json`, `vite.config.ts`, `drizzle.config.ts`

#### Language & Runtime
**Language**: TypeScript 5.6.3
**Runtime**: Node.js 20 (Alpine Linux in production)
**Package Manager**: npm
**Build System**: Vite (frontend) + esbuild (server bundling)

#### Dependencies
**Backend Stack**:
- Express.js 4.21.2 - Web server framework
- Drizzle ORM 0.39.1 - Database ORM for PostgreSQL
- Passport.js 0.7.0 - Authentication with Google OAuth and local strategy
- SendGrid 8.1.6 - Email service
- Multer 2.0.2 + Multer-S3 - File upload to AWS S3
- Express Session 1.18.1 - Session management
- WebSockets (ws 8.18.0) - Real-time communication

**Frontend Stack**:
- React 18.3.1 - UI library
- Vite 5.4.20 - Build tool
- TailwindCSS 3.4.17 - Utility-first CSS
- Radix UI - Accessible component library
- React Query 5.60.5 - Server state management
- React Hook Form 7.55.0 - Form handling
- Wouter 3.3.5 - Lightweight router
- Recharts 2.15.2 - Data visualization
- React PDF 10.2.0 - PDF handling

#### Build & Installation
```bash
npm install
npm run dev              # Development server
npm run build            # Build frontend + bundle server
npm start                # Production server
npm run check            # TypeScript type checking
npm run db:push          # Push database migrations
```

#### Docker
**Dockerfile**: Multi-stage build at repository root
**Base Image**: node:20-alpine (production)
**Port**: 5000
**Configuration**: Frontend built to `dist/public`, server to `dist/index.js`

#### Main Entry Points
- **Server**: `server/index.ts` - Express app initialization with routes and middleware
- **Client**: `client/src/main.tsx` - React DOM entry point
- **Routes**: `server/routes.ts` - API route registration
- **Database**: `shared/schema.ts` - Drizzle ORM database schema

#### Key Features
- **Authentication**: Google OAuth, local authentication, Replit auth, session management
- **Database**: PostgreSQL with Drizzle ORM and migrations
- **File Storage**: AWS S3 integration for uploads
- **Email**: SendGrid integration for notifications
- **Real-time**: WebSocket support for live updates
- **Middleware**: Logging and rate limiting middleware

### Mobile Application
**Configuration File**: `mobile/package.json`, `mobile/app.json`, `mobile/tsconfig.json`

#### Language & Runtime
**Language**: TypeScript 5.6.3 (with JavaScript compatibility)
**Runtime**: React Native 0.76.5 via Expo 51
**Platform**: iOS (14.0+) and Android (5.1+)
**Package Manager**: npm

#### Dependencies
**Core**:
- React 18.3.1 - UI library
- React Native 0.76.5 - Native framework
- Expo 51 - Development platform and services
- Expo Router 4.0.0 - File-based routing
- Expo Notifications 0.29.11 - Local notifications
- Expo SQLite 15.0.3 - Local database

**Key Libraries**:
- Expo Device 7.0.1 - Device information
- Expo Media Library 17.0.4 - Media access
- Expo File System 18.0.4 - File operations
- Expo Task Manager 12.0.3 - Background tasks
- Expo Haptics 14.0.0 - Haptic feedback

#### Build & Installation
```bash
cd mobile
npm install
npm start                # Start Expo development server
npm run ios              # Build for iOS simulator
npm run android          # Build for Android emulator
npm run web              # Build for web (limited functionality)
eas build --platform ios --profile production      # Production iOS build
eas build --platform android --profile production  # Production Android build
```

#### Main Entry Points
- **App**: `mobile/App.tsx` - Main application component
- **Screens**: `mobile/src/screens/` - Screen components (AlarmListScreen, AddEditAlarmScreen, AlarmRingScreen)
- **Services**: `mobile/src/services/alarmScheduler.ts` - Native alarm scheduling logic
- **Database**: `mobile/src/database/database.ts` - SQLite operations

#### Key Features
- **Local Database**: SQLite for offline-first alarm storage
- **Native Alarms**: AlarmManager (Android) and UNUserNotificationCenter (iOS)
- **Background Execution**: Alarms trigger when app is closed
- **Permissions**: Exact alarm scheduling, boot completion, wake lock, vibration
- **UI**: Fullscreen alarm interface with custom sounds and snooze functionality
- **Notifications**: Expo Notifications for reliable alarm delivery

## Deployment
**AWS Amplify**: Configured for SSR deployment with compute resources (`amplify.yml`, `postbuild.sh`)
**Environment Variables**: Database URL, authentication credentials, AWS S3 keys, SendGrid API key
