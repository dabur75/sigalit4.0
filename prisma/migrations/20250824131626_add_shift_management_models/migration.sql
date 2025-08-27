-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."ReferralStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."WeeklySchedule" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OneTimeOverride" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "originalScheduleId" TEXT,
    "time" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "note" TEXT,
    "reason" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneTimeOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShiftTask" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "assignedTo" TEXT,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedicalReferral" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "public"."ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShiftInstructor" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shiftType" "public"."ShiftType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftInstructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InternalMessage" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklySchedule_houseId_idx" ON "public"."WeeklySchedule"("houseId");

-- CreateIndex
CREATE INDEX "WeeklySchedule_dayOfWeek_idx" ON "public"."WeeklySchedule"("dayOfWeek");

-- CreateIndex
CREATE INDEX "WeeklySchedule_isActive_idx" ON "public"."WeeklySchedule"("isActive");

-- CreateIndex
CREATE INDEX "OneTimeOverride_houseId_idx" ON "public"."OneTimeOverride"("houseId");

-- CreateIndex
CREATE INDEX "OneTimeOverride_date_idx" ON "public"."OneTimeOverride"("date");

-- CreateIndex
CREATE INDEX "OneTimeOverride_isActive_idx" ON "public"."OneTimeOverride"("isActive");

-- CreateIndex
CREATE INDEX "ShiftTask_houseId_idx" ON "public"."ShiftTask"("houseId");

-- CreateIndex
CREATE INDEX "ShiftTask_date_idx" ON "public"."ShiftTask"("date");

-- CreateIndex
CREATE INDEX "ShiftTask_status_idx" ON "public"."ShiftTask"("status");

-- CreateIndex
CREATE INDEX "ShiftTask_assignedTo_idx" ON "public"."ShiftTask"("assignedTo");

-- CreateIndex
CREATE INDEX "MedicalReferral_houseId_idx" ON "public"."MedicalReferral"("houseId");

-- CreateIndex
CREATE INDEX "MedicalReferral_date_idx" ON "public"."MedicalReferral"("date");

-- CreateIndex
CREATE INDEX "MedicalReferral_status_idx" ON "public"."MedicalReferral"("status");

-- CreateIndex
CREATE INDEX "ShiftInstructor_houseId_idx" ON "public"."ShiftInstructor"("houseId");

-- CreateIndex
CREATE INDEX "ShiftInstructor_date_idx" ON "public"."ShiftInstructor"("date");

-- CreateIndex
CREATE INDEX "ShiftInstructor_userId_idx" ON "public"."ShiftInstructor"("userId");

-- CreateIndex
CREATE INDEX "ShiftInstructor_shiftType_idx" ON "public"."ShiftInstructor"("shiftType");

-- CreateIndex
CREATE INDEX "InternalMessage_houseId_idx" ON "public"."InternalMessage"("houseId");

-- CreateIndex
CREATE INDEX "InternalMessage_senderId_idx" ON "public"."InternalMessage"("senderId");

-- CreateIndex
CREATE INDEX "InternalMessage_createdAt_idx" ON "public"."InternalMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."WeeklySchedule" ADD CONSTRAINT "WeeklySchedule_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OneTimeOverride" ADD CONSTRAINT "OneTimeOverride_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShiftTask" ADD CONSTRAINT "ShiftTask_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalReferral" ADD CONSTRAINT "MedicalReferral_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShiftInstructor" ADD CONSTRAINT "ShiftInstructor_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShiftInstructor" ADD CONSTRAINT "ShiftInstructor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InternalMessage" ADD CONSTRAINT "InternalMessage_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InternalMessage" ADD CONSTRAINT "InternalMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
