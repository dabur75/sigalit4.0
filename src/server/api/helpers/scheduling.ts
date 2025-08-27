import { type PrismaClient } from '@prisma/client';
import { ConstraintStatus, AssignmentRole, ShiftType } from '@prisma/client';

/**
 * Check if a guide is available on a specific date
 * Considers all constraint types: monthly, weekly, vacations, dynamic constraints
 */
export async function checkGuideAvailability(
  prisma: PrismaClient,
  guideId: string,
  date: Date,
  scheduleId: string,
  excludeAssignmentId?: string
): Promise<{
  isAvailable: boolean;
  blockedBy: string | null;
  warning: string | null;
}> {
  const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
  
  // Check weekly constraints
  const weeklyConstraint = await prisma.weeklyConstraint.findFirst({
    where: {
      userId: guideId,
      dayOfWeek: dayOfWeek,
      status: ConstraintStatus.ACTIVE,
    },
  });
  
  if (weeklyConstraint) {
    return {
      isAvailable: false,
      blockedBy: `weekly_constraint_${weeklyConstraint.id}`,
      warning: null,
    };
  }

  // Check monthly constraints (existing constraint model)
  const monthlyConstraint = await prisma.constraint.findFirst({
    where: {
      userId: guideId,
      date: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
      type: 'UNAVAILABLE',
    },
  });

  if (monthlyConstraint) {
    return {
      isAvailable: false,
      blockedBy: `monthly_constraint_${monthlyConstraint.id}`,
      warning: null,
    };
  }

  // Check dynamic constraints (consecutive day prevention)
  const dynamicConstraint = await prisma.dynamicConstraint.findFirst({
    where: {
      guideId: guideId,
      blockedDate: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
      scheduleId: scheduleId,
    },
  });

  if (dynamicConstraint) {
    return {
      isAvailable: false,
      blockedBy: `dynamic_constraint_${dynamicConstraint.id}`,
      warning: null,
    };
  }

  // Check existing assignments on the same date
  const existingAssignment = await prisma.scheduleAssignment.findFirst({
    where: {
      guideId: guideId,
      date: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
      ...(excludeAssignmentId && { id: { not: excludeAssignmentId } }),
    },
  });

  if (existingAssignment) {
    return {
      isAvailable: false,
      blockedBy: `existing_assignment_${existingAssignment.id}`,
      warning: null,
    };
  }

  // Check coordinator rules for the guide's house
  const guide = await prisma.user.findUnique({
    where: { id: guideId },
    include: { house: { include: { coordinatorRules: true } } },
  });

  if (guide?.house?.coordinatorRules) {
    for (const rule of guide.house.coordinatorRules) {
      if (!rule.isActive) continue;

      // Check NO_WEEKENDS rule
      if (rule.ruleType === 'NO_WEEKENDS' && (dayOfWeek === 5 || dayOfWeek === 6)) {
        const parameters = rule.parameters as { guideIds?: string[] };
        if (parameters.guideIds?.includes(guideId)) {
          return {
            isAvailable: false,
            blockedBy: `coordinator_rule_${rule.id}`,
            warning: null,
          };
        }
      }
    }
  }

  // Check for workload warnings (soft constraints)
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);

  const monthlyAssignments = await prisma.scheduleAssignment.count({
    where: {
      guideId: guideId,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
  });

  let warning = null;
  if (monthlyAssignments >= 8) {
    warning = 'high_workload';
  } else if (monthlyAssignments >= 6) {
    warning = 'medium_workload';
  }

  return {
    isAvailable: true,
    blockedBy: null,
    warning: warning,
  };
}

/**
 * Calculate consecutive days for a guide around a specific date
 */
export async function calculateConsecutiveDays(
  prisma: PrismaClient,
  guideId: string,
  date: Date
): Promise<{ before: number; after: number; total: number }> {
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Count consecutive days before
  let daysBefore = 0;
  let checkDate = new Date(dateOnly);
  checkDate.setDate(checkDate.getDate() - 1);
  
  while (daysBefore < 7) { // Max check 7 days back
    const assignment = await prisma.scheduleAssignment.findFirst({
      where: {
        guideId: guideId,
        date: {
          gte: checkDate,
          lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });
    
    if (!assignment) break;
    daysBefore++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days after
  let daysAfter = 0;
  checkDate = new Date(dateOnly);
  checkDate.setDate(checkDate.getDate() + 1);
  
  while (daysAfter < 7) { // Max check 7 days forward
    const assignment = await prisma.scheduleAssignment.findFirst({
      where: {
        guideId: guideId,
        date: {
          gte: checkDate,
          lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });
    
    if (!assignment) break;
    daysAfter++;
    checkDate.setDate(checkDate.getDate() + 1);
  }

  return {
    before: daysBefore,
    after: daysAfter,
    total: daysBefore + 1 + daysAfter,
  };
}

/**
 * Validate scheduling rules for an assignment
 */
export async function validateSchedulingRules(
  prisma: PrismaClient,
  assignment: {
    guideId: string;
    date: Date;
    role: AssignmentRole;
    shiftType: ShiftType;
    scheduleId: string;
  },
  excludeAssignmentId?: string
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check availability
  const availability = await checkGuideAvailability(
    prisma,
    assignment.guideId,
    assignment.date,
    assignment.scheduleId,
    excludeAssignmentId
  );

  if (!availability.isAvailable) {
    errors.push(`Guide is not available: ${availability.blockedBy}`);
  }

  if (availability.warning) {
    warnings.push(`Guide has ${availability.warning}`);
  }

  // Check consecutive days rule
  const consecutiveDays = await calculateConsecutiveDays(
    prisma,
    assignment.guideId,
    assignment.date
  );

  if (consecutiveDays.total > 1) {
    errors.push(`Would create ${consecutiveDays.total} consecutive days`);
  }

  // Check weekly workload limits
  const weekStart = new Date(assignment.date);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // End of week (Saturday)

  const weeklyAssignments = await prisma.scheduleAssignment.count({
    where: {
      guideId: assignment.guideId,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
      shiftType: {
        in: [ShiftType.WEEKDAY],
      },
      ...(excludeAssignmentId && { id: { not: excludeAssignmentId } }),
    },
  });

  if (assignment.shiftType === ShiftType.WEEKDAY && weeklyAssignments >= 2) {
    errors.push('Maximum 2 weekday shifts per week exceeded');
  }

  // Check role compatibility for the same date
  const dateStart = new Date(assignment.date.getFullYear(), assignment.date.getMonth(), assignment.date.getDate());
  const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

  const sameDayAssignments = await prisma.scheduleAssignment.findMany({
    where: {
      date: {
        gte: dateStart,
        lt: dateEnd,
      },
      schedule: {
        houseId: (await prisma.schedule.findUnique({
          where: { id: assignment.scheduleId },
          select: { houseId: true }
        }))?.houseId,
      },
      ...(excludeAssignmentId && { id: { not: excludeAssignmentId } }),
    },
  });

  // Weekend role validation
  const dayOfWeek = assignment.date.getDay();
  if ((dayOfWeek === 5 || dayOfWeek === 6) && assignment.shiftType === ShiftType.OPEN_WEEKEND) {
    // Open weekend should have 2 guides each day
    const sameDayCount = sameDayAssignments.length;
    if (sameDayCount >= 2) {
      warnings.push('Open weekend already has 2 guides assigned');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate dynamic constraints for an assignment (consecutive day prevention)
 */
export async function generateDynamicConstraints(
  prisma: PrismaClient,
  assignment: {
    id: string;
    guideId: string;
    date: Date;
    scheduleId: string;
  }
): Promise<void> {
  const constraints = [];
  
  // Block day before
  const dayBefore = new Date(assignment.date);
  dayBefore.setDate(dayBefore.getDate() - 1);
  
  constraints.push({
    guideId: assignment.guideId,
    blockedDate: dayBefore,
    sourceDate: assignment.date,
    scheduleId: assignment.scheduleId,
  });

  // Block day after
  const dayAfter = new Date(assignment.date);
  dayAfter.setDate(dayAfter.getDate() + 1);
  
  constraints.push({
    guideId: assignment.guideId,
    blockedDate: dayAfter,
    sourceDate: assignment.date,
    scheduleId: assignment.scheduleId,
  });

  // Create constraints, ignoring duplicates
  for (const constraint of constraints) {
    try {
      await prisma.dynamicConstraint.create({
        data: constraint,
      });
    } catch (error) {
      // Ignore duplicate constraint errors (unique constraint violation)
      if (!(error instanceof Error && error.message.includes('unique constraint'))) {
        throw error;
      }
    }
  }
}

/**
 * Remove dynamic constraints for a specific assignment
 */
export async function removeDynamicConstraints(
  prisma: PrismaClient,
  assignment: {
    guideId: string;
    date: Date;
    scheduleId: string;
  }
): Promise<void> {
  await prisma.dynamicConstraint.deleteMany({
    where: {
      guideId: assignment.guideId,
      sourceDate: assignment.date,
      scheduleId: assignment.scheduleId,
    },
  });
}