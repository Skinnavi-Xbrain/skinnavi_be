import { PrismaClient } from '@prisma/client';

export async function seedRoutinePackages(prisma: PrismaClient) {
  await prisma.routine_packages.createMany({
    data: [
      {
        package_name: 'Starter',
        description:
          'A simple introduction to AI-powered skincare analysis. Identify your skin type and receive a personalized routine to start improving your skin in just one week.',
        highlights: [
          '01 AI Skin Analysis to identify your skin type and concerns',
          '01 Personalized Morning & Evening skincare routine',
          'Product recommendations based on your skin profile',
          'Ideal for beginners starting their skincare journey',
        ],
        duration_days: 7,
        price: 49000,
        total_scan_limit: 1,
        allow_tracking: false,
      },
      {
        package_name: 'Standard',
        description:
          'Track your skin progress and improve your routine with consistent AI analysis over 30 days.',
        highlights: [
          '04 AI Skin Analyses to monitor your skin progress',
          'Routine updates after each analysis based on skin progress',
          'Access to Daily Tracking and Progress Logs',
          'Visual reports to compare your skin condition over time',
        ],
        duration_days: 30,
        price: 149000,
        total_scan_limit: 4,
        allow_tracking: true,
      },
      {
        package_name: 'Premium',
        description:
          'A complete 90-day skincare plan designed for long-term skin improvement with deeper AI insights and tracking.',
        highlights: [
          '15 AI Skin Analyses for detailed skin monitoring',
          'Dynamic routine updates as your skin condition changes',
          'Full access to Advanced Tracking and Skin Progress Analytics',
          'Best value plan for long-term skincare improvement',
        ],
        duration_days: 90,
        price: 399000,
        total_scan_limit: 15,
        allow_tracking: true,
      },
    ],
    skipDuplicates: true,
  });
}
