import { PrismaClient, UserRole, ShiftType, ConstraintType, ScheduleStatus, AssignmentRole, ConstraintStatus } from '@prisma/client';
import { hashPassword } from '../src/lib/auth-utils';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await prisma.dynamicConstraint.deleteMany();
    await prisma.scheduleAssignment.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.weeklyConstraint.deleteMany();
    await prisma.coordinatorRule.deleteMany();
    await prisma.constraint.deleteMany();
    await prisma.shift.deleteMany();
    await prisma.user.deleteMany();
    await prisma.house.deleteMany();

    console.log('🧹 Cleared existing data');

    // Create houses
    const houseDor = await prisma.house.create({
        data: {
            name: 'בית דרור',
            code: 'dor',
            description: 'מרכז פעילות בית דרור',
            isActive: true,
        },
    });

    const houseChabatzelet = await prisma.house.create({
        data: {
            name: 'בית חבצלת',
            code: 'chabatzelet',
            description: 'מרכז פעילות בית חבצלת',
            isActive: true,
        },
    });

    console.log('🏠 Created houses:', { 
        'בית דרור': houseDor.id, 
        'בית חבצלת': houseChabatzelet.id 
    });

    // Create users with hashed passwords
    const adminPassword = await hashPassword('admin123');
    const coordinatorPassword = await hashPassword('coordinator123');
    const guidePassword = await hashPassword('guide123');

    const admin = await prisma.user.create({
        data: {
            name: 'מנהל המערכת',
            username: 'admin',
            role: UserRole.ADMIN,
            email: 'admin@sigalit.co.il',
            phone: '050-1234567',
            password: adminPassword,
            isActive: true,
            // Admin can see all houses
        },
    });

    const coordinator1 = await prisma.user.create({
        data: {
            name: 'רכז בית דרור',
            username: 'coordinator_dor',
            role: UserRole.COORDINATOR,
            email: 'coordinator.dor@sigalit.co.il',
            phone: '050-2345678',
            password: coordinatorPassword,
            isActive: true,
            houseId: houseDor.id,
        },
    });

    const coordinator2 = await prisma.user.create({
        data: {
            name: 'רכז בית חבצלת',
            username: 'coordinator_chabatzelet',
            role: UserRole.COORDINATOR,
            email: 'coordinator.chabatzelet@sigalit.co.il',
            phone: '050-3456789',
            password: coordinatorPassword,
            isActive: true,
            houseId: houseChabatzelet.id,
        },
    });

    const guide1 = await prisma.user.create({
        data: {
            name: 'מדריך ראשון',
            username: 'guide1',
            role: UserRole.GUIDE,
            email: 'guide1@sigalit.co.il',
            phone: '050-4567890',
            password: guidePassword,
            isActive: true,
            houseId: houseDor.id,
        },
    });

    const guide2 = await prisma.user.create({
        data: {
            name: 'מדריך שני',
            username: 'guide2',
            role: UserRole.GUIDE,
            email: 'guide2@sigalit.co.il',
            phone: '050-5678901',
            password: guidePassword,
            isActive: true,
            houseId: houseDor.id,
        },
    });

    const guide3 = await prisma.user.create({
        data: {
            name: 'מדריך שלישי',
            username: 'guide3',
            role: UserRole.GUIDE,
            email: 'guide3@sigalit.co.il',
            phone: '050-6789012',
            password: guidePassword,
            isActive: true,
            houseId: houseChabatzelet.id,
        },
    });

    // Create additional guides for realistic scheduling
    const additionalGuides = [];
    
    // בית דרור - מדריכים נוספים
    for (let i = 4; i <= 8; i++) {
        const guide = await prisma.user.create({
            data: {
                name: `מדריך ${i} - דרור`,
                username: `guide_dor_${i}`,
                role: UserRole.GUIDE,
                email: `guide.dor.${i}@sigalit.co.il`,
                phone: `050-${7890000 + i}`,
                password: guidePassword,
                isActive: true,
                houseId: houseDor.id,
            },
        });
        additionalGuides.push(guide);
    }

    // בית חבצלת - מדריכים נוספים  
    for (let i = 4; i <= 8; i++) {
        const guide = await prisma.user.create({
            data: {
                name: `מדריך ${i} - חבצלת`,
                username: `guide_chabatzelet_${i}`,
                role: UserRole.GUIDE,
                email: `guide.chabatzelet.${i}@sigalit.co.il`,
                phone: `050-${8900000 + i}`,
                password: guidePassword,
                isActive: true,
                houseId: houseChabatzelet.id,
            },
        });
        additionalGuides.push(guide);
    }

    console.log('👥 Created users with house assignments (20 guides total)');

    // Create shifts for both houses
    const shifts = [
        // בית דרור - שיבוצים
        {
            date: new Date('2025-08-26T08:00:00Z'), // יום שני בוקר
            guideId: guide1.id,
            houseId: houseDor.id,
            role: 'מדריך קבוצה',
            type: ShiftType.MORNING,
        },
        {
            date: new Date('2025-08-26T14:00:00Z'), // יום שני צהריים
            guideId: guide2.id,
            houseId: houseDor.id,
            role: 'מדריך פעילות',
            type: ShiftType.AFTERNOON,
        },
        {
            date: new Date('2025-08-27T08:00:00Z'), // יום שלישי בוקר
            guideId: guide1.id,
            houseId: houseDor.id,
            role: 'מדריך קבוצה',
            type: ShiftType.MORNING,
        },
        // בית חבצלת - שיבוצים
        {
            date: new Date('2025-08-26T08:00:00Z'), // יום שני בוקר
            guideId: guide3.id,
            houseId: houseChabatzelet.id,
            role: 'מדריך קבוצה',
            type: ShiftType.MORNING,
        },
        {
            date: new Date('2025-08-27T14:00:00Z'), // יום שלישי צהריים
            guideId: guide3.id,
            houseId: houseChabatzelet.id,
            role: 'מדריך פעילות',
            type: ShiftType.AFTERNOON,
        },
    ];

    for (const shiftData of shifts) {
        await prisma.shift.create({ data: shiftData });
    }

    console.log('📅 Created shifts for both houses');

    // Create constraints for both houses
    const constraints = [
        {
            userId: guide1.id,
            houseId: houseDor.id,
            date: new Date('2025-08-28T00:00:00Z'),
            type: ConstraintType.UNAVAILABLE,
            description: 'לא זמין ביום רביעי',
        },
        {
            userId: guide3.id,
            houseId: houseChabatzelet.id,
            date: new Date('2025-08-29T00:00:00Z'),
            type: ConstraintType.PREFERRED,
            description: 'מועדף ביום חמישי',
        },
    ];

    for (const constraintData of constraints) {
        await prisma.constraint.create({ data: constraintData });
    }

    console.log('🚫 Created constraints for both houses');

    // Create scheduling system data
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    // Create draft schedules for next month for both houses
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    const dorSchedule = await prisma.schedule.create({
        data: {
            month: nextMonth,
            year: nextYear,
            version: 1,
            status: ScheduleStatus.DRAFT,
            houseId: houseDor.id,
            createdBy: coordinator1.id,
        },
    });

    const chabatzeletSchedule = await prisma.schedule.create({
        data: {
            month: nextMonth,
            year: nextYear,
            version: 1,
            status: ScheduleStatus.DRAFT,
            houseId: houseChabatzelet.id,
            createdBy: coordinator2.id,
        },
    });

    console.log(`📅 Created draft schedules for ${nextMonth}/${nextYear}`);

    // Create some sample schedule assignments for the next month
    const nextMonthStart = new Date(nextYear, nextMonth - 1, 1);
    const sampleAssignments = [
        // בית דרור - כמה שיבוצים דוגמא
        {
            scheduleId: dorSchedule.id,
            date: new Date(nextYear, nextMonth - 1, 3), // 3rd of next month
            guideId: guide1.id,
            role: AssignmentRole.REGULAR,
            shiftType: ShiftType.WEEKDAY,
            isManual: true,
            isLocked: true,
            isConfirmed: false,
            createdBy: coordinator1.id,
        },
        {
            scheduleId: dorSchedule.id,
            date: new Date(nextYear, nextMonth - 1, 3), // Same day, overlap
            guideId: guide2.id,
            role: AssignmentRole.OVERLAP,
            shiftType: ShiftType.WEEKDAY,
            isManual: true,
            isLocked: false,
            isConfirmed: false,
            createdBy: coordinator1.id,
        },
        // בית חבצלת - כמה שיבוצים דוגמא
        {
            scheduleId: chabatzeletSchedule.id,
            date: new Date(nextYear, nextMonth - 1, 5), // 5th of next month
            guideId: guide3.id,
            role: AssignmentRole.REGULAR,
            shiftType: ShiftType.WEEKDAY,
            isManual: false,
            isLocked: false,
            isConfirmed: true,
            createdBy: coordinator2.id,
        },
    ];

    for (const assignmentData of sampleAssignments) {
        await prisma.scheduleAssignment.create({ data: assignmentData });
    }

    console.log('📝 Created sample schedule assignments');

    // Create weekly constraints
    const weeklyConstraints = [
        {
            userId: guide1.id,
            dayOfWeek: 5, // Friday
            status: ConstraintStatus.ACTIVE,
            reason: 'לא זמין בימי שישי',
            approvedBy: coordinator1.id,
        },
        {
            userId: guide3.id,
            dayOfWeek: 6, // Saturday
            status: ConstraintStatus.ACTIVE,
            reason: 'לא זמין בשבתות',
            approvedBy: coordinator2.id,
        },
        {
            userId: additionalGuides[0]?.id || guide2.id,
            dayOfWeek: 0, // Sunday
            status: ConstraintStatus.PAUSED,
            reason: 'בדרך כלל לא זמין בימי ראשון',
        },
    ];

    for (const constraintData of weeklyConstraints) {
        await prisma.weeklyConstraint.create({ data: constraintData });
    }

    console.log('📊 Created weekly constraints');

    // Create coordinator rules
    const coordinatorRules = [
        {
            houseId: houseDor.id,
            ruleType: 'NO_CONSECUTIVE_DAYS',
            parameters: { maxConsecutive: 1 },
            isActive: true,
            createdBy: coordinator1.id,
        },
        {
            houseId: houseChabatzelet.id,
            ruleType: 'MAX_WEEKEND_SHIFTS',
            parameters: { maxWeekendShifts: 2, perMonth: true },
            isActive: true,
            createdBy: coordinator2.id,
        },
    ];

    for (const ruleData of coordinatorRules) {
        await prisma.coordinatorRule.create({ data: ruleData });
    }

    console.log('⚙️ Created coordinator rules');

    // Create dynamic constraints based on assignments
    const dynamicConstraints = [
        {
            guideId: guide1.id,
            blockedDate: new Date(nextYear, nextMonth - 1, 2), // Day before assignment
            sourceDate: new Date(nextYear, nextMonth - 1, 3), // Assignment date
            scheduleId: dorSchedule.id,
        },
        {
            guideId: guide1.id,
            blockedDate: new Date(nextYear, nextMonth - 1, 4), // Day after assignment
            sourceDate: new Date(nextYear, nextMonth - 1, 3), // Assignment date
            scheduleId: dorSchedule.id,
        },
    ];

    for (const constraintData of dynamicConstraints) {
        await prisma.dynamicConstraint.create({ data: constraintData });
    }

    console.log('🔄 Created dynamic constraints');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Default login credentials:');
    console.log('👑 Admin: admin / admin123');
    console.log('👥 Coordinator: coordinator_dor / coordinator123');
    console.log('👥 Coordinator: coordinator_chabatzelet / coordinator123');
    console.log('👤 Guides: guide1, guide2, guide3 / guide123');
    console.log('👤 בית דרור: guide_dor_4 to guide_dor_8 / guide123');
    console.log('👤 בית חבצלת: guide_chabatzelet_4 to guide_chabatzelet_8 / guide123');
    console.log('\n🏠 Houses created:');
    console.log(`   - בית דרור (${houseDor.code}): ${houseDor.id}`);
    console.log(`   - בית חבצלת (${houseChabatzelet.code}): ${houseChabatzelet.id}`);
    console.log('\n📅 Scheduling system data:');
    console.log(`   - Draft schedules for ${nextMonth}/${nextYear}`);
    console.log(`   - Sample assignments and constraints created`);
    console.log(`   - Weekly constraints and coordinator rules configured`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
