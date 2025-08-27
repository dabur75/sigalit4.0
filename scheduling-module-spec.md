# Sigalit 3.0 - Scheduling Module Complete Specification

## 📋 Executive Summary

Complete specification for building the Sigalit scheduling system - a sophisticated guide scheduling platform for Israeli care facilities with Hebrew support, fairness optimization, and intelligent automation.

**Key Features:**
- Manual + Automatic scheduling with AI assistance
- Multi-house support (2 locations, ~10 guides each)
- Hebrew RTL interface with Israeli calendar
- Constraint management (monthly, weekly, vacation)
- Draft system with guide feedback
- Fairness and burnout prevention

---

## 🏗️ Technical Architecture

### Technology Stack (T3)
- **Frontend**: Next.js 15.2.3 with React 19, TypeScript 5.8.2
- **Backend**: tRPC 11.0.0, Prisma 6.5.0, PostgreSQL
- **Auth**: NextAuth.js 5.0.0-beta.25
- **UI**: Tailwind CSS 4.0.15, shadcn/ui components
- **Deployment**: Production-ready with Hebrew RTL support

### Scale Parameters
- **Users**: 20 guides total, 2 coordinators
- **Houses**: 2 separate locations (~10 guides each)
- **Scheduling**: Monthly cycles, 1-month at a time
- **Timeline**: Constraints due by 20th, 2-3 day scheduling process

---

## 📊 Database Schema

```prisma
// Add to existing schema.prisma

model Schedule {
  id          String   @id @default(cuid())
  month       Int      // 1-12
  year        Int      // 2024+
  version     Int      @default(1)
  status      ScheduleStatus @default(DRAFT)
  houseId     String
  house       House    @relation(fields: [houseId], references: [id])
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id])
  createdAt   DateTime @default(now())
  finalizedAt DateTime?
  assignments ScheduleAssignment[]
  
  @@unique([month, year, houseId, version])
}

model ScheduleAssignment {
  id         String   @id @default(cuid())
  scheduleId String
  schedule   Schedule @relation(fields: [scheduleId], references: [id])
  date       DateTime
  guideId    String
  guide      User     @relation(fields: [guideId], references: [id])
  role       AssignmentRole // REGULAR or OVERLAP
  shiftType  ShiftType      // WEEKDAY, OPEN_WEEKEND, CLOSED_WEEKEND, HOLIDAY
  isManual   Boolean  @default(false)
  isLocked   Boolean  @default(false)
  isConfirmed Boolean @default(false)
  rejectionReason String?
  createdBy  String
  creator    User     @relation("AssignmentCreator", fields: [createdBy], references: [id])
  createdAt  DateTime @default(now())
  
  @@unique([scheduleId, date, role])
  @@index([guideId, date])
}

model WeeklyConstraint {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  dayOfWeek  Int      // 0-6 (Sunday-Saturday)
  status     ConstraintStatus @default(ACTIVE) // ACTIVE, PAUSED, DELETED
  reason     String?
  approvedBy String?
  approver   User?    @relation("ConstraintApprover", fields: [approvedBy], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@unique([userId, dayOfWeek])
}

model CoordinatorRule {
  id         String   @id @default(cuid())
  houseId    String
  house      House    @relation(fields: [houseId], references: [id])
  ruleType   String   // NO_PAIR, MANUAL_ONLY, NO_WEEKENDS, etc.
  parameters Json     // Flexible JSON for rule-specific data
  isActive   Boolean  @default(true)
  createdBy  String
  creator    User     @relation(fields: [createdBy], references: [id])
  createdAt  DateTime @default(now())
}

model DynamicConstraint {
  id          String   @id @default(cuid())
  guideId     String
  guide       User     @relation(fields: [guideId], references: [id])
  blockedDate DateTime
  sourceDate  DateTime // The assigned date causing this block
  scheduleId  String
  
  @@unique([guideId, blockedDate, scheduleId])
  @@index([scheduleId])
}

enum ScheduleStatus {
  DRAFT
  REVIEW
  FORMAL
  ARCHIVED
}

enum AssignmentRole {
  REGULAR  // רגיל - 24 hours
  OVERLAP  // חפיפה - 25 hours
  STANDBY  // כונן
  MOTZASH  // מוצ״ש
}

enum ShiftType {
  WEEKDAY
  OPEN_WEEKEND
  CLOSED_WEEKEND
  HOLIDAY
}

enum ConstraintStatus {
  ACTIVE
  PAUSED
  DELETED
}
```

---

## 📐 Core Business Rules

### Scheduling Rules (Hard but Coordinator-Overridable)

1. **Daily Coverage Requirements**
   - Every day MUST have assignments (1-2 guides)
   - Weekdays (Sun-Thu): Always 2 guides (רגיל + חפיפה)
   - Weekends: According to type (Open: 2+2, Closed: 1→2)
   - Holidays: Always 2 guides

2. **Consecutive Day Prevention**
   - Guides cannot work consecutive days
   - EXCEPTION: Closed weekend Friday→Saturday כונן continuation
   - When assigning Tuesday → Auto-block Monday & Wednesday

3. **Weekly Workload Limits**
   - Maximum 2 weekday shifts (Sun-Thu) per guide per week
   - Weekend shifts (Fri-Sat) are additional
   - Holidays don't count toward weekday limit

4. **Weekend Logic**
   - **Open Weekend**: 2 guides Friday + 2 guides Saturday
   - **Closed Weekend**: 1 כונן Friday→Saturday + 1 מוצ״ש joins Saturday
   - Pattern alternates: Open→Closed→Open→Closed

5. **Constraint Hierarchy**
   - Approved vacations → Absolute block
   - Weekly constraints → Apply when ACTIVE
   - Monthly constraints → Apply to specific dates
   - Dynamic constraints → Generated from assignments

---

## 🎨 UI/UX Design

### Manual Scheduler Interface - 3-Panel Layout

```
┌─────────────────┬────────────────────────┬─────────────────┐
│  Guide Pool     │   Calendar Grid        │  Context Panel  │
│     (20%)       │       (60%)            │     (20%)       │
├─────────────────┼────────────────────────┼─────────────────┤
│ Search: [___]   │ December 2024          │ Selected: Dec 15│
│                 │ ┌──┬──┬──┬──┬──┬──┬──┐│                 │
│ AVAILABLE (5)   │ │Su│Mo│Tu│We│Th│Fr│Sa││ Need: 1 guide   │
│ ┌─────────────┐ │ ├──┼──┼──┼──┼──┼──┼──┤│                 │
│ │👤 David      │ │ │  │  │  │  │  │1 │2 ││ SUGGESTIONS:    │
│ │▓▓░░ 3/10    │ │ │  │  │  │  │  │◐ │◐ ││ 1. Sarah ⭐⭐⭐⭐⭐│
│ │✅ Available  │ │ ├──┼──┼──┼──┼──┼──┼──┤│ 2. Moshe ⭐⭐⭐⭐ │
│ └─────────────┘ │ │3 │4 │5 │6 │7 │8 │9 ││ 3. Rachel ⭐⭐⭐ │
│                 │ │● │● │● │● │● │○ │○ ││                 │
│ BLOCKED (2)     │ └──┴──┴──┴──┴──┴──┴──┘│ [Auto-suggest]  │
│ ┌─────────────┐ │                        │                 │
│ │👤 Dan 🔒     │ │ Legend:                │ Warnings:       │
│ │▓▓░░ 2/10    │ │ ● Filled ◐ Partial    │ ⚠️ Unbalanced   │
│ │❌ Constraint │ │ ○ Empty  🔒 Locked    │                 │
│ └─────────────┘ │                        │                 │
└─────────────────┴────────────────────────┴─────────────────┘
```

### Key UI Features

#### Traffic Light System
- 🟢 **Green**: Available, no issues
- 🟡 **Yellow**: Soft warning (worked recently, high hours)
- 🔴 **Red**: Blocked (constraint, vacation, or dynamic block)
- 🔵 **Blue**: Manually locked assignment

#### Drag & Drop Intelligence
1. Drag guide → Valid slots highlight green
2. Invalid slots show red with reason
3. Drop → Instant assignment with animation
4. Creates dynamic constraints immediately

#### Real-Time Updates
- Available guides refresh after each placement
- Fairness metrics update live
- Warnings appear immediately
- Auto-save every 30 seconds

#### Smart Assistance
- Click empty slot → Top 3 guide suggestions
- Hover on guide → See availability calendar
- Right-click → Context menu with quick actions
- Keyboard shortcuts for power users

---

## 🔄 Process Workflow

### Phase 1: Constraint Collection (Until 20th)

1. **Guides Submit**:
   - Monthly constraints (specific dates)
   - Weekly constraints (recurring)
   - Vacation requests

2. **Coordinator Reviews**:
   - Approve/reject vacation requests
   - Approve weekly constraints
   - Set coordinator rules

### Phase 2: Manual Scheduling

1. **Initialize Month**:
   - Set weekend types (Open/Closed pattern)
   - Configure holidays
   - Review constraints

2. **Manual Assignment**:
   - Drag & drop guides to slots
   - System shows warnings
   - Dynamic constraints generate
   - Lock important assignments

### Phase 3: Auto-Scheduling

1. **Fill Gaps**:
   - Algorithm runs on remaining slots
   - Level 1: Fair distribution
   - Respects all constraints
   - Leaves impossible slots empty

2. **Review Results**:
   - Check coverage completeness
   - Verify fairness metrics
   - Manual adjustments if needed

### Phase 4: Draft Management

1. **Send Draft**:
   - Multi-channel notification (Email, SMS, WhatsApp)
   - 24-hour response window
   - Guides see full schedule with highlights

2. **Collect Feedback**:
   - Guides approve or reject specific dates
   - Must provide reason for rejection
   - Silence = acceptance

3. **Revision**:
   - System suggests swaps
   - Coordinator resolves conflicts
   - Can create multiple draft versions

### Phase 5: Finalization

1. **Mark as Formal**:
   - Lock all assignments
   - No more changes via this interface
   - Publish to calendar

2. **Distribution**:
   - Sync to personal calendars
   - Print-friendly version
   - Mobile web app access

---

## 🤖 Auto-Scheduler Algorithm

### Level 1 Implementation (Current)

```typescript
// Pseudocode for auto-scheduler
function autoSchedule(month: Month) {
  const slots = getEmptySlots(month)
  const guides = getActiveGuides()
  
  for (const slot of slots) {
    const available = getAvailableGuides(slot, guides)
    
    if (available.length === 0) {
      markSlotAsImpossible(slot)
      continue
    }
    
    // Calculate fairness score
    const scored = available.map(guide => ({
      guide,
      score: calculateFairnessScore(guide, month)
    }))
    
    // Sort by best score (lowest shifts = highest priority)
    scored.sort((a, b) => a.score - b.score)
    
    // Assign best available
    assignGuide(slot, scored[0].guide)
    updateDynamicConstraints(scored[0].guide, slot.date)
  }
  
  return validateSchedule(month)
}

function calculateFairnessScore(guide, month) {
  return {
    totalShifts: guide.shifts.length,
    weekendShifts: guide.weekendShifts.length,
    consecutiveDays: checkConsecutive(guide),
    weeklyLoad: getWeeklyLoad(guide)
  }
}
```

### Future Enhancement Path
- Level 2: Pattern recognition from manual assignments
- Level 3: Machine learning from historical data
- Level 4: Predictive optimization

---

## 📱 Mobile & Communication

### Draft Notification Template

```
Subject: Your December Schedule - Review Required

Hi [Guide Name],

Your draft schedule for December is ready for review.

Your Shifts:
• Sun Dec 3: Morning shift (09:00-09:00)
• Thu Dec 7: Overlap shift (09:00-10:00)  
• Sun Dec 10: Morning shift (09:00-09:00)

Please review and respond within 24 hours.
Silence will be considered acceptance.

[View Full Schedule] [Accept All] [Report Issues]
```

### Mobile Web App Views
1. **My Schedule**: Personal shifts only
2. **Team View**: See who's working when
3. **Quick Actions**: Request swap, report issue
4. **Calendar Sync**: Export to personal calendar

---

## 📊 Analytics & Reports

### Coordinator Dashboard Metrics

1. **Coverage Analysis**
   - Filled slots: 95%
   - Gaps: 3 slots
   - Understaffed days: 2

2. **Fairness Metrics**
   - Average shifts: 8.5
   - Standard deviation: 1.2
   - Most shifts: David (11)
   - Least shifts: Sarah (6)

3. **Constraint Impact**
   - Total constraints: 45
   - Weekly constraints: 12
   - Vacation days: 15

4. **Cost Analysis**
   - Regular hours: 520
   - Overtime hours: 45
   - Standby hours: 128

### Export Options
- Excel spreadsheet
- PDF report
- CSV data
- Print-friendly HTML

---

## 🚀 Implementation Plan

### Development Phases

#### Phase 1: Foundation (Day 1-2)
- [ ] Database schema implementation
- [ ] Basic CRUD APIs
- [ ] Authentication setup

#### Phase 2: Constraint System (Day 3-4)
- [ ] Constraint input UI
- [ ] Validation logic
- [ ] Approval workflow

#### Phase 3: Manual Scheduler (Day 5-7)
- [ ] Calendar grid component
- [ ] Drag & drop functionality
- [ ] Dynamic constraints
- [ ] Real-time validation

#### Phase 4: Auto-Scheduler (Day 8-9)
- [ ] Algorithm implementation
- [ ] Fairness calculations
- [ ] Gap detection

#### Phase 5: Draft System (Day 10-11)
- [ ] Notification system
- [ ] Feedback collection
- [ ] Revision logic

#### Phase 6: Polish & Testing (Day 12-14)
- [ ] UI refinements
- [ ] Performance optimization
- [ ] User testing
- [ ] Bug fixes

---

## 🎯 Success Criteria

### Quantitative Metrics
- Schedule creation time: <30 minutes
- Draft iterations: <2 per month
- Coverage completeness: >95%
- Fairness deviation: <15%
- User satisfaction: >4/5

### Qualitative Goals
- Intuitive interface requiring minimal training
- Reduced coordinator stress
- Fair guide satisfaction
- Flexible enough for exceptions
- Reliable and stable operation

---

## 🔧 Configuration & Settings

### System Configuration
```typescript
const SCHEDULING_CONFIG = {
  MAX_WEEKDAY_SHIFTS: 2,
  MAX_CONSECUTIVE_DAYS: 1,
  DRAFT_RESPONSE_HOURS: 24,
  AUTO_SAVE_SECONDS: 30,
  CONSTRAINT_DEADLINE_DAY: 20,
  DEFAULT_WEEKEND_PATTERN: 'ALTERNATING',
  ALLOW_COORDINATOR_OVERRIDE: true,
  SILENCE_MEANS_ACCEPTANCE: true
}
```

### Holiday Templates
```typescript
const HOLIDAY_PATTERNS = {
  ROSH_HASHANA: {
    eve: { type: 'CLOSING', time: '10:00' },
    day1: { type: 'CLOSED', staff: 'STANDBY' },
    day2: { type: 'OPENING', time: '10:00' }
  },
  YOM_KIPPUR: {
    eve: { type: 'CLOSING', time: '14:00' },
    day: { type: 'CLOSED', staff: 'NONE' }
  }
  // ... more holidays
}
```

---

## 🤝 Development Workflow

### Recommended Claude + Claude Code Integration

1. **Architecture & Logic**: Use Claude (this AI) for:
   - System design decisions
   - Algorithm design
   - Complex logic flows
   - Performance optimization strategies
   - Problem-solving

2. **Implementation**: Use Claude Code for:
   - Writing actual code
   - File creation/modification
   - Component implementation
   - Testing and debugging

3. **Iteration Pattern**:
   ```
   Design (Claude) → Build (Claude Code) → Test (You) → 
   Refine (Claude) → Fix (Claude Code) → Deploy
   ```

---

## 📝 Notes & Considerations

### Hebrew/RTL Support
- All UI components must support RTL
- Use Heebo font for Hebrew text
- Date format: DD/MM/YYYY
- Week starts on Sunday

### Future Enhancements
- Shift swap marketplace
- ML-based predictions
- Mobile native app
- Integration with payroll
- Advanced analytics dashboard

### Known Complexities
- Holiday patterns vary yearly
- Closed weekend כונן continuity
- Dynamic constraint cascading
- Multi-house coordination
- Real-time collaborative editing

---

## ✅ Checklist for Implementation

### Pre-Development
- [x] Requirements gathered
- [x] Database schema designed
- [x] UI/UX mockups created
- [x] Algorithm logic defined
- [ ] Test data prepared

### Development
- [ ] Database migrations
- [ ] API endpoints
- [ ] UI components
- [ ] Business logic
- [ ] Integration testing

### Deployment
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Documentation
- [ ] Training materials
- [ ] Go-live plan

---

*Last Updated: [Current Date]*
*Version: 1.0*
*Status: Ready for Implementation*