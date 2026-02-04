import { PrismaClient } from '@prisma/client';
import { seedSkinTypes } from './skin-type.seed';
import { seedUsers } from './user.seed';
import { seedProducts } from './product.seed';
import { seedProductCombos } from './combo.seed';
import { seedRoutinePackages } from './routine-package.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  await seedUsers(prisma);
  console.log('✅ Users seeded');

  await seedSkinTypes(prisma);
  console.log('✅ Skin types seeded.');

  await seedProducts(prisma);
  console.log('✅ Products seeded.');

  await seedProductCombos(prisma);
  console.log('✅ Product combos seeded.');

  await seedRoutinePackages(prisma);
  console.log('✅ Routine packages seeded.');
}

main().finally(async () => {
  await prisma.$disconnect();
});
