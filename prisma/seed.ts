import { PrismaClient, user_role_enum, skin_type_enum } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'Password123!';

async function main() {
  // --- Seed users (USER, ADMIN, COMPANY) ---
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const seedUsers: Array<{
    email: string;
    full_name: string;
    role: user_role_enum;
  }> = [
    {
      email: 'user@skinnavi.com',
      full_name: 'Seed User',
      role: user_role_enum.USER,
    },
    {
      email: 'admin@skinnavi.com',
      full_name: 'Seed Admin',
      role: user_role_enum.ADMIN,
    },
  ];
  for (const u of seedUsers) {
    await prisma.users.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        password_hash: passwordHash,
        full_name: u.full_name,
        role: u.role,
      },
      update: { full_name: u.full_name, role: u.role },
    });
  }
  console.log(`Seeded ${seedUsers.length} users (password: ${SEED_PASSWORD}).`);

  // --- Seed skin_types (NORMAL, DRY, COMBINATION, SENSITIVE, OILY) ---
  const skinTypes: skin_type_enum[] = [
    skin_type_enum.NORMAL,
    skin_type_enum.DRY,
    skin_type_enum.COMBINATION,
    skin_type_enum.SENSITIVE,
    skin_type_enum.OILY,
  ];
  for (const code of skinTypes) {
    await prisma.skin_types.upsert({
      where: { code },
      create: { code },
      update: {},
    });
  }
  console.log(`Seeded ${skinTypes.length} skin types.`);

  await prisma.affiliate_products.deleteMany();

  const rawData = [
    // ================= NORMAL SKIN =================
    {
      name: 'SIMPLE 3-Step Skincare Combo',
      display_price: 230400,
      url: 'https://vn.shp.ee/WFYXhET',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m4ydah1vwqxj8a.webp',
    },
    {
      name: 'Cosan Skincare Combo',
      display_price: 1081000,
      url: 'https://vn.shp.ee/eYZnrzw',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m1fn00xfiv9b68.webp',
    },
    {
      name: 'Hatomugi Job’s Tears Cleanser',
      price: 67000,
      url: 'https://vn.shp.ee/5BoFFVF',
      image:
        'https://down-vn.img.susercontent.com/file/sg-11134253-7rd3s-m7i277117u6ub7.webp',
    },
    {
      name: 'Hatomugi Facial Cleanser',
      price: 62000,
      url: 'https://vn.shp.ee/ZagB9yY',
      image:
        'https://down-vn.img.susercontent.com/file/sg-11134253-822y3-mi0h9uzudible1@resize_w900_nl.webp',
    },
    {
      name: 'Collagen Serum',
      price: 155527,
      url: 'https://vn.shp.ee/ARVe2HJ',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m9u72bcrfptu35.webp',
    },
    {
      name: 'AUSCHOO B3-B5 Serum',
      price: 269000,
      url: 'https://vn.shp.ee/8oFEvmB',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
    },
    {
      name: 'Decumar Sunscreen',
      price: 197000,
      url: 'https://vn.shp.ee/PWb1kde',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mk0tjz6md6h3a8@resize_w900_nl.webp',
    },
    {
      name: 'BEPLAIN Tone-Up Sunscreen',
      price: 99000,
      url: 'https://vn.shp.ee/mGbDdY7',
      image:
        'https://down-vn.img.susercontent.com/file/sg-11134202-8260g-mjb2fg33wyyu6c.webp',
    },
    {
      name: 'Cocoon Winter Melon Gel Cream',
      price: 165000,
      url: 'https://vn.shp.ee/hKLLhxU',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltyr0io470nz42.webp',
    },
    {
      name: 'OLAY LUMINOUS Moisturizing Cream',
      price: 159000,
      url: 'https://shopee.vn/Kem-D%C6%B0%E1%BB%A1ng-%E1%BA%A8m-OLAY-LUMINOUS-Ban-%C4%90%C3%AAm-S%C3%A1ng-Da-50G-i.156517921.6006810800',
      image:
        'https://down-vn.img.susercontent.com/file/sg-11134201-23010-7l9eio7o8ylv13@resize_w900_nl.webp',
    },
    {
      name: 'Focallure x Sanrio Micellar Water',
      price: 119000,
      url: 'https://vn.shp.ee/9Syk7MX',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltkyzq9wox7100.webp',
    },
    {
      name: 'COLORKEY Luminous Micellar Water',
      price: 139320,
      url: 'https://vn.shp.ee/qVvdqG2',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mfc2xluzzg9430.webp',
    },

    // ================= DRY SKIN =================
    {
      name: 'Omuse Complete Skincare Set (4 Products)',
      price: 1699000,
      url: 'https://vn.shp.ee/N3sXRtZ',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mee03zutq4ua3d.webp',
    },
    {
      name: 'Bioaqua Skincare Combo',
      price: 151000,
      url: 'https://shopee.vn/bo-cham-soc-da-bioaqua',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltdrl7zh7b2c74.webp',
    },
    {
      name: 'Truesky Centella Anti-Acne Cleanser Gel',
      price: 89000,
      url: 'https://vn.shp.ee/gGKbn7X',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqa89pbppviq41.webp',
    },
    {
      name: 'VEZE 24K Gold Serum',
      price: 80000,
      url: 'https://vn.shp.ee/9UYQ467',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltxyc9jv5b8fde.webp',
    },
    {
      name: 'MIINSKIN Niacinamide Whitening Essence',
      price: 330000,
      url: 'https://vn.shp.ee/bSLY6h5',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-md2ppvqp3h5od4.webp',
    },
    {
      name: 'Dr.G Brightening Up Sun+ Sunscreen',
      price: 115000,
      url: 'https://vn.shp.ee/hCVfTR8',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mh7fuxahy8eha2.webp',
    },
    {
      name: 'Skin Aqua Sunplay Sunscreen',
      price: 163000,
      url: 'https://vn.shp.ee/iyE4cVE',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-luh7dzyhs7wy2f.webp',
    },
    {
      name: 'ICESEA Chamomile Brightening Cream',
      price: 99000,
      url: 'https://vn.shp.ee/BnVFbTo',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m0l9bm02x6z360.webp',
    },
    {
      name: 'Cocoon Hau Giang Lotus Micellar Water',
      price: 136400,
      url: 'https://shopee.vn/Nuoc-tay-trang-sen-Cocoon',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mfc8jhudqfwv2f.webp',
    },

    // ================= COMBINATION SKIN =================
    {
      name: 'Coc Cay Hoa La Red Bean Set (3 Products)',
      price: 212500,
      url: 'https://shopee.vn/Bo-3-Sua-Rua-Mat-Dau-Do',
      image:
        'https://down-vn.img.susercontent.com/file/sg-11134201-81zux-misbjrpalfk2de.webp',
    },
    {
      name: 'Decumar Advanced Combo',
      price: 315000,
      url: 'https://shopee.vn/Combo-Decumar-Advanced',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mhitrhziwxl0ef.webp',
    },
    {
      name: 'Actidem Derma pH Gel Cleanser',
      price: 150000,
      url: 'https://shopee.vn/Gel-rua-mat-Actidem',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mb1yxxdj1zgh44.webp',
    },
    {
      name: 'VIBRANT GLAMOUR Vitamin C Sunscreen',
      price: 163500,
      url: 'https://shopee.vn/Kem-chong-nang-Vitamin-C',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m89ywhelqdf275@resize_w900_nl.webp',
    },
    {
      name: 'Rice & B5 Brightening Sunscreen SPF50+',
      price: 131001,
      url: 'https://shopee.vn/Beauty-of-Joseon-Sunscreen',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mhfx4njxt154e9.webp',
    },
    {
      name: 'The Originote Cica-B5 Soothing Cream',
      price: 122000,
      url: 'https://shopee.vn/Kem-Duong-Originote-Cica-B5',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgrc59krzo5k5d.webp',
    },
    {
      name: 'Garnier 3-in-1 Micellar Cleansing Water',
      price: 148400,
      url: 'https://shopee.vn/Nuoc-tay-trang-Garnier',
      image:
        'https://down-vn.img.susercontent.com/file/cn-11134207-820l4-mj51ebnoqo05e7@resize_w900_nl.webp',
    },

    // ================= SENSITIVE SKIN =================
    {
      name: 'Little Dream Garden Skincare Set (4 Products)',
      price: 619000,
      url: 'https://vn.shp.ee/sRNZLRZ',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mct4pm90yl3w74.webp',
    },
    {
      name: 'Hella Skincare Combo',
      price: 500000,
      url: 'https://shopee.vn/Combo-Hella-Skincare',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mfjfrw2lum1808@resize_w900_nl.webp',
    },
    {
      name: 'SVR Facial Cleanser',
      price: 500000,
      url: 'https://shopee.vn/Sua-Rua-Mat-SVR',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lpg0vup5ikwe32.webp',
    },
    {
      name: 'Torriden DIVE-IN Serum',
      price: 86000,
      url: 'https://shopee.vn/Torriden-Serum-DIVE-IN',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgrqcwyuwuff7e.webp',
    },
    {
      name: 'Cetaphil Moisturising Cream for Sensitive Skin',
      price: 205000,
      url: 'https://shopee.vn/Cetaphil-Moisturising-Cream',
      image:
        'https://down-vn.img.susercontent.com/file/sg-11134201-8261n-mjo23kga3gg7b1.webp',
    },
    {
      name: 'Bioderma Micellar Water',
      price: 116000,
      url: 'https://shopee.vn/Nuoc-Tay-Trang-Bioderma',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134201-820l4-mh56ba5pxc0a03.webp',
    },

    // ================= OILY SKIN =================
    {
      name: 'SKIN1004 Madagascar Centella Skincare Set',
      price: 500000,
      url: 'https://shopee.vn/Bo-SKIN1004-Madagascar',
      image:
        'https://down-vn.img.susercontent.com/file/sg-11134201-7ra2n-mbi7ktjua3bqe1@resize_w900_nl.webp',
    },
    {
      name: 'Drceutics Basic Niacinamide 8% Serum',
      price: 193050,
      url: 'https://shopee.vn/Serum-Drceutics-Niacinamide-8',
      image:
        'https://down-vn.img.susercontent.com/file/sg-11134253-81zte-miqbpmztghz6e7.webp',
    },
    {
      name: 'Innisfree Tone Up No Sebum Sunscreen SPF50+',
      price: 239000,
      url: 'https://shopee.vn/Kem-Chong-Nang-Innisfree',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mi9vrt0h5b0n1a.webp',
    },
    {
      name: 'The Originote Brightening Face Cream',
      price: 129000,
      url: 'https://shopee.vn/Kem-Duong-The-Originote',
      image:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgrc5j0m81l813.webp',
    },
    {
      name: 'SOINLAB Micellar Cleansing Water',
      price: 56640,
      url: 'https://shopee.vn/Nuoc-tay-trang-SOINLAB',
      image:
        'https://down-vn.img.susercontent.com/file/sg-11134253-7rdxm-mdf3x0ncreqy13.webp',
    },
  ];

  // Hàm tự động phân loại vai trò sử dụng dựa trên tên sản phẩm
  const determineUsageRole = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('combo') || n.includes('set') || n.includes('trio'))
      return 'Combo';
    if (n.includes('cleanser') || n.includes('rửa mặt')) return 'Cleanser';
    if (n.includes('serum') || n.includes('essence') || n.includes('tinh chất'))
      return 'Serum';
    if (n.includes('sunscreen') || n.includes('chống nắng')) return 'Sunscreen';
    if (
      n.includes('cream') ||
      n.includes('moisturizing') ||
      n.includes('dưỡng ẩm')
    )
      return 'Moisturizer';
    if (n.includes('micellar') || n.includes('tẩy trang'))
      return 'Micellar Water';
    return 'Other';
  };

  await prisma.affiliate_products.createMany({
    data: rawData.map((item) => ({
      name: item.name,
      usage_role: determineUsageRole(item.name),
      display_price: item.price,
      affiliate_url: item.url,
      image_url: item.image,
      is_active: true,
    })),
  });

  console.log(`Đã seed thành công ${rawData.length} sản phẩm affiliate.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
