# Trisandhya Sadhana Companion

## Overview

The Trisandhya Sadhana Companion is a full-stack spiritual practice application consisting of a Progressive Web Application (PWA) and a native React Native mobile app. The platform guides spiritual practitioners through daily Trisandhya rituals with intelligent alarm reminders, progress tracking, and authentic spiritual content from bhavishyamalika.com.

**Platform Components:**
- **Web Application**: Content browsing, account management, media library, and spiritual guides
- **Mobile App** (NEW): Production-grade native alarm application with offline-first architecture

**Key Features:**

*Web Application:*
- PWA architecture with offline capability and "Add to Home Screen" functionality
- Media library for spiritual audio (bhajans) and video (pravachans) content
- Interactive Japa counter for mantra chanting
- Scripture reading guide for Shrimad Bhagwat Mahapuran
- Progress tracking with streak visualization and calendar views
- Google OAuth authentication
- Admin panel for content management
- Light/dark theme support with custom spiritual color palette

*Mobile Application:*
- **Production-grade alarm system** like smartphone default alarm apps
- **Full offline capability** - all alarms stored locally in SQLite database
- **Native alarm scheduling** - triggers reliably even when app is closed
- **Custom alarm tones** - import local audio files (MP3, WAV, M4A)
- **Multiple alarms** with repeat days, custom names, snooze/dismiss logic
- **Volume and vibration control** per alarm
- **Background execution** - works during Doze mode and screen-off states
- **Optional cloud sync** for backup/restore across devices
- **Minimal battery drain** with efficient native APIs

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 31, 2025
- **Unified Amplify Deployment**: Configured full-stack SSR deployment through AWS Amplify Hosting
  - Created deployment manifest (`deploy-manifest.json`) with proper routing rules
  - Built post-build script (`bin/postbuild.sh`) to package application for SSR
  - Updated `amplify.yml` to support SSR deployment with compute functions
  - Added comprehensive deployment documentation in `AMPLIFY_SSR_DEPLOYMENT.md`
  - Backend now deploys alongside frontend on same Amplify domain (no separate App Runner/ECS needed)
  - Environment variables renamed from AWS_* to S3_* prefix to avoid conflicts
  - Improved security with crypto.randomUUID() for ID generation
  - Enhanced error handling in IndexedDB operations
  - Fixed WebSocket HMR configuration for HTTPS environment

### October 20, 2025
- **React Native Mobile App**: Built production-grade native alarm application with full offline capability
  - Created complete mobile app structure using Expo React Native
  - Implemented SQLite local database for offline-first architecture
  - Built native alarm scheduler using expo-notifications and expo-task-manager
  - Created three main screens: Alarm List, Add/Edit Alarm, Alarm Ring Screen
  - Added custom alarm tone picker with local file support
  - Implemented repeat days, volume control, vibration, and snooze functionality
  - Set up background execution for reliable alarm triggering when app is closed
  - Added optional cloud sync schema for backup/restore across devices
  - Comprehensive documentation in /mobile/README.md and MOBILE_APP_GUIDE.md

### October 14, 2025
- **Database Setup**: Configured Neon PostgreSQL database with proper environment variable security (DATABASE_URL secret)
- **Landing Page Enhancement**: Added real Trisandhya content from Bhavishya Malika, mobile-responsive design, and login button in top right corner
- **Sadhana Guide Complete**: Added all authentic mantras from en.bhavishyamalika.com including Gayatri Mantra, Vishnu Shodasha Naam Stotram, Dashavatara Stotram, Durga Madhav Stuti, and Kalki Mahamantra with meanings
- **Media Library Implementation**: Added real YouTube video embedding with 6 sample bhajans and pravachans, fully functional video playback
- **Admin Media Management**: Enhanced with full YouTube support including thumbnail URLs, descriptions, and proper URL handling
- **Schema Updates**: Migrated from UUID varchar to serial integer IDs to match existing Neon database structure
- **Fixed Type Issues**: Updated admin media management to properly handle integer IDs instead of strings

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- Tailwind CSS for utility-first styling with custom spiritual design tokens
- Radix UI components via shadcn/ui for accessible, customizable UI primitives

**Design System:**
- Hybrid approach combining Material Design principles with custom spiritual aesthetics
- Custom color palette featuring saffron primary colors, cream backgrounds, and serene accent colors
- Typography: Inter for UI elements, Crimson Pro for spiritual content headings
- Responsive spacing system using Tailwind's 4-point grid (4, 6, 8, 12, 16, 24)
- Light mode as primary with full dark mode support
- Component-based architecture with reusable UI elements in `/client/src/components`

**Progressive Web App Features:**
- Service Worker implementation for offline functionality and asset caching
- Web App Manifest for installability on mobile and desktop
- Push notification capability for prayer reminders
- Responsive design optimized for mobile-first spiritual practice

**State Management Strategy:**
- React Query for all server-state (user data, progress, media content)
- Local component state (useState) for UI interactions
- No global state management library needed due to effective query caching
- Session-based authentication state via React Query with automatic invalidation

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js framework
- TypeScript for type safety across the stack
- Drizzle ORM for type-safe database operations
- PostgreSQL via Neon serverless for data persistence
- Session-based authentication with connect-pg-simple for session storage

**API Design:**
- RESTful endpoints organized by feature domain
- Consistent JSON response format
- Authentication middleware protecting all user-specific routes
- Admin-only routes with role-based access control
- Express middleware for request logging and error handling

**Authentication Flow:**
- Google OAuth 2.0 integration via Passport.js
- Session-based authentication with secure HTTP-only cookies
- User profile creation/update on first login
- Admin role flag for content management access
- Session persistence in PostgreSQL for scalability

**Database Schema Design:**
- **users**: Core user profiles with Google OAuth data and admin flags
- **sessions**: Server-side session storage for authentication
- **alarmSettings**: Per-user alarm configurations (enabled states, sound type, volume)
- **sadhanaProgress**: Daily spiritual practice tracking (Sandhya completion, Japa counts, scripture reading)
- **mediaContent**: Bhajans and pravachan videos with metadata
- **scriptureContent**: Shrimad Bhagwat Mahapuran chapters and verses

**Key Architectural Decisions:**
- Neon serverless PostgreSQL chosen for automatic scaling and WebSocket support
- Drizzle ORM provides type-safe queries while maintaining SQL flexibility
- Session storage in database (not memory) for production scalability
- Separate storage layer abstraction (`server/storage.ts`) isolates database logic from routes

### External Dependencies

**Authentication & Authorization:**
- Google OAuth 2.0 for user authentication
- Passport.js strategy for OAuth flow implementation
- Express-session with PostgreSQL store for session management

**Database & ORM:**
- Neon Serverless PostgreSQL as primary database
- Drizzle ORM for schema definition and type-safe queries
- WebSocket connection via `@neondatabase/serverless` for real-time capabilities

**UI Component Libraries:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui as component collection built on Radix
- Lucide React for consistent iconography
- React Icons for brand icons (Google logo)

**Utility Libraries:**
- date-fns for date/time calculations (Sandhya timing logic)
- Zod for runtime validation schemas
- clsx and tailwind-merge for conditional className composition
- nanoid for unique ID generation

**Content Source:**
- Spiritual content referenced from https://en.bhavishyamalika.com/ (external link, not API integration)
- Media files hosted externally (URLs stored in database)

**Development Tools:**
- Replit-specific plugins for development environment integration
- TypeScript compiler for type checking
- Vite plugins for React, error overlay, and development tooling

**PWA Infrastructure:**
- Service Worker for offline caching and background sync
- Web App Manifest for installation prompts
- Browser Notification API for push notifications (planned)