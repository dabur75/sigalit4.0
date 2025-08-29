import { z } from "zod";
import { UserRole } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { hashPassword } from "~/lib/auth-utils";

export const sigalitRouter = createTRPCRouter({
  // House Management
  getAllHouses: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.house.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }),

  getHouseById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.house.findUnique({
        where: { id: input.id },
        include: {
          users: true,
          shifts: true,
        },
      });
    }),

  createHouse: protectedProcedure
    .input(z.object({
      name: z.string(),
      code: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.house.create({
        data: {
          name: input.name,
          code: input.code,
          description: input.description,
          isActive: true,
        },
      });
    }),

  updateHouse: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      code: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: _id, ...data } = input;
      return await ctx.db.house.update({
        where: { id: input.id },
        data,
      });
    }),

  deleteHouse: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.house.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  // User Management
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      where: { isActive: true },
      include: {
        house: true,
      },
      orderBy: { name: 'asc' },
    });
  }),

  getUsersByHouse: protectedProcedure
    .input(z.object({ 
      houseId: z.string(),
      role: z.nativeEnum(UserRole).optional()
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findMany({
        where: { 
          houseId: input.houseId,
          isActive: true,
          ...(input.role && { role: input.role })
        },
        include: {
          house: true,
        },
        orderBy: { name: 'asc' },
      });
    }),

  getUserById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          house: true,
          shifts: true,
          constraints: true,
        },
      });
    }),

  createUser: protectedProcedure
    .input(z.object({
      name: z.string(),
      username: z.string(),
      email: z.string().email(),
      role: z.enum(["GUIDE", "COORDINATOR", "ADMIN"]),
      phone: z.string().optional(),
      password: z.string(),
      houseId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await hashPassword(input.password);
      
      return await ctx.db.user.create({
        data: {
          name: input.name,
          username: input.username,
          email: input.email,
          role: input.role,
          phone: input.phone,
          password: hashedPassword,
          houseId: input.houseId,
          isActive: true,
        },
      });
    }),

  updateUser: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      role: z.enum(["GUIDE", "COORDINATOR", "ADMIN"]).optional(),
      phone: z.string().optional(),
      houseId: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: _id, ...data } = input;
      return await ctx.db.user.update({
        where: { id: input.id },
        data,
      });
    }),

  deleteUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  // Shift Management
  getAllShifts: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.shift.findMany({
      include: {
        guide: {
          include: { house: true },
        },
        house: true,
      },
      orderBy: { date: 'asc' },
    });
  }),

  getShiftsByHouse: protectedProcedure
    .input(z.object({ houseId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.shift.findMany({
        where: { houseId: input.houseId },
        include: {
          guide: {
            include: { house: true },
          },
          house: true,
        },
        orderBy: { date: 'asc' },
      });
    }),

  getShiftsByDateRange: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
      houseId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        date: {
          gte: input.startDate,
          lte: input.endDate,
        },
      };
      
      if (input.houseId) {
        where.houseId = input.houseId;
      }

      return await ctx.db.shift.findMany({
        where,
        include: {
          guide: {
            include: { house: true },
          },
          house: true,
        },
        orderBy: { date: 'asc' },
      });
    }),

  createShift: protectedProcedure
    .input(z.object({
      date: z.date(),
      guideId: z.string(),
      houseId: z.string(),
      role: z.string(),
      type: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.shift.create({
        data: input,
      });
    }),

  updateShift: protectedProcedure
    .input(z.object({
      id: z.string(),
      date: z.date().optional(),
      guideId: z.string().optional(),
      houseId: z.string().optional(),
      role: z.string().optional(),
      type: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: _id, ...data } = input;
      return await ctx.db.shift.update({
        where: { id: input.id },
        data,
      });
    }),

  deleteShift: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.shift.delete({
        where: { id: input.id },
      });
    }),

  // Constraint Management
  getAllConstraints: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.constraint.findMany({
      include: {
        user: {
          include: { house: true },
        },
        house: true,
      },
      orderBy: { date: 'asc' },
    });
  }),

  getConstraintsByHouse: protectedProcedure
    .input(z.object({ houseId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.constraint.findMany({
        where: { houseId: input.houseId },
        include: {
          user: {
            include: { house: true },
          },
          house: true,
        },
        orderBy: { date: 'asc' },
      });
    }),

  createConstraint: protectedProcedure
    .input(z.object({
      userId: z.string(),
      houseId: z.string(),
      date: z.date(),
      type: z.enum(["UNAVAILABLE", "PREFERRED", "REQUIRED"]),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.constraint.create({
        data: input,
      });
    }),

  updateConstraint: protectedProcedure
    .input(z.object({
      id: z.string(),
      date: z.date().optional(),
      type: z.enum(["UNAVAILABLE", "PREFERRED", "REQUIRED"]).optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: _id, ...data } = input;
      return await ctx.db.constraint.update({
        where: { id: input.id },
        data,
      });
    }),

  deleteConstraint: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.constraint.delete({
        where: { id: input.id },
      });
    }),

  // Dashboard Statistics
  getDashboardStats: protectedProcedure
    .input(z.object({ houseId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input.houseId) {
        where.houseId = input.houseId;
      }

      const [totalUsers, totalShifts, totalHouses] = await Promise.all([
        ctx.db.user.count({ where: { isActive: true, ...where } }),
        ctx.db.shift.count({ where }),
        ctx.db.house.count({ where: { isActive: true } }),
      ]);

      return {
        totalUsers,
        totalShifts,
        totalHouses,
      };
    }),

  // House-specific statistics
  getHouseStats: protectedProcedure
    .input(z.object({ houseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [users, shifts, constraints] = await Promise.all([
        ctx.db.user.count({
          where: { houseId: input.houseId, isActive: true },
        }),
        ctx.db.shift.count({
          where: { houseId: input.houseId },
        }),
        ctx.db.constraint.count({
          where: { houseId: input.houseId },
        }),
      ]);

      return {
        users,
        shifts,
        constraints,
      };
    }),

  // Weekly Schedule Management
  getWeeklySchedule: protectedProcedure
    .input(z.object({ houseId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.weeklySchedule.findMany({
        where: { 
          houseId: input.houseId,
          isActive: true 
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { time: 'asc' }
        ],
      });
    }),

  createWeeklySchedule: protectedProcedure
    .input(z.object({
      houseId: z.string(),
      dayOfWeek: z.number().min(0).max(6),
      time: z.string(),
      activityName: z.string(),
      instructor: z.string(),
      activityType: z.string(),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.weeklySchedule.create({
        data: input,
      });
    }),

  updateWeeklySchedule: protectedProcedure
    .input(z.object({
      id: z.string(),
      time: z.string().optional(),
      activityName: z.string().optional(),
      instructor: z.string().optional(),
      activityType: z.string().optional(),
      note: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: _id, ...data } = input;
      return await ctx.db.weeklySchedule.update({
        where: { id: input.id },
        data,
      });
    }),

  deleteWeeklySchedule: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.weeklySchedule.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  // One-Time Override Management
  getOneTimeOverrides: protectedProcedure
    .input(z.object({ 
      houseId: z.string(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { 
        houseId: input.houseId,
        isActive: true 
      };
      
      if (input.startDate && input.endDate) {
        where.date = {
          gte: input.startDate,
          lte: input.endDate,
        };
      }

      return await ctx.db.oneTimeOverride.findMany({
        where,
        orderBy: { date: 'asc' },
      });
    }),

  createOneTimeOverride: protectedProcedure
    .input(z.object({
      houseId: z.string(),
      date: z.date(),
      originalScheduleId: z.string().optional(),
      time: z.string(),
      activityName: z.string(),
      instructor: z.string(),
      activityType: z.string(),
      note: z.string().optional(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.oneTimeOverride.create({
        data: input,
      });
    }),

  updateOneTimeOverride: protectedProcedure
    .input(z.object({
      id: z.string(),
      time: z.string().optional(),
      activityName: z.string().optional(),
      instructor: z.string().optional(),
      activityType: z.string().optional(),
      note: z.string().optional(),
      reason: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: _id, ...data } = input;
      return await ctx.db.oneTimeOverride.update({
        where: { id: input.id },
        data,
      });
    }),

  deleteOneTimeOverride: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.oneTimeOverride.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  // Daily Schedule Calculation
  getDailySchedule: protectedProcedure
    .input(z.object({ 
      houseId: z.string(),
      date: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const dayOfWeek = input.date.getDay();
      
      // Get regular weekly schedule for this day
      const weeklySchedule = await ctx.db.weeklySchedule.findMany({
        where: { 
          houseId: input.houseId,
          dayOfWeek,
          isActive: true 
        },
        orderBy: { time: 'asc' },
      });

      // Get one-time overrides for this date
      const overrides = await ctx.db.oneTimeOverride.findMany({
        where: { 
          houseId: input.houseId,
          date: input.date,
          isActive: true 
        },
        orderBy: { time: 'asc' },
      });

      // Combine and sort by time
      const combinedSchedule = [...weeklySchedule, ...overrides].sort((a, b) => {
        return a.time.localeCompare(b.time);
      });

      return {
        date: input.date,
        weeklySchedule,
        overrides,
        combinedSchedule,
      };
    }),

  // Shift Tasks Management
  getShiftTasks: protectedProcedure
    .input(z.object({ 
      houseId: z.string(),
      date: z.date().optional(),
      status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { 
        houseId: input.houseId,
      };
      
      if (input.date) {
        where.date = input.date;
      }
      
      if (input.status) {
        where.status = input.status;
      }

      return await ctx.db.shiftTask.findMany({
        where,
        include: {
          house: true,
        },
        orderBy: { date: 'desc' },
      });
    }),

  createShiftTask: protectedProcedure
    .input(z.object({
      houseId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      date: z.date(),
      assignedTo: z.string().optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.shiftTask.create({
        data: input,
      });
    }),

  updateShiftTask: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      date: z.date().optional(),
      assignedTo: z.string().optional(),
      status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: _id, ...data } = input;
      return await ctx.db.shiftTask.update({
        where: { id: input.id },
        data,
      });
    }),

  deleteShiftTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.shiftTask.delete({
        where: { id: input.id },
      });
    }),

  // Medical Referrals Management
  getMedicalReferrals: protectedProcedure
    .input(z.object({ 
      houseId: z.string(),
      date: z.date().optional(),
      status: z.enum(["PENDING", "APPROVED", "COMPLETED", "CANCELLED"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { 
        houseId: input.houseId,
      };
      
      if (input.date) {
        where.date = input.date;
      }
      
      if (input.status) {
        where.status = input.status;
      }

      return await ctx.db.medicalReferral.findMany({
        where,
        include: {
          house: true,
        },
        orderBy: { date: 'desc' },
      });
    }),

  createMedicalReferral: protectedProcedure
    .input(z.object({
      houseId: z.string(),
      patientName: z.string(),
      reason: z.string(),
      doctorName: z.string(),
      date: z.date(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.medicalReferral.create({
        data: input,
      });
    }),

  updateMedicalReferral: protectedProcedure
    .input(z.object({
      id: z.string(),
      patientName: z.string().optional(),
      reason: z.string().optional(),
      doctorName: z.string().optional(),
      date: z.date().optional(),
      status: z.enum(["PENDING", "APPROVED", "COMPLETED", "CANCELLED"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: _id, ...data } = input;
      return await ctx.db.medicalReferral.update({
        where: { id: input.id },
        data,
      });
    }),

  deleteMedicalReferral: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.medicalReferral.delete({
        where: { id: input.id },
      });
    }),

  // Shift Instructors Management
  getShiftInstructors: protectedProcedure
    .input(z.object({ 
      houseId: z.string(),
      date: z.date().optional(),
      shiftType: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { 
        houseId: input.houseId,
        isActive: true,
      };
      
      if (input.date) {
        where.date = input.date;
      }
      
      if (input.shiftType) {
        where.shiftType = input.shiftType;
      }

      return await ctx.db.shiftInstructor.findMany({
        where,
        include: {
          house: true,
          user: true,
        },
        orderBy: { date: 'desc' },
      });
    }),

  createShiftInstructor: protectedProcedure
    .input(z.object({
      houseId: z.string(),
      userId: z.string(),
      date: z.date(),
      shiftType: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.shiftInstructor.create({
        data: input,
      });
    }),

  updateShiftInstructor: protectedProcedure
    .input(z.object({
      id: z.string(),
      userId: z.string().optional(),
      date: z.date().optional(),
      shiftType: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: _id, ...data } = input;
      return await ctx.db.shiftInstructor.update({
        where: { id: input.id },
        data,
      });
    }),

  deleteShiftInstructor: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.shiftInstructor.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  // Internal Messages Management
  getInternalMessages: protectedProcedure
    .input(z.object({ 
      houseId: z.string(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.internalMessage.findMany({
        where: { 
          houseId: input.houseId,
        },
        include: {
          house: true,
          sender: true,
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });
    }),

  createInternalMessage: protectedProcedure
    .input(z.object({
      houseId: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.internalMessage.create({
        data: {
          ...input,
          senderId: ctx.session.user.id,
        },
      });
    }),

  markMessageAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.internalMessage.update({
        where: { id: input.id },
        data: { isRead: true },
      });
    }),

  deleteInternalMessage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.internalMessage.delete({
        where: { id: input.id },
      });
    }),
});
