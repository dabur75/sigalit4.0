# Task Planning Template

## 📋 Task Information
- **Task ID**: `PLAN-006`
- **Task Title**: Houses Management with Weekly Schedule & Shift Dashboard
- **Priority**: HIGH
- **Estimated Effort**: Large
- **Target Sprint**: Sprint 6

## 🎯 Task Overview

### Business Value
This feature provides a comprehensive houses management system with weekly schedules and a shift management dashboard. It allows staff to manage house operations, weekly schedules, and daily shifts while maintaining a structured weekly routine. The weekly schedule is managed at the house level, while daily shifts are managed through the shift dashboard.

### User Stories
- As a COORDINATOR, I want to manage weekly schedules for each house so that I can maintain consistent daily routines
- As a COORDINATOR, I want to add one-time overrides for specific dates so that I can handle unexpected events
- As a GUIDE, I want to view daily schedules for my house so that I know what activities are planned
- As a COORDINATOR, I want to manage shift tasks so that daily operations run smoothly
- As a COORDINATOR, I want to handle medical referrals so that patient care is properly managed
- As a COORDINATOR, I want to manage shift instructors so that proper staffing is maintained
- As a staff member, I want to send internal messages so that I can communicate with my team

### Acceptance Criteria
- [ ] Houses management page displays all houses with weekly schedule management
- [ ] Weekly schedule displays 7 days with regular activities per house
- [ ] One-time overrides can be added for specific dates per house
- [ ] Daily schedule is derived from weekly + overrides per house
- [ ] Shift dashboard shows daily operations and tasks
- [ ] Shift tasks can be created, edited, and completed
- [ ] Medical referrals can be managed with date selection
- [ ] Shift instructors are properly tracked and managed
- [ ] Internal messaging system works between staff members
- [ ] All components support Hebrew RTL layout
- [ ] House-based data isolation is maintained

## 🏗️ Technical Design

### Architecture Changes
- New houses management page with weekly schedule system
- Weekly schedule managed at house level (not shift level)
- Shift dashboard focuses on daily operations and tasks
- Flexible schedule architecture supporting regular + override patterns
- Enhanced houses page with weekly schedule management

### Database Changes
- [x] New WeeklySchedule table for regular weekly activities per house
- [x] New OneTimeOverride table for temporary schedule changes per house
- [x] Enhanced DailySchedule calculation logic per house
- [x] New ShiftTasks table for daily task management
- [x] New MedicalReferrals table for doctor referrals
- [x] New ShiftInstructors table for staff tracking
- [x] New InternalMessages table for team communication
- [x] Migration requirements for new tables
- [x] Seed data updates for testing

### API Changes
- [x] New tRPC endpoints for weekly schedule management per house
- [x] New tRPC endpoints for one-time overrides per house
- [x] Enhanced daily schedule calculation endpoints per house
- [x] New tRPC endpoints for shift tasks
- [x] New tRPC endpoints for medical referrals
- [x] New tRPC endpoints for shift instructors
- [x] New tRPC endpoints for internal messages
- [x] Input validation schemas for all new endpoints
- [x] Response type definitions for all new data

### Frontend Changes
- [x] New houses management page with weekly schedule management
- [x] Weekly schedule component with 7-day view per house
- [x] One-time override management interface per house
- [x] Daily schedule display component per house
- [x] Shift dashboard page with daily operations focus
- [x] Shift tasks management component
- [x] Medical referrals management component
- [x] Shift instructors management component
- [x] Internal messaging interface
- [x] Enhanced routing for houses and shift management
- [x] State management for schedule data per house

## 📁 Files to be Modified

### New Files
- `src/app/houses/page.tsx` - Main houses management page
- `src/app/houses/_components/HousesManagement.tsx` - Main houses layout
- `src/app/houses/_components/WeeklySchedule.tsx` - Weekly schedule management per house
- `src/app/houses/_components/OneTimeOverride.tsx` - Override management per house
- `src/app/houses/_components/DailySchedule.tsx` - Daily schedule display per house
- `src/app/dashboard/shift/page.tsx` - Shift dashboard page (daily operations)
- `src/app/dashboard/shift/_components/ShiftDashboard.tsx` - Main shift dashboard layout
- `src/app/dashboard/shift/_components/ShiftTasks.tsx` - Task management
- `src/app/dashboard/shift/_components/MedicalReferrals.tsx` - Referral management
- `src/app/dashboard/shift/_components/ShiftInstructors.tsx` - Instructor management
- `src/app/dashboard/shift/_components/InternalMessages.tsx` - Messaging interface
- `src/app/houses/_components/ScheduleCard.tsx` - Reusable schedule card
- `src/app/houses/_components/OverrideForm.tsx` - Override creation form

### Modified Files
- `prisma/schema.prisma` - New database models
- `src/server/api/routers/sigalit.ts` - New API endpoints
- `src/app/layout.tsx` - Navigation updates
- `src/app/dashboard/page.tsx` - Dashboard navigation updates
- `src/app/dashboard/_components/QuickActions.tsx` - Update houses link

### Database
- `prisma/schema.prisma` - WeeklySchedule, OneTimeOverride, ShiftTasks, MedicalReferrals, ShiftInstructors, InternalMessages models

## 🔧 Implementation Plan

### Phase 1: Houses Management & Weekly Schedule (Week 1)
1. [ ] Create database models and migrations
2. [ ] Implement weekly schedule API endpoints per house
3. [ ] Build houses management page with weekly schedule
4. [ ] Add basic CRUD operations for weekly activities per house

### Phase 2: Override System & Daily Schedule (Week 2)
1. [ ] Implement one-time override API endpoints per house
2. [ ] Build override management interface per house
3. [ ] Create daily schedule calculation logic per house
4. [ ] Build daily schedule display component per house

### Phase 3: Shift Dashboard (Week 3)
1. [ ] Implement shift tasks management
2. [ ] Build medical referrals system
3. [ ] Create shift instructors management
4. [ ] Integrate all components in shift dashboard

### Phase 4: Polish & Testing (Week 4)
1. [ ] Implement internal messaging system
2. [ ] Add comprehensive error handling
3. [ ] Perform thorough testing and validation
4. [ ] Update documentation and project status

## 🧪 Testing Strategy

### Unit Tests
- [ ] Component testing for all new components
- [ ] API endpoint testing for all new routes
- [ ] Schedule calculation logic testing per house
- [ ] Form validation testing

### Integration Tests
- [ ] End-to-end weekly schedule workflow per house
- [ ] Override system integration testing per house
- [ ] Daily schedule calculation testing per house
- [ ] Cross-component communication testing

### Manual Testing
- [ ] Hebrew RTL support verification
- [ ] Mobile responsiveness testing
- [ ] Cross-browser compatibility
- [ ] House-based data isolation testing

## 📊 Risk Assessment

### Technical Risks
- Complex schedule calculation logic per house - Mitigation: Thorough testing and validation
- State management complexity per house - Mitigation: Use React Query for server state
- Performance with large datasets - Mitigation: Implement pagination and filtering

### Timeline Risks
- Complex override system per house - Mitigation: Start with basic functionality, enhance iteratively
- Multiple component integration - Mitigation: Build and test components independently first

### Quality Risks
- Hebrew RTL layout complexity - Mitigation: Test RTL support throughout development
- Schedule data consistency per house - Mitigation: Implement proper validation and error handling

## 📚 Documentation Requirements

### User Documentation
- [ ] Houses management user manual
- [ ] Weekly schedule setup guide per house
- [ ] Override system usage guide per house
- [ ] Shift dashboard user guide
- [ ] Screenshots and workflow diagrams

### Technical Documentation
- [ ] API documentation for new endpoints
- [ ] Component documentation and usage
- [ ] Database schema documentation
- [ ] Schedule calculation algorithm documentation per house

### Project Documentation
- [ ] PROJECT.md updates with new features
- [ ] README updates for houses and shift management
- [ ] Architecture diagrams for schedule system

## 🎯 Success Metrics

### Functional Requirements
- [ ] All user stories implemented
- [ ] Weekly schedule displays correctly per house
- [ ] Override system works as expected per house
- [ ] Daily schedule calculation is accurate per house
- [ ] Shift dashboard shows daily operations clearly
- [ ] All CRUD operations function properly

### Quality Requirements
- [ ] TypeScript strict mode compliance
- [ ] ESLint rules followed
- [ ] Hebrew RTL support maintained
- [ ] Responsive design works on all devices

### Performance Requirements
- [ ] Schedule calculation completes within 100ms per house
- [ ] Page load times under 2 seconds
- [ ] Database queries optimized with proper indexing
- [ ] Bundle size increase under 100KB

## 💰 Resource Requirements

### Development Time
- **Frontend**: 32 hours
- **Backend**: 20 hours
- **Database**: 12 hours
- **Testing**: 12 hours
- **Documentation**: 8 hours
- **Total**: 84 hours

### Dependencies
- [ ] Prisma database migrations
- [ ] tRPC router updates
- [ ] React Query for state management
- [ ] Date manipulation libraries

## 📅 Timeline

### Week 1: Houses Foundation
- [ ] Database models and migrations
- [ ] Weekly schedule API per house
- [ ] Basic houses management page with weekly schedule

### Week 2: Core Schedule System
- [ ] Override API and interface per house
- [ ] Daily schedule calculation per house
- [ ] Schedule display components per house

### Week 3: Shift Dashboard
- [ ] Shift tasks management
- [ ] Medical referrals system
- [ ] Shift instructors management

### Week 4: Integration & Testing
- [ ] Internal messaging system
- [ ] Component integration
- [ ] Testing and documentation

## 🔍 Review & Approval

### Developer Self-Review
- [x] Plan is complete and clear
- [x] Technical approach is sound
- [x] Timeline is realistic
- [x] Risks are identified and mitigated

### Stakeholder Review
- [ ] Business value is clear
- [ ] User stories are well-defined
- [ ] Acceptance criteria are measurable
- [ ] Timeline is acceptable

### Technical Review
- [ ] Architecture is appropriate
- [ ] Implementation plan is feasible
- [ ] Testing strategy is comprehensive
- [ ] Documentation requirements are clear

---

**Status**: [x] Draft | [ ] Ready for Review | [ ] Approved | [ ] Rejected
**Developer**: Senior Frontend Developer
**Reviewer**: [Pending]
**Approval Date**: [Pending]
**Comments**: [Pending stakeholder review and approval]
