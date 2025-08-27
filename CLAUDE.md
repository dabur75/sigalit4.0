# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Start development server (port 8080)
npm run dev

# Build production version
npm run build

# Start production server
npm start

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Type checking
npm run typecheck

# Combined check (lint + typecheck)
npm run check

# Format code with Prettier
npm run format:write

# Check formatting
npm run format:check
```

### Database
```bash
# Push schema changes to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with test data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Session Management
```bash
# Start new development session (includes status check)
npm run session:start

# Check project status
npm run status
```

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 15.2.3 with React 19, TypeScript 5.8.2
- **Styling**: Tailwind CSS 4.0.15 with custom Hebrew RTL support
- **Backend**: tRPC 11.0.0 with type-safe API layer
- **Database**: PostgreSQL with Prisma 6.5.0 ORM
- **Auth**: NextAuth.js 5.0.0-beta.25 with credentials provider

### Directory Structure
```
sigalit-new/
├── src/app/                    # Next.js App Router pages
│   ├── _components/ui/         # Reusable UI components (Button, Card, Input, Label)
│   ├── dashboard/              # Main dashboard with role-based access
│   └── auth/                   # Authentication pages (signin, error)
├── src/server/                 # Backend API layer
│   ├── api/routers/            # tRPC route definitions
│   └── auth/                   # NextAuth configuration
├── src/lib/                    # Utility functions and helpers
├── prisma/                     # Database schema and seed files
└── tasks/                      # Development workflow and task tracking
```

### Database Schema
Core models: User (with roles), House, Shift, Constraint plus NextAuth models (Account, Session, VerificationToken). Users have role-based permissions (GUIDE, COORDINATOR, ADMIN) and can be assigned to houses. Shifts support Israeli calendar with Hebrew time periods.

### Authentication System
Uses NextAuth.js with credentials provider for username/password authentication. Passwords are hashed using bcryptjs. Role-based access control implemented throughout the application with custom session management.

### Hebrew & RTL Support
- Complete RTL layout support with Tailwind CSS
- Heebo font family for Hebrew text
- Custom Tailwind colors: Sigalit purple (#a855f7) and gold accents
- Israeli calendar support (Friday-Saturday weekend)

## Development Workflow

### Mandatory Session Startup
**CRITICAL**: Every development session MUST begin with:
1. Read `SESSION_STARTUP.md` - Contains mandatory checklist
2. Read `PROJECT.md` - Current project status and architecture
3. Read `tasks/README.md` - Task management and workflow
4. Run `npm run session:start` for interactive startup

### Task Management (4-Phase Workflow)
1. **Planning**: Create detailed plan using `tasks/PLANNING_TEMPLATE.md`
2. **Development**: Implement following TypeScript strict mode and project standards
3. **Review**: Document completion using `tasks/TASK_TEMPLATE.md`
4. **Documentation**: Update `PROJECT.md` and relevant docs

### Code Standards
- TypeScript strict mode with complete type definitions
- ESLint + Prettier configuration enforced
- Hebrew RTL support maintained in all components
- Use established UI component library (Button, Card, Input, Label)
- Follow tRPC patterns for API development

### Quality Gates
- **Before Development**: Approved planning document required
- **During Development**: Maintain Hebrew RTL, follow coding standards
- **Before Completion**: All acceptance criteria met, tests passing
- **Documentation**: Update PROJECT.md and task status

## Key Implementation Patterns

### Component Architecture
UI components in `src/app/_components/ui/` use forwardRef pattern with Tailwind CSS variants. All components support className merging via `cn()` utility and maintain RTL compatibility.

### tRPC API Layer
Routes in `src/server/api/routers/sigalit.ts` provide type-safe CRUD operations for User, House, Shift, and Constraint models. Uses Zod schemas for input validation and Prisma for database access.

### Authentication Flow
Custom credentials provider with username/password authentication. User roles determine dashboard access and available features. Session management extends NextAuth with custom user properties.

### Database Access
Prisma ORM with PostgreSQL backend. Schema supports Hebrew comments and Israeli scheduling requirements. Seeding script available for development data.

## Testing Strategy
No dedicated test framework configured. Rely on TypeScript compilation, ESLint checks, and manual testing. Run `npm run check` before any commits to ensure code quality.

## Important Notes
- **Never commit without approved planning** - Follow 4-phase workflow
- **Maintain Hebrew RTL support** - Test all UI changes in RTL context  
- **Quality over speed** - Proper implementation preferred over rushed features
- **Session startup is mandatory** - Always read required documentation first
- **Update documentation** - Keep PROJECT.md current with all changes