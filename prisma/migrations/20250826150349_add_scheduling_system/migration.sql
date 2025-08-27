-- CreateEnum
CREATE TYPE "public"."ScheduleStatus" AS ENUM ('DRAFT', 'REVIEW', 'FORMAL', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."AssignmentRole" AS ENUM ('REGULAR', 'OVERLAP', 'STANDBY', 'MOTZASH');

-- CreateEnum
CREATE TYPE "public"."ConstraintStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DELETED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ShiftType" ADD VALUE 'WEEKDAY';
ALTER TYPE "public"."ShiftType" ADD VALUE 'OPEN_WEEKEND';
ALTER TYPE "public"."ShiftType" ADD VALUE 'CLOSED_WEEKEND';
ALTER TYPE "public"."ShiftType" ADD VALUE 'HOLIDAY';

-- CreateTable
CREATE TABLE "public"."Schedule" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."ScheduleStatus" NOT NULL DEFAULT 'DRAFT',
    "houseId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMP(3),

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScheduleAssignment" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "guideId" TEXT NOT NULL,
    "role" "public"."AssignmentRole" NOT NULL,
    "shiftType" "public"."ShiftType" NOT NULL,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "rejectionReason" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeeklyConstraint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "status" "public"."ConstraintStatus" NOT NULL DEFAULT 'ACTIVE',
    "reason" TEXT,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoordinatorRule" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoordinatorRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DynamicConstraint" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "blockedDate" TIMESTAMP(3) NOT NULL,
    "sourceDate" TIMESTAMP(3) NOT NULL,
    "scheduleId" TEXT NOT NULL,

    CONSTRAINT "DynamicConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Schedule_houseId_idx" ON "public"."Schedule"("houseId");

-- CreateIndex
CREATE INDEX "Schedule_createdBy_idx" ON "public"."Schedule"("createdBy");

-- CreateIndex
CREATE INDEX "Schedule_status_idx" ON "public"."Schedule"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_month_year_houseId_version_key" ON "public"."Schedule"("month", "year", "houseId", "version");

-- CreateIndex
CREATE INDEX "ScheduleAssignment_guideId_date_idx" ON "public"."ScheduleAssignment"("guideId", "date");

-- CreateIndex
CREATE INDEX "ScheduleAssignment_scheduleId_idx" ON "public"."ScheduleAssignment"("scheduleId");

-- CreateIndex
CREATE INDEX "ScheduleAssignment_createdBy_idx" ON "public"."ScheduleAssignment"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleAssignment_scheduleId_date_role_key" ON "public"."ScheduleAssignment"("scheduleId", "date", "role");

-- CreateIndex
CREATE INDEX "WeeklyConstraint_userId_idx" ON "public"."WeeklyConstraint"("userId");

-- CreateIndex
CREATE INDEX "WeeklyConstraint_status_idx" ON "public"."WeeklyConstraint"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyConstraint_userId_dayOfWeek_key" ON "public"."WeeklyConstraint"("userId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "CoordinatorRule_houseId_idx" ON "public"."CoordinatorRule"("houseId");

-- CreateIndex
CREATE INDEX "CoordinatorRule_createdBy_idx" ON "public"."CoordinatorRule"("createdBy");

-- CreateIndex
CREATE INDEX "CoordinatorRule_isActive_idx" ON "public"."CoordinatorRule"("isActive");

-- CreateIndex
CREATE INDEX "DynamicConstraint_scheduleId_idx" ON "public"."DynamicConstraint"("scheduleId");

-- CreateIndex
CREATE INDEX "DynamicConstraint_guideId_idx" ON "public"."DynamicConstraint"("guideId");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicConstraint_guideId_blockedDate_scheduleId_key" ON "public"."DynamicConstraint"("guideId", "blockedDate", "scheduleId");

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleAssignment" ADD CONSTRAINT "ScheduleAssignment_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleAssignment" ADD CONSTRAINT "ScheduleAssignment_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleAssignment" ADD CONSTRAINT "ScheduleAssignment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyConstraint" ADD CONSTRAINT "WeeklyConstraint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyConstraint" ADD CONSTRAINT "WeeklyConstraint_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoordinatorRule" ADD CONSTRAINT "CoordinatorRule_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoordinatorRule" ADD CONSTRAINT "CoordinatorRule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DynamicConstraint" ADD CONSTRAINT "DynamicConstraint_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
