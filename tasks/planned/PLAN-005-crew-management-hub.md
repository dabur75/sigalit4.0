# Task Planning Document - Crew Management Hub

## 📋 Task Information
- **Task ID**: `PLAN-005`
- **Task Title**: Crew Management Hub - Staff Administration System
- **Priority**: HIGH
- **Estimated Effort**: Medium
- **Target Sprint**: Current Sprint

## 🎯 Task Overview

### Business Value
The crew management hub addresses the critical need for efficient staff administration within the Sigalit scheduling system. Currently, user management is handled through direct database operations or API calls, which is not scalable or user-friendly. This feature will provide administrators and coordinators with a comprehensive interface to manage their staff members, roles, and house assignments efficiently.

### User Stories
- As an ADMIN, I want to view and manage all staff members across all houses so that I can have complete system oversight
- As a COORDINATOR, I want to manage staff members within my assigned houses so that I can efficiently administer my team
- As an ADMIN/COORDINATOR, I want to create new staff accounts with appropriate roles so that I can onboard new team members quickly
- As an ADMIN/COORDINATOR, I want to edit existing staff information so that I can keep user data current
- As an ADMIN/COORDINATOR, I want to deactivate staff accounts instead of deleting them so that I can maintain data integrity while removing access
- As an ADMIN/COORDINATOR, I want to assign houses to guide-level staff so that I can properly organize work assignments

### Acceptance Criteria
- [ ] Staff table displays all users with Hebrew RTL support and role-based filtering
- [ ] Create/Edit form supports all required fields: first name, last name, email, username, password, role
- [ ] House assignment field appears conditionally for GUIDE role only
- [ ] Role selection includes Hebrew labels: מנהל מערכת (ADMIN), רכז (COORDINATOR), מדריך (GUIDE)
- [ ] Password validation follows existing security standards from auth-utils.ts
- [ ] Deactivate functionality preserves data while removing system access
- [ ] Proper permission controls ensure coordinators only see their house staff
- [ ] All text and interface elements support Hebrew RTL layout
- [ ] Form validation provides Hebrew error messages
- [ ] Integration with existing authentication system maintains security

## 🏗️ Technical Design

### Architecture Changes
This feature leverages the existing T3 stack architecture without requiring architectural changes. It builds upon:
- Existing tRPC API layer with established user management endpoints
- Current NextAuth.js authentication system with role-based access control
- Established UI component library with Hebrew RTL support
- Current multi-house permission system

### Database Changes
- [ ] No new tables/models needed - existing User model supports all requirements
- [ ] No schema modifications required
- [ ] No migration requirements
- [ ] No seed data updates needed

### API Changes
- [ ] Utilize existing tRPC endpoints in src/server/api/routers/sigalit.ts:
  - getAllUsers (with house filtering for coordinators)
  - createUser (with house assignment)
  - updateUser (with house assignment validation)
  - deleteUser (soft delete via isActive field)
- [ ] No new endpoints required
- [ ] Existing input validation schemas support all required fields
- [ ] No response type changes needed

### Frontend Changes
- [ ] New page: /dashboard/crew
- [ ] New components in src/app/dashboard/crew/_components/:
  - CrewManagement.tsx (main container)
  - StaffTable.tsx (data display with Hebrew RTL)
  - StaffForm.tsx (create/edit modal)
  - DeleteConfirmDialog.tsx (confirmation modal)
- [ ] New reusable UI components:
  - src/app/_components/ui/dialog.tsx
  - src/app/_components/ui/select.tsx
- [ ] Modified component: QuickActions.tsx (add crew management link)
- [ ] No routing updates needed - follows existing dashboard pattern

## 📁 Files to be Modified

### New Files
- `src/app/dashboard/crew/page.tsx` - Main crew page with Suspense wrapper
- `src/app/dashboard/crew/_components/CrewManagement.tsx` - Main management interface
- `src/app/dashboard/crew/_components/StaffTable.tsx` - Staff data table with Hebrew RTL
- `src/app/dashboard/crew/_components/StaffForm.tsx` - Create/edit form modal
- `src/app/dashboard/crew/_components/DeleteConfirmDialog.tsx` - Confirmation dialog
- `src/app/_components/ui/dialog.tsx` - Reusable dialog component
- `src/app/_components/ui/select.tsx` - Select dropdown component

### Modified Files
- `src/app/dashboard/_components/QuickActions.tsx` - Add crew management quick action
- `src/app/_components/ui/button.tsx` - May need destructive variant for delete actions

### Database
- No database changes required

## 🔧 Implementation Plan

### Phase 1: Foundation Components
1. [ ] Create reusable UI components (Dialog, Select)
2. [ ] Create crew page structure with proper routing
3. [ ] Set up main CrewManagement component with role-based access control
4. [ ] Implement basic staff data fetching with tRPC integration

### Phase 2: Core Features
1. [ ] Build StaffTable component with Hebrew RTL support and sorting
2. [ ] Implement StaffForm with create/edit modes and validation
3. [ ] Add conditional house assignment logic for GUIDE role
4. [ ] Integrate password validation using existing auth-utils
5. [ ] Implement role-based filtering (coordinators see only their house staff)

### Phase 3: Polish & Integration
1. [ ] Add DeleteConfirmDialog with proper confirmation flow
2. [ ] Implement deactivate functionality (soft delete)
3. [ ] Add crew management link to QuickActions component
4. [ ] Comprehensive testing of all user flows
5. [ ] Hebrew RTL testing and refinement

## 🧪 Testing Strategy

### Unit Tests
- [ ] Component rendering with proper Hebrew RTL
- [ ] Form validation with Hebrew error messages
- [ ] Role-based permission logic
- [ ] House assignment conditional display

### Integration Tests
- [ ] End-to-end staff creation workflow
- [ ] Edit staff member with house assignment changes
- [ ] Deactivate staff member workflow
- [ ] Permission controls for different user roles

### Manual Testing
- [ ] Hebrew RTL support across all components
- [ ] Mobile responsiveness on all screen sizes
- [ ] Cross-browser compatibility (Chrome, Safari, Firefox)
- [ ] Keyboard navigation and accessibility

## 📊 Risk Assessment

### Technical Risks
- **Hebrew RTL layout issues** - Mitigation: Use established patterns from existing components, thorough RTL testing
- **Permission logic complexity** - Mitigation: Leverage existing role-based access patterns, comprehensive testing
- **Form validation complexity** - Mitigation: Use existing auth-utils validation functions, progressive enhancement

### Timeline Risks
- **UI component complexity** - Mitigation: Build incrementally, reuse existing patterns where possible
- **Integration testing time** - Mitigation: Test integration points early, use existing API patterns

### Quality Risks
- **Inconsistent Hebrew translation** - Mitigation: Follow existing Hebrew text patterns, consistent terminology
- **Accessibility concerns** - Mitigation: Use established UI component patterns, keyboard navigation testing

## 📚 Documentation Requirements

### User Documentation
- [ ] Feature description in PROJECT.md
- [ ] User workflow documentation for crew management
- [ ] Role-based access documentation

### Technical Documentation
- [ ] Component documentation for new UI elements
- [ ] Integration patterns with existing tRPC endpoints
- [ ] Permission logic documentation

### Project Documentation
- [ ] PROJECT.md updates with crew management feature
- [ ] Task completion review documentation
- [ ] Architecture notes for future developers

## 🎯 Success Metrics

### Functional Requirements
- [ ] All user stories implemented with full functionality
- [ ] All acceptance criteria met and tested
- [ ] No critical bugs in core workflows
- [ ] Proper integration with existing authentication system

### Quality Requirements
- [ ] TypeScript strict mode compliance maintained
- [ ] ESLint rules followed throughout codebase
- [ ] Hebrew RTL support working perfectly
- [ ] Responsive design functions on all device sizes
- [ ] Accessibility standards met

### Performance Requirements
- [ ] Page load times under 2 seconds
- [ ] Database queries optimized (using existing efficient endpoints)
- [ ] Bundle size increase minimal due to component reuse

## 💰 Resource Requirements

### Development Time
- **Frontend Components**: 12 hours
- **Backend Integration**: 4 hours
- **UI/UX Polish**: 6 hours
- **Testing & Validation**: 6 hours
- **Documentation**: 3 hours
- **Total**: 31 hours

### Dependencies
- [ ] No external packages required - using existing stack
- [ ] No infrastructure requirements
- [ ] No team member dependencies

## 📅 Timeline

### Day 1
- [ ] Create reusable UI components (Dialog, Select)
- [ ] Set up crew page structure and routing
- [ ] Implement basic CrewManagement component

### Day 2
- [ ] Build StaffTable with Hebrew RTL support
- [ ] Create StaffForm with validation
- [ ] Implement role-based filtering logic

### Day 3
- [ ] Add house assignment functionality
- [ ] Implement delete/deactivate workflows
- [ ] Integration testing and bug fixes

### Day 4
- [ ] Polish UI/UX and Hebrew RTL
- [ ] Comprehensive testing
- [ ] Documentation updates

## 🔍 Review & Approval

### Developer Self-Review
- [x] Plan is complete and covers all requirements
- [x] Technical approach leverages existing architecture
- [x] Timeline is realistic for medium complexity task
- [x] Risks are identified with mitigation strategies
- [x] Implementation phases are clearly defined

### Stakeholder Review
- [x] Business value addresses real user needs
- [x] User stories cover all stakeholder requirements
- [x] Acceptance criteria are measurable and testable
- [x] Timeline aligns with project priorities

### Technical Review
- [x] Architecture approach is sound and consistent
- [x] Implementation plan is feasible with existing tools
- [x] Testing strategy is comprehensive
- [x] Documentation requirements are appropriate

---

**Status**: [x] Draft | [ ] Ready for Review | [x] Approved | [ ] Rejected
**Developer**: Claude Code
**Reviewer**: Stakeholder
**Approval Date**: 2024-08-24
**Comments**: Approved plan leverages existing architecture effectively while delivering comprehensive crew management functionality with proper Hebrew RTL support.