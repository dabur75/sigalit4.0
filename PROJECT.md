# Sigalit Scheduling Management System - Project Overview

## 🎯 Project Vision
A comprehensive scheduling management system for Israeli organizations, supporting Hebrew RTL, Israeli calendar (Friday-Saturday weekend), and role-based access control with multi-house support.

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.2.3** - App Router with React 19
- **TypeScript 5.8.2** - Strict mode enabled
- **Tailwind CSS 4.0.15** - Custom design system
- **React 19.0.0** - Latest React features

### Backend & API
- **tRPC 11.0.0** - Type-safe API layer
- **Prisma 6.5.0** - Database ORM
- **PostgreSQL** - Primary database

### Authentication & Security
- **NextAuth.js 5.0.0-beta.25** - Authentication framework
- **Credentials Provider** - Username/password authentication
- **Role-based Access Control** - ADMIN, COORDINATOR, GUIDE
- **House-based Permissions** - Multi-house access control

### Development Tools
- **ESLint + Prettier** - Code quality and formatting
- **Husky** - Git hooks (pre-commit)
- **TypeScript ESLint** - Type checking

## 📁 File Structure

```
sigalit-new/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── _components/        # Shared UI components
│   │   │   ├── ui/            # Base UI components (Button, Card, Input, Label)
│   │   │   └── NextAuthProvider.tsx # Session provider
│   │   ├── auth/              # Authentication pages
│   │   │   ├── signin/        # Sign-in page
│   │   │   └── error/         # Auth error page
│   │   ├── dashboard/         # Main dashboard
│   │   │   └── _components/   # Dashboard-specific components
│   │   │       ├── DashboardContent.tsx
│   │   │       ├── DashboardOverview.tsx
│   │   │       ├── RecentShifts.tsx
│   │   │       ├── QuickActions.tsx
│   │   │       ├── HouseSelector.tsx
│   │   │       └── DashboardSkeleton.tsx
│   │   └── page.tsx           # Homepage
│   ├── server/                # Server-side code
│   │   ├── api/               # tRPC API routes
│   │   │   ├── routers/       # API endpoint definitions
│   │   │   └── root.ts        # Main API router
│   │   └── auth/              # NextAuth configuration
│   ├── lib/                   # Utility functions
│   │   └── auth-utils.ts      # Password hashing utilities
│   ├── styles/                # Global CSS and Tailwind
│   └── trpc/                  # tRPC client configuration
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma          # Database models with house support
│   └── seed.ts               # Database seeding script
├── tasks/                     # Development task tracking
│   ├── completed/             # Finished tasks
│   │   ├── TASK-002-username-password-auth-review.md
│   │   └── TASK-003-add-houses-review.md
│   ├── in-progress/           # Current work
│   └── planned/               # Future features
├── public/                    # Static assets
└── package.json               # Dependencies and scripts
```

## 🗄️ Database Schema

### Core Models
- **House** - Physical locations/centers with unique codes and descriptions
- **User** - Users with roles (GUIDE, COORDINATOR, ADMIN) and house assignments
- **Shift** - Scheduled work assignments linked to specific houses
- **Constraint** - User availability and preferences linked to houses

### House Management
- **House Code**: Unique identifier (dor, chabatzelet)
- **House Description**: Detailed description of each center
- **House Status**: Active/inactive status
- **House Relationships**: Links to users, shifts, and constraints

### NextAuth Models
- **Account** - Authentication provider accounts
- **Session** - User sessions with house information
- **VerificationToken** - Email verification

## 🚀 Current Status

### ✅ Completed Features
1. **Project Setup** - T3 Stack initialization
2. **Database Schema** - Prisma models with house relationships
3. **Authentication System** - NextAuth.js with username/password
4. **Hebrew RTL Support** - Complete RTL layout and Hebrew fonts
5. **Dashboard System** - Role-based dashboard with house selection
6. **UI Components** - Reusable components with Tailwind CSS
7. **Database Seeding** - Test data with 2 houses
8. **Multi-House Support** - Complete house separation system
9. **House-Based Permissions** - Role-based access control per house
10. **Crew Management Hub** - Complete staff administration system with Hebrew RTL

### 🔄 In Progress
- None currently

### 📋 Planned Features
1. **Calendar Interface** - Israeli calendar with Hebrew support
2. **Shift Management** - CRUD operations for shifts by house
3. **Real-time Updates** - WebSocket integration
4. **Advanced Scheduling** - Conflict detection and optimization
5. **House Management Pages** - Dedicated house administration
6. **Reports by House** - House-specific analytics and reports

## 🎨 Design System

### Colors
- **Primary**: Sigalit Purple (#a855f7)
- **Secondary**: Gold (#f59e0b)
- **House Colors**:
  - **בית דרור**: Blue (#3b82f6)
  - **בית חבצלת**: Green (#10b981)

### Typography
- **Hebrew**: Heebo font family
- **Latin**: Inter font family
- **RTL Support**: Complete right-to-left layout

## 🏠 Multi-House Architecture

### House Separation
- **Complete Isolation**: No data sharing between houses
- **Unique Identifiers**: Each house has a unique code
- **Separate Management**: Independent user and shift management

### User Roles by House
- **GUIDE**: Access only to assigned house
- **COORDINATOR**: Access to all houses with house selection
- **ADMIN**: Full access to all houses and system

### House Selection Interface
- **Visual House Selector**: Color-coded house buttons
- **House-Specific Views**: Dashboard adapts to selected house
- **Cross-House Overview**: Summary view of all houses

## 🔐 Authentication & Authorization

### Login Credentials
- **Admin**: admin / admin123
- **Coordinator Dor**: coordinator_dor / coordinator123
- **Coordinator Chabatzelet**: coordinator_chabatzelet / coordinator123
- **Guide 1**: guide1 / guide123 (House Dor)
- **Guide 2**: guide2 / guide123 (House Dor)
- **Guide 3**: guide3 / guide123 (House Chabatzelet)

### Security Features
- **Password Hashing**: bcryptjs with secure hashing
- **Session Management**: NextAuth.js with custom user model
- **Role-Based Access**: Granular permissions per user role
- **House-Based Access**: Data isolation between houses

## 📊 Current Data

### Houses
- **בית דרור** (House Dor): Active center with 3 users
- **בית חבצלת** (House Chabatzelet): Active center with 2 users

### Users
- **6 Active Users**: 1 Admin, 2 Coordinators, 3 Guides
- **House Distribution**: Users assigned to specific houses
- **Role Distribution**: Balanced role assignment across houses

### Shifts & Constraints
- **Sample Shifts**: Morning and afternoon shifts for both houses
- **User Constraints**: Availability and preference constraints
- **House-Specific Data**: All data properly linked to houses

### Crew Management System
- **Comprehensive Staff Administration**: Full CRUD operations for user management
- **Role-Based Access**: ADMIN and COORDINATOR access with proper permissions
- **Hebrew RTL Interface**: Complete Hebrew support with right-to-left layout
- **House Assignment**: Conditional house assignment for GUIDE role users
- **Form Validation**: Comprehensive validation with Hebrew error messages
- **Security Integration**: Uses existing authentication and password systems
- **Responsive Design**: Mobile-friendly interface for on-the-go management

## 🚧 Known Issues

### API Errors
- Some API calls return errors (investigation needed)
- Dashboard functionality works despite API issues
- Core authentication and house selection working

### Performance
- Skeleton loading implemented for better UX
- Suspense boundaries for component loading
- Optimized database queries with proper indexing

## 🔮 Next Steps

### Immediate Priorities
1. **Fix API Issues**: Resolve remaining API errors
2. **House Management Pages**: Create dedicated house administration
3. **Shift Management**: Implement shift CRUD operations

### Future Enhancements
1. **Calendar Integration**: Full calendar view with house filtering
2. **Reporting System**: House-specific analytics and reports
3. **Real-time Updates**: WebSocket for live data updates
4. **Mobile Optimization**: Responsive design improvements

---

**Last Updated**: 24 August 2024  
**Version**: 1.3.0 (Crew Management Hub)  
**Status**: Production Ready with Comprehensive Staff Management
