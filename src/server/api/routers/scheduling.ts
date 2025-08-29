import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { 
  ScheduleStatus, 
  AssignmentRole, 
  ShiftType, 
  ConstraintType,
  ConstraintStatus,
  UserRole 
} from '@prisma/client';
import {
  checkGuideAvailability,
  calculateConsecutiveDays,
  validateSchedulingRules,
  generateDynamicConstraints,
  removeDynamicConstraints,
} from '~/server/api/helpers/scheduling';

// Input validation schemas
const createScheduleSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2024),
  houseId: z.string(),
});

const getScheduleByMonthSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2024),
  houseId: z.string(),
  version: z.number().optional(),
});

const createAssignmentSchema = z.object({
  scheduleId: z.string(),
  date: z.date(),
  guideId: z.string(),
  role: z.nativeEnum(AssignmentRole),
  shiftType: z.nativeEnum(ShiftType),
  isManual: z.boolean().default(true),
  isLocked: z.boolean().default(false),
});

const updateAssignmentSchema = z.object({
  id: z.string(),
  role: z.nativeEnum(AssignmentRole).optional(),
  shiftType: z.nativeEnum(ShiftType).optional(),
  isLocked: z.boolean().optional(),
  isConfirmed: z.boolean().optional(),
  rejectionReason: z.string().optional(),
});

const deleteAssignmentSchema = z.object({
  id: z.string(),
});

const getAvailableGuidesSchema = z.object({
  date: z.date(),
  scheduleId: z.string(),
  excludeGuideId: z.string().optional(),
});

const getMonthlyConstraintsSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2024),
  houseId: z.string(),
  userId: z.string().optional(), // If not provided, get all users in house
});

const createMonthlyConstraintSchema = z.object({
  userId: z.string(),
  houseId: z.string(),
  date: z.date(),
  type: z.nativeEnum(ConstraintType),
  description: z.string().optional(),
});

const generateDynamicConstraintsSchema = z.object({
  scheduleId: z.string(),
});

// Weekly constraint schemas
const getWeeklyConstraintsSchema = z.object({
  userId: z.string().optional(),
  houseId: z.string(),
  status: z.nativeEnum(ConstraintStatus).optional(),
});

const createWeeklyConstraintSchema = z.object({
  userId: z.string(),
  dayOfWeek: z.number().min(0).max(6),
  reason: z.string().optional(),
  status: z.nativeEnum(ConstraintStatus).default(ConstraintStatus.ACTIVE),
});

const updateWeeklyConstraintSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(ConstraintStatus).optional(),
  reason: z.string().optional(),
  approvedBy: z.string().optional(),
});

// Coordinator rule schemas
const getCoordinatorRulesSchema = z.object({
  houseId: z.string(),
  isActive: z.boolean().optional(),
});

const createCoordinatorRuleSchema = z.object({
  houseId: z.string(),
  ruleType: z.string(),
  parameters: z.any(),
  isActive: z.boolean().default(true),
});

// Vacation request schemas
const createVacationRequestSchema = z.object({
  userId: z.string(),
  houseId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().optional(),
});

const getVacationRequestsSchema = z.object({
  houseId: z.string(),
  userId: z.string().optional(),
  status: z.nativeEnum(ConstraintStatus).optional(),
});

const approveVacationRequestSchema = z.object({
  requestId: z.string(),
  approvedBy: z.string(),
});

const rejectVacationRequestSchema = z.object({
  requestId: z.string(),
  rejectionReason: z.string(),
});

const cancelVacationRequestSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  userId: z.string(),
});

// Weekly constraint approval schemas
const approveWeeklyConstraintSchema = z.object({
  constraintId: z.string(),
});

const rejectWeeklyConstraintSchema = z.object({
  constraintId: z.string(),
  rejectionReason: z.string(),
});

// Coordinator management schemas
const createConstraintForGuideSchema = z.object({
  guideId: z.string(),
  constraintType: z.enum(['MONTHLY', 'WEEKLY']),
  // For monthly constraints
  date: z.date().optional(),
  // For weekly constraints
  dayOfWeek: z.number().min(0).max(6).optional(),
  reason: z.string().optional(),
});

const deleteGuideConstraintSchema = z.object({
  constraintId: z.string(),
  constraintType: z.enum(['MONTHLY', 'WEEKLY']),
});

const getConstraintsForApprovalSchema = z.object({
  houseId: z.string(),
});

const getGuideMonthlyStatsSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  houseId: z.string(),
});

const getAssignmentsByScheduleSchema = z.object({
  scheduleId: z.string(),
});

const getGuideConstraintCountsSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  houseId: z.string(),
});

const deleteMonthlyConstraintSchema = z.object({
  constraintId: z.string(),
});

export const schedulingRouter = createTRPCRouter({
  // Create a new schedule for a month
  createSchedule: protectedProcedure
    .input(createScheduleSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - only COORDINATOR or ADMIN can create schedules
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can create schedules',
        });
      }

      // Check if user has access to this house
      if (user.role === UserRole.COORDINATOR && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only create schedules for your assigned house',
        });
      }

      // Check if schedule already exists for this month/year/house
      const existingSchedule = await db.schedule.findFirst({
        where: {
          month: input.month,
          year: input.year,
          houseId: input.houseId,
        },
        orderBy: {
          version: 'desc',
        },
      });

      const newVersion = existingSchedule ? existingSchedule.version + 1 : 1;

      return db.schedule.create({
        data: {
          month: input.month,
          year: input.year,
          version: newVersion,
          houseId: input.houseId,
          createdBy: user.id,
        },
        include: {
          house: true,
          creator: { select: { id: true, name: true, username: true } },
          assignments: {
            include: {
              guide: { select: { id: true, name: true, username: true } },
              creator: { select: { id: true, name: true, username: true } },
            },
            orderBy: { date: 'asc' },
          },
        },
      });
    }),

  // Get schedule by month/year/house
  getScheduleByMonth: protectedProcedure
    .input(getScheduleByMonthSchema)
    .query(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions for house access
      if (user.role === UserRole.GUIDE && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view schedules for your assigned house',
        });
      }

      if (user.role === UserRole.COORDINATOR && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view schedules for your assigned house',
        });
      }

      const whereClause = {
        month: input.month,
        year: input.year,
        houseId: input.houseId,
        ...(input.version && { version: input.version }),
      };

      return db.schedule.findFirst({
        where: whereClause,
        orderBy: { version: 'desc' },
        include: {
          house: true,
          creator: { select: { id: true, name: true, username: true } },
          assignments: {
            include: {
              guide: { select: { id: true, name: true, username: true } },
              creator: { select: { id: true, name: true, username: true } },
            },
            orderBy: { date: 'asc' },
          },
        },
      });
    }),

  // Create a new assignment
  createAssignment: protectedProcedure
    .input(createAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - only COORDINATOR or ADMIN can create assignments
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can create assignments',
        });
      }

      // Get schedule to check permissions
      const schedule = await db.schedule.findUnique({
        where: { id: input.scheduleId },
        include: { house: true },
      });

      if (!schedule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Schedule not found',
        });
      }

      // Check if user has access to this house
      if (user.role === UserRole.COORDINATOR && user.houseId !== schedule.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only create assignments for your assigned house',
        });
      }

      // Check if schedule is still editable
      if (schedule.status === ScheduleStatus.FORMAL || schedule.status === ScheduleStatus.ARCHIVED) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot modify assignments in a formal or archived schedule',
        });
      }

      // Validate assignment rules
      const validation = await validateSchedulingRules(db, {
        guideId: input.guideId,
        date: input.date,
        role: input.role,
        shiftType: input.shiftType,
        scheduleId: input.scheduleId,
      });

      if (!validation.isValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Assignment validation failed: ${validation.errors.join(', ')}`,
        });
      }

      // Create the assignment
      const assignment = await db.scheduleAssignment.create({
        data: {
          scheduleId: input.scheduleId,
          date: input.date,
          guideId: input.guideId,
          role: input.role,
          shiftType: input.shiftType,
          isManual: input.isManual,
          isLocked: input.isLocked,
          createdBy: user.id,
        },
        include: {
          guide: { select: { id: true, name: true, username: true } },
          creator: { select: { id: true, name: true, username: true } },
        },
      });

      // Generate dynamic constraints
      await generateDynamicConstraints(db, {
        id: assignment.id,
        guideId: assignment.guideId,
        date: assignment.date,
        scheduleId: assignment.scheduleId,
      });

      return assignment;
    }),

  // Update an existing assignment
  updateAssignment: protectedProcedure
    .input(updateAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Get existing assignment
      const existingAssignment = await db.scheduleAssignment.findUnique({
        where: { id: input.id },
        include: { 
          schedule: { include: { house: true } },
          guide: true,
        },
      });

      if (!existingAssignment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assignment not found',
        });
      }

      // Check permissions
      const canEdit = 
        user.role === UserRole.ADMIN ||
        (user.role === UserRole.COORDINATOR && user.houseId === existingAssignment.schedule.houseId) ||
        (user.role === UserRole.GUIDE && user.id === existingAssignment.guideId && input.isConfirmed !== undefined);

      if (!canEdit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this assignment',
        });
      }

      // If updating core assignment details, validate rules
      if (input.role || input.shiftType) {
        const validation = await validateSchedulingRules(db, {
          guideId: existingAssignment.guideId,
          date: existingAssignment.date,
          role: input.role ?? existingAssignment.role,
          shiftType: input.shiftType ?? existingAssignment.shiftType,
          scheduleId: existingAssignment.scheduleId,
        }, input.id);

        if (!validation.isValid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Assignment validation failed: ${validation.errors.join(', ')}`,
          });
        }
      }

      // Update the assignment
      return db.scheduleAssignment.update({
        where: { id: input.id },
        data: {
          ...(input.role && { role: input.role }),
          ...(input.shiftType && { shiftType: input.shiftType }),
          ...(input.isLocked !== undefined && { isLocked: input.isLocked }),
          ...(input.isConfirmed !== undefined && { isConfirmed: input.isConfirmed }),
          ...(input.rejectionReason !== undefined && { rejectionReason: input.rejectionReason }),
        },
        include: {
          guide: { select: { id: true, name: true, username: true } },
          creator: { select: { id: true, name: true, username: true } },
        },
      });
    }),

  // Delete an assignment
  deleteAssignment: protectedProcedure
    .input(deleteAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Get existing assignment
      const existingAssignment = await db.scheduleAssignment.findUnique({
        where: { id: input.id },
        include: { schedule: { include: { house: true } } },
      });

      if (!existingAssignment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assignment not found',
        });
      }

      // Check permissions - only COORDINATOR or ADMIN can delete assignments
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can delete assignments',
        });
      }

      if (user.role === UserRole.COORDINATOR && user.houseId !== existingAssignment.schedule.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete assignments from your assigned house',
        });
      }

      // Remove dynamic constraints
      await removeDynamicConstraints(db, {
        guideId: existingAssignment.guideId,
        date: existingAssignment.date,
        scheduleId: existingAssignment.scheduleId,
      });

      // Delete the assignment
      return db.scheduleAssignment.delete({
        where: { id: input.id },
      });
    }),

  // Get available guides for a specific date
  getAvailableGuides: protectedProcedure
    .input(getAvailableGuidesSchema)
    .query(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Get schedule to check house
      const schedule = await db.schedule.findUnique({
        where: { id: input.scheduleId },
        include: { house: true },
      });

      if (!schedule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Schedule not found',
        });
      }

      // Check permissions for house access
      if (user.role === UserRole.GUIDE && user.houseId !== schedule.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view guides for your assigned house',
        });
      }

      if (user.role === UserRole.COORDINATOR && user.houseId !== schedule.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view guides for your assigned house',
        });
      }

      // Get all guides in the house
      const guides = await db.user.findMany({
        where: {
          role: UserRole.GUIDE,
          houseId: schedule.houseId,
          isActive: true,
          ...(input.excludeGuideId && { id: { not: input.excludeGuideId } }),
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
        orderBy: { name: 'asc' },
      });

      // Check availability for each guide
      const availableGuides = await Promise.all(
        guides.map(async (guide) => {
          const availability = await checkGuideAvailability(
            db,
            guide.id,
            input.date,
            input.scheduleId
          );

          // Get current month statistics
          const monthStart = new Date(input.date.getFullYear(), input.date.getMonth(), 1);
          const monthEnd = new Date(input.date.getFullYear(), input.date.getMonth() + 1, 0);

          const monthlyStats = await db.scheduleAssignment.count({
            where: {
              guideId: guide.id,
              date: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
          });

          return {
            ...guide,
            isAvailable: availability.isAvailable,
            blockedBy: availability.blockedBy,
            warning: availability.warning,
            monthlyAssignments: monthlyStats,
          };
        })
      );

      // Sort by availability, then by monthly assignments (fairness)
      return availableGuides.sort((a, b) => {
        // Available guides first
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        
        // Among available guides, sort by fairness (fewer assignments first)
        if (a.isAvailable && b.isAvailable) {
          return a.monthlyAssignments - b.monthlyAssignments;
        }
        
        // Among unavailable guides, sort alphabetically
        return a.name.localeCompare(b.name, 'he');
      });
    }),

  // Get monthly constraints for a house
  getMonthlyConstraints: protectedProcedure
    .input(getMonthlyConstraintsSchema)
    .query(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions for house access
      if (user.role === UserRole.GUIDE && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view constraints for your assigned house',
        });
      }

      if (user.role === UserRole.COORDINATOR && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view constraints for your assigned house',
        });
      }

      const monthStart = new Date(input.year, input.month - 1, 1);
      const monthEnd = new Date(input.year, input.month, 0);

      return db.constraint.findMany({
        where: {
          houseId: input.houseId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
          ...(input.userId && { userId: input.userId }),
        },
        include: {
          user: { select: { id: true, name: true, username: true } },
        },
        orderBy: [{ date: 'asc' }, { user: { name: 'asc' } }],
      });
    }),

  // Create a monthly constraint
  createMonthlyConstraint: protectedProcedure
    .input(createMonthlyConstraintSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions
      const canCreate = 
        user.role === UserRole.ADMIN ||
        (user.role === UserRole.COORDINATOR && user.houseId === input.houseId) ||
        (user.role === UserRole.GUIDE && user.id === input.userId && user.houseId === input.houseId);

      if (!canCreate) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create constraints for this user/house',
        });
      }

      // Check if constraint already exists for this user/date
      const existing = await db.constraint.findFirst({
        where: {
          userId: input.userId,
          houseId: input.houseId,
          date: {
            gte: new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate()),
            lt: new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate() + 1),
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Constraint already exists for this date',
        });
      }

      return db.constraint.create({
        data: {
          userId: input.userId,
          houseId: input.houseId,
          date: input.date,
          type: input.type,
          description: input.description,
        },
        include: {
          user: { select: { id: true, name: true, username: true } },
          house: { select: { id: true, name: true, code: true } },
        },
      });
    }),

  // Generate dynamic constraints for all assignments in a schedule
  generateDynamicConstraints: protectedProcedure
    .input(generateDynamicConstraintsSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - only COORDINATOR or ADMIN
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can generate dynamic constraints',
        });
      }

      // Get schedule and check permissions
      const schedule = await db.schedule.findUnique({
        where: { id: input.scheduleId },
        include: { assignments: true },
      });

      if (!schedule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Schedule not found',
        });
      }

      if (user.role === UserRole.COORDINATOR && user.houseId !== schedule.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only generate constraints for your assigned house',
        });
      }

      // Clear existing dynamic constraints for this schedule
      await db.dynamicConstraint.deleteMany({
        where: { scheduleId: input.scheduleId },
      });

      // Generate constraints for all assignments
      let constraintsGenerated = 0;
      for (const assignment of schedule.assignments) {
        await generateDynamicConstraints(db, {
          id: assignment.id,
          guideId: assignment.guideId,
          date: assignment.date,
          scheduleId: assignment.scheduleId,
        });
        constraintsGenerated += 2; // One for day before, one for day after
      }

      return {
        scheduleId: input.scheduleId,
        constraintsGenerated,
        message: `Generated ${constraintsGenerated} dynamic constraints`,
      };
    }),

  // Get weekly constraints
  getWeeklyConstraints: protectedProcedure
    .input(getWeeklyConstraintsSchema)
    .query(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions for house access
      if (user.role === UserRole.GUIDE && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view constraints for your assigned house',
        });
      }

      if (user.role === UserRole.COORDINATOR && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view constraints for your assigned house',
        });
      }

      return db.weeklyConstraint.findMany({
        where: {
          user: {
            houseId: input.houseId,
          },
          ...(input.userId && { userId: input.userId }),
          ...(input.status && { status: input.status }),
        },
        include: {
          user: { select: { id: true, name: true, username: true } },
          approver: { select: { id: true, name: true, username: true } },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { user: { name: 'asc' } }],
      });
    }),

  // Create a weekly constraint
  createWeeklyConstraint: protectedProcedure
    .input(createWeeklyConstraintSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Get the user being constrained to check house
      const constrainedUser = await db.user.findUnique({
        where: { id: input.userId },
      });

      if (!constrainedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Check permissions
      const canCreate = 
        user.role === UserRole.ADMIN ||
        (user.role === UserRole.COORDINATOR && user.houseId === constrainedUser.houseId) ||
        (user.role === UserRole.GUIDE && user.id === input.userId);

      if (!canCreate) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create constraints for this user',
        });
      }

      // Check if constraint already exists for this user/day
      const existing = await db.weeklyConstraint.findUnique({
        where: {
          userId_dayOfWeek: {
            userId: input.userId,
            dayOfWeek: input.dayOfWeek,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Weekly constraint already exists for this day',
        });
      }

      return db.weeklyConstraint.create({
        data: {
          userId: input.userId,
          dayOfWeek: input.dayOfWeek,
          reason: input.reason,
          status: input.status,
          // Auto-approve if coordinator/admin creates it
          ...(user.role !== UserRole.GUIDE && { approvedBy: user.id }),
        },
        include: {
          user: { select: { id: true, name: true, username: true } },
          approver: { select: { id: true, name: true, username: true } },
        },
      });
    }),

  // Update a weekly constraint
  updateWeeklyConstraint: protectedProcedure
    .input(updateWeeklyConstraintSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Get existing constraint
      const existingConstraint = await db.weeklyConstraint.findUnique({
        where: { id: input.id },
        include: { user: true },
      });

      if (!existingConstraint) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Weekly constraint not found',
        });
      }

      // Check permissions
      const canUpdate = 
        user.role === UserRole.ADMIN ||
        (user.role === UserRole.COORDINATOR && user.houseId === existingConstraint.user.houseId) ||
        (user.role === UserRole.GUIDE && user.id === existingConstraint.userId && !input.approvedBy);

      if (!canUpdate) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this constraint',
        });
      }

      return db.weeklyConstraint.update({
        where: { id: input.id },
        data: {
          ...(input.status && { status: input.status }),
          ...(input.reason !== undefined && { reason: input.reason }),
          ...(input.approvedBy && { approvedBy: input.approvedBy }),
        },
        include: {
          user: { select: { id: true, name: true, username: true } },
          approver: { select: { id: true, name: true, username: true } },
        },
      });
    }),

  // Get coordinator rules for a house
  getCoordinatorRules: protectedProcedure
    .input(getCoordinatorRulesSchema)
    .query(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions for house access
      if (user.role === UserRole.GUIDE && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view rules for your assigned house',
        });
      }

      if (user.role === UserRole.COORDINATOR && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view rules for your assigned house',
        });
      }

      return db.coordinatorRule.findMany({
        where: {
          houseId: input.houseId,
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
        include: {
          house: { select: { id: true, name: true, code: true } },
          creator: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Create a coordinator rule
  createCoordinatorRule: protectedProcedure
    .input(createCoordinatorRuleSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - only COORDINATOR or ADMIN can create rules
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can create rules',
        });
      }

      // Check if user has access to this house
      if (user.role === UserRole.COORDINATOR && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only create rules for your assigned house',
        });
      }

      return db.coordinatorRule.create({
        data: {
          houseId: input.houseId,
          ruleType: input.ruleType,
          parameters: input.parameters,
          isActive: input.isActive,
          createdBy: user.id,
        },
        include: {
          house: { select: { id: true, name: true, code: true } },
          creator: { select: { id: true, name: true, username: true } },
        },
      });
    }),

  // ===============================
  // VACATION REQUEST MANAGEMENT (4 procedures)
  // ===============================

  // Create vacation request
  createVacationRequest: protectedProcedure
    .input(createVacationRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Get the user being constrained to check house
      const constrainedUser = await db.user.findUnique({
        where: { id: input.userId },
      });

      if (!constrainedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Check permissions - guides can only create for themselves
      const canCreate = 
        user.role === UserRole.ADMIN ||
        (user.role === UserRole.COORDINATOR && user.houseId === input.houseId) ||
        (user.role === UserRole.GUIDE && user.id === input.userId && user.houseId === input.houseId);

      if (!canCreate) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create vacation requests for this user',
        });
      }

      // Validate date range
      if (input.startDate >= input.endDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Start date must be before end date',
        });
      }

      // Check for overlapping vacation requests
      const overlapping = await db.constraint.findFirst({
        where: {
          userId: input.userId,
          type: ConstraintType.VACATION,
          OR: [
            {
              date: {
                gte: input.startDate,
                lte: input.endDate,
              },
            },
            // Check if existing vacation spans the new request dates
            {
              AND: [
                { date: { lte: input.startDate } },
                // Assuming vacation constraints store end date in description
                // This would need to be refined based on actual data model
              ],
            },
          ],
        },
      });

      if (overlapping) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Overlapping vacation request already exists',
        });
      }

      // Create vacation constraints for each day in the range
      const vacationDays = [];
      const currentDate = new Date(input.startDate);
      
      while (currentDate <= input.endDate) {
        vacationDays.push({
          userId: input.userId,
          houseId: input.houseId,
          date: new Date(currentDate),
          type: ConstraintType.VACATION,
          description: input.reason || 'חופשה',
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Create all vacation constraints in a transaction
      const createdConstraints = await db.$transaction(
        vacationDays.map(vacationDay =>
          db.constraint.create({
            data: vacationDay,
            include: {
              user: { select: { id: true, name: true, username: true } },
            },
          })
        )
      );

      return {
        message: `Created ${createdConstraints.length} vacation day constraints`,
        constraints: createdConstraints,
        startDate: input.startDate,
        endDate: input.endDate,
      };
    }),

  // Get vacation requests
  getVacationRequests: protectedProcedure
    .input(getVacationRequestsSchema)
    .query(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions for house access
      if (user.role === UserRole.GUIDE && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view vacation requests for your assigned house',
        });
      }

      if (user.role === UserRole.COORDINATOR && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view vacation requests for your assigned house',
        });
      }

      return db.constraint.findMany({
        where: {
          houseId: input.houseId,
          type: ConstraintType.VACATION,
          ...(input.userId && { userId: input.userId }),
        },
        include: {
          user: { select: { id: true, name: true, username: true } },
        },
        orderBy: [{ date: 'asc' }, { user: { name: 'asc' } }],
      });
    }),

  // Approve vacation request
  approveVacationRequest: protectedProcedure
    .input(approveVacationRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - only COORDINATOR or ADMIN can approve
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can approve vacation requests',
        });
      }

      // Get the vacation constraint to check permissions
      const vacationConstraint = await db.constraint.findUnique({
        where: { id: input.requestId },
        include: { 
          user: true,
          house: true,
        },
      });

      if (!vacationConstraint) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vacation request not found',
        });
      }

      if (vacationConstraint.type !== ConstraintType.VACATION) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This is not a vacation request',
        });
      }

      // Check house permissions for coordinator
      if (user.role === UserRole.COORDINATOR && user.houseId !== vacationConstraint.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only approve vacation requests for your assigned house',
        });
      }

      // Update the constraint to mark as approved
      return db.constraint.update({
        where: { id: input.requestId },
        data: {
          description: `${vacationConstraint.description || 'חופשה'} - אושר על ידי ${user.name}`,
        },
        include: {
          user: { select: { id: true, name: true, username: true } },
        },
      });
    }),

  // Reject vacation request
  rejectVacationRequest: protectedProcedure
    .input(rejectVacationRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - only COORDINATOR or ADMIN can reject
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can reject vacation requests',
        });
      }

      // Get the vacation constraint to check permissions
      const vacationConstraint = await db.constraint.findUnique({
        where: { id: input.requestId },
        include: { 
          user: true,
          house: true,
        },
      });

      if (!vacationConstraint) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vacation request not found',
        });
      }

      if (vacationConstraint.type !== ConstraintType.VACATION) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This is not a vacation request',
        });
      }

      // Check house permissions for coordinator
      if (user.role === UserRole.COORDINATOR && user.houseId !== vacationConstraint.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only reject vacation requests for your assigned house',
        });
      }

      // Delete the vacation constraint (rejection means removal)
      await db.constraint.delete({
        where: { id: input.requestId },
      });

      return {
        message: 'Vacation request rejected and removed',
        rejectionReason: input.rejectionReason,
        rejectedBy: user.name,
      };
    }),

  // ===============================
  // WEEKLY CONSTRAINT APPROVAL (2 procedures)
  // ===============================

  // Approve weekly constraint
  approveWeeklyConstraint: protectedProcedure
    .input(approveWeeklyConstraintSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - only COORDINATOR or ADMIN can approve
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can approve weekly constraints',
        });
      }

      // Get the weekly constraint to check permissions
      const weeklyConstraint = await db.weeklyConstraint.findUnique({
        where: { id: input.constraintId },
        include: { user: true },
      });

      if (!weeklyConstraint) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Weekly constraint not found',
        });
      }

      // Check house permissions for coordinator
      if (user.role === UserRole.COORDINATOR && user.houseId !== weeklyConstraint.user.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only approve weekly constraints for your assigned house',
        });
      }

      // Update the constraint to mark as approved
      return db.weeklyConstraint.update({
        where: { id: input.constraintId },
        data: {
          approvedBy: user.id,
          status: ConstraintStatus.ACTIVE,
        },
        include: {
          user: { select: { id: true, name: true, username: true } },
          approver: { select: { id: true, name: true, username: true } },
        },
      });
    }),

  // Reject weekly constraint
  rejectWeeklyConstraint: protectedProcedure
    .input(rejectWeeklyConstraintSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - only COORDINATOR or ADMIN can reject
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can reject weekly constraints',
        });
      }

      // Get the weekly constraint to check permissions
      const weeklyConstraint = await db.weeklyConstraint.findUnique({
        where: { id: input.constraintId },
        include: { user: true },
      });

      if (!weeklyConstraint) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Weekly constraint not found',
        });
      }

      // Check house permissions for coordinator
      if (user.role === UserRole.COORDINATOR && user.houseId !== weeklyConstraint.user.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only reject weekly constraints for your assigned house',
        });
      }

      // Update the constraint to mark as deleted with rejection reason
      return db.weeklyConstraint.update({
        where: { id: input.constraintId },
        data: {
          status: ConstraintStatus.DELETED,
          reason: `${weeklyConstraint.reason || ''} - נדחה: ${input.rejectionReason}`,
        },
        include: {
          user: { select: { id: true, name: true, username: true } },
          approver: { select: { id: true, name: true, username: true } },
        },
      });
    }),

  // ===============================
  // COORDINATOR MANAGEMENT POWERS (3 procedures)
  // ===============================

  // Create constraint for guide
  createConstraintForGuide: protectedProcedure
    .input(createConstraintForGuideSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - only COORDINATOR or ADMIN can create constraints for guides
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can create constraints for guides',
        });
      }

      // Get the guide to check house permissions
      const guide = await db.user.findUnique({
        where: { id: input.guideId },
      });

      if (!guide) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Guide not found',
        });
      }

      if (guide.role !== UserRole.GUIDE) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is not a guide',
        });
      }

      // Check house permissions for coordinator
      if (user.role === UserRole.COORDINATOR && user.houseId !== guide.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only create constraints for guides in your assigned house',
        });
      }

      if (input.constraintType === 'MONTHLY') {
        if (!input.date) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Date is required for monthly constraints',
          });
        }

        // Check if constraint already exists for this user/date
        const existing = await db.constraint.findFirst({
          where: {
            userId: input.guideId,
            houseId: guide.houseId!,
            date: {
              gte: new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate()),
              lt: new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate() + 1),
            },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Monthly constraint already exists for this date',
          });
        }

        return db.constraint.create({
          data: {
            userId: input.guideId,
            houseId: guide.houseId!,
            date: input.date,
            type: ConstraintType.UNAVAILABLE,
            description: `${input.reason || 'אילוץ'} - נוצר על ידי ${user.name}`,
          },
          include: {
            user: { select: { id: true, name: true, username: true } },
          },
        });

      } else if (input.constraintType === 'WEEKLY') {
        if (input.dayOfWeek === undefined) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Day of week is required for weekly constraints',
          });
        }

        // Check if constraint already exists for this user/day
        const existing = await db.weeklyConstraint.findUnique({
          where: {
            userId_dayOfWeek: {
              userId: input.guideId,
              dayOfWeek: input.dayOfWeek,
            },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Weekly constraint already exists for this day',
          });
        }

        return db.weeklyConstraint.create({
          data: {
            userId: input.guideId,
            dayOfWeek: input.dayOfWeek,
            reason: `${input.reason || 'אילוץ'} - נוצר על ידי ${user.name}`,
            status: ConstraintStatus.ACTIVE,
            approvedBy: user.id, // Auto-approved since created by coordinator
          },
          include: {
            user: { select: { id: true, name: true, username: true } },
            approver: { select: { id: true, name: true, username: true } },
          },
        });
      }

      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid constraint type',
      });
    }),

  // Delete guide constraint
  deleteGuideConstraint: protectedProcedure
    .input(deleteGuideConstraintSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - only COORDINATOR or ADMIN can delete guide constraints
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can delete guide constraints',
        });
      }

      if (input.constraintType === 'MONTHLY') {
        // Get the constraint to check permissions
        const constraint = await db.constraint.findUnique({
          where: { id: input.constraintId },
          include: { user: true },
        });

        if (!constraint) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Monthly constraint not found',
          });
        }

        // Check house permissions for coordinator
        if (user.role === UserRole.COORDINATOR && user.houseId !== constraint.user.houseId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only delete constraints for guides in your assigned house',
          });
        }

        await db.constraint.delete({
          where: { id: input.constraintId },
        });

        return {
          message: 'Monthly constraint deleted successfully',
          constraintType: 'MONTHLY',
        };

      } else if (input.constraintType === 'WEEKLY') {
        // Get the constraint to check permissions
        const constraint = await db.weeklyConstraint.findUnique({
          where: { id: input.constraintId },
          include: { user: true },
        });

        if (!constraint) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Weekly constraint not found',
          });
        }

        // Check house permissions for coordinator
        if (user.role === UserRole.COORDINATOR && user.houseId !== constraint.user.houseId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only delete constraints for guides in your assigned house',
          });
        }

        await db.weeklyConstraint.delete({
          where: { id: input.constraintId },
        });

        return {
          message: 'Weekly constraint deleted successfully',
          constraintType: 'WEEKLY',
        };
      }

      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid constraint type',
      });
    }),

  // Get constraints for approval
  getConstraintsForApproval: protectedProcedure
    .input(getConstraintsForApprovalSchema)
    .query(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - only COORDINATOR or ADMIN can view approval queue
      if (user.role !== UserRole.COORDINATOR && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only coordinators and admins can view approval queue',
        });
      }

      // Check house permissions for coordinator
      if (user.role === UserRole.COORDINATOR && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view approval queue for your assigned house',
        });
      }

      // Get pending weekly constraints
      const pendingWeeklyConstraints = await db.weeklyConstraint.findMany({
        where: {
          user: {
            houseId: input.houseId,
          },
          status: ConstraintStatus.ACTIVE,
          approvedBy: null, // Not yet approved
        },
        include: {
          user: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Get pending vacation requests (constraints without approval info)
      // Note: This would need refinement based on how vacation approval is tracked
      const pendingVacationRequests = await db.constraint.findMany({
        where: {
          houseId: input.houseId,
          type: ConstraintType.VACATION,
          // Add condition for pending approval if tracking mechanism exists
        },
        include: {
          user: { select: { id: true, name: true, username: true } },
        },
        orderBy: { date: 'asc' },
        take: 20, // Limit to recent requests
      });

      return {
        weeklyConstraints: pendingWeeklyConstraints,
        vacationRequests: pendingVacationRequests,
        totalPending: pendingWeeklyConstraints.length + pendingVacationRequests.length,
      };
    }),

  // Cancel vacation request (for guides to cancel their own pending requests)
  cancelVacationRequest: protectedProcedure
    .input(cancelVacationRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions - guides can only cancel their own requests, coordinators can cancel for their house
      const canCancel = 
        user.role === UserRole.ADMIN ||
        (user.role === UserRole.COORDINATOR) ||
        (user.role === UserRole.GUIDE && user.id === input.userId);

      if (!canCancel) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel this vacation request',
        });
      }

      // Get the user to check house permissions for coordinators
      if (user.role === UserRole.COORDINATOR) {
        const requestUser = await db.user.findUnique({
          where: { id: input.userId },
        });

        if (!requestUser || requestUser.houseId !== user.houseId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only cancel vacation requests for your assigned house',
          });
        }
      }

      // Find all vacation constraints within the date range
      const startDate = new Date(input.startDate.getFullYear(), input.startDate.getMonth(), input.startDate.getDate());
      const endDate = new Date(input.endDate.getFullYear(), input.endDate.getMonth(), input.endDate.getDate());
      endDate.setDate(endDate.getDate() + 1); // Include end date

      const vacationConstraints = await db.constraint.findMany({
        where: {
          userId: input.userId,
          type: ConstraintType.VACATION,
          date: {
            gte: startDate,
            lt: endDate,
          },
          // Only cancel non-approved requests (approved ones should not be canceled)
          description: {
            not: {
              contains: 'אושר על ידי'
            }
          }
        },
      });

      if (vacationConstraints.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No vacation request found for the specified date range',
        });
      }

      // Check if any constraints are already approved
      const approvedConstraints = vacationConstraints.filter(c => 
        c.description?.includes('אושר על ידי')
      );

      if (approvedConstraints.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel approved vacation requests. Contact your coordinator.',
        });
      }

      // Delete all vacation constraints in the range
      const deletedCount = await db.constraint.deleteMany({
        where: {
          id: {
            in: vacationConstraints.map(c => c.id)
          }
        }
      });

      return {
        message: `Canceled vacation request for ${vacationConstraints.length} days`,
        canceledDays: vacationConstraints.length,
        dateRange: {
          startDate: input.startDate,
          endDate: input.endDate,
        },
      };
    }),

  // ===============================
  // SCHEDULE ASSIGNMENT MANAGEMENT
  // ===============================

  // Get assignments by schedule
  getAssignmentsBySchedule: protectedProcedure
    .input(getAssignmentsByScheduleSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      return db.scheduleAssignment.findMany({
        where: {
          scheduleId: input.scheduleId,
        },
        include: {
          guide: { select: { id: true, name: true, username: true } },
          schedule: { select: { id: true, month: true, year: true } },
        },
        orderBy: [
          { date: 'asc' },
          { role: 'asc' },
        ],
      });
    }),

  // Get guide monthly statistics for fairness tracking
  getGuideMonthlyStats: protectedProcedure
    .input(getGuideMonthlyStatsSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      // Get start and end dates for the month
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0);

      // Get all assignments for guides in the house for this month
      const assignments = await db.scheduleAssignment.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
          guide: {
            houseId: input.houseId,
          },
        },
        include: {
          guide: { select: { id: true, name: true, username: true } },
        },
      });

      // Group by guide and count assignments
      const statsMap = new Map();
      
      assignments.forEach(assignment => {
        const guideId = assignment.guide.id;
        if (!statsMap.has(guideId)) {
          statsMap.set(guideId, {
            guideId,
            guideName: assignment.guide.name,
            totalAssignments: 0,
            regularShifts: 0,
            backupShifts: 0,
          });
        }
        
        const stats = statsMap.get(guideId);
        stats.totalAssignments++;
        
        if (assignment.role === AssignmentRole.REGULAR) {
          stats.regularShifts++;
        } else if (assignment.role === AssignmentRole.BACKUP) {
          stats.backupShifts++;
        }
      });

      return Array.from(statsMap.values());
    }),

  // Get constraint counts for each guide in a house for a specific month
  getGuideConstraintCounts: protectedProcedure
    .input(getGuideConstraintCountsSchema)
    .query(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Check permissions for house access
      if (user.role === UserRole.GUIDE && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view constraint counts for your assigned house',
        });
      }

      if (user.role === UserRole.COORDINATOR && user.houseId !== input.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view constraint counts for your assigned house',
        });
      }

      // Get start and end dates for the month
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0);

      // Get all constraints for guides in the house for this month
      const constraints = await db.constraint.findMany({
        where: {
          houseId: input.houseId,
          date: {
            gte: startDate,
            lte: endDate,
          },
          user: {
            role: UserRole.GUIDE,
          },
        },
        select: {
          userId: true,
        },
      });

      // Count constraints per guide
      const counts: Record<string, number> = {};
      constraints.forEach(constraint => {
        counts[constraint.userId] = (counts[constraint.userId] || 0) + 1;
      });

      return counts;
    }),

  // Delete a monthly constraint
  deleteMonthlyConstraint: protectedProcedure
    .input(deleteMonthlyConstraintSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const user = session.user;

      // Get the constraint first to check permissions
      const constraint = await db.constraint.findUnique({
        where: { id: input.constraintId },
        include: {
          user: { select: { id: true, name: true, houseId: true, role: true } },
        },
      });

      if (!constraint) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Constraint not found',
        });
      }

      // Check permissions - coordinators/admins can delete constraints for their house
      if (user.role === UserRole.COORDINATOR && user.houseId !== constraint.houseId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete constraints for your assigned house',
        });
      }

      // Admin can delete any constraint, guide can delete their own
      if (user.role === UserRole.GUIDE && user.id !== constraint.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own constraints',
        });
      }

      // Delete the constraint
      await db.constraint.delete({
        where: { id: input.constraintId },
      });

      return {
        message: 'Constraint deleted successfully',
        constraintId: input.constraintId,
      };
    }),
});