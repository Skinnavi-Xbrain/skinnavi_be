import { PrismaClient } from '@prisma/client';

export async function seedRoutinePackages(prisma: PrismaClient) {
  await prisma.routine_packages.createMany({
    data: [
      {
        package_name: 'Starter Routine – 1 Week',
        description:
          'The Starter Routine is designed for users who want to quickly understand their skin and try a personalized skincare routine without long-term commitment. This package helps you build healthy daily habits and see how your skin reacts before moving to a longer plan.',
        highlights: [
          'Personalized skincare routine for 7 days',
          'Suitable for beginners or first-time users',
          'Basic morning & evening routine',
          'Skin-type–based product suggestions',
        ],
        duration_days: 7,
        price: 49000,
      },
      {
        package_name: 'Essential Routine – 1 Month',
        description:
          'The Essential Routine is perfect for users who want visible improvements through consistency. Over 30 days, you’ll follow a structured skincare plan tailored to your skin type and goals, helping you maintain healthier, more balanced skin.',
        highlights: [
          'Full 30-day personalized skincare routine',
          'Morning & evening routines with clear steps',
          'Routine adjusted to your skin type and concerns',
          'Ideal for building consistent skincare habits',
        ],
        duration_days: 30,
        price: 149000,
      },
      {
        package_name: 'Advanced Routine – 3 Months',
        description:
          'The Advanced Routine is designed for long-term skin transformation. With a 90-day plan, this package supports gradual and sustainable improvement, helping your skin adapt, recover, and maintain optimal health over time.',
        highlights: [
          'Complete 90-day advanced skincare routine',
          'Long-term skin improvement plan',
          'Detailed routines for different skin conditions',
          'Best value for long-term skincare commitment',
        ],
        duration_days: 90,
        price: 399000,
      },
    ],
    skipDuplicates: true,
  });
}
