import { PrismaClient } from '@prisma/client';

export async function seedProducts(prisma: PrismaClient) {
  const data = [
    //Normal Skin
    {
      name: 'Hatomugi Job’s Tears Cleanser',
      usage_role: 'Cleanser',
      display_price: 67000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134253-7rd3s-m7i277117u6ub7.webp',
      affiliate_url: 'https://vn.shp.ee/5BoFFVF',
    },
    {
      name: 'Hatomugi Facial Cleanser',
      usage_role: 'Cleanser',
      display_price: 62000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134253-822y3-mi0h9uzudible1@resize_w900_nl.webp',
      affiliate_url: 'https://vn.shp.ee/ZagB9yY',
    },
    {
      name: 'Collagen Serum',
      usage_role: 'Serum',
      display_price: 155527,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m9u72bcrfptu35.webp',
      affiliate_url: 'https://vn.shp.ee/ARVe2HJ',
    },
    {
      name: 'AUSCHOO B3-B5 Serum',
      usage_role: 'Serum',
      display_price: 269000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Decumar Sunscreen',
      usage_role: 'Sunscreen',
      display_price: 197000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: 'The Originote Hyalucera Gel',
      usage_role: 'Moisturizer',
      display_price: 82000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Skin1004 Madagascar Centella',
      usage_role: 'Ampoule',
      display_price: 335000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22100-qj9e0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Simple Kind to Skin Cleanser',
      usage_role: 'Cleanser',
      display_price: 99000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Eucerin ProAcne Cleanser',
      usage_role: 'Cleanser',
      display_price: 450000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: 'Bioderma Sensibio H2O',
      usage_role: 'Makeup Remover',
      display_price: 395000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    // Dry Skin
    {
      name: "L'Oreal Micellar Water",
      usage_role: 'Makeup Remover',
      display_price: 189000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22100-qj9e0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'La Roche-Posay Effaclar Gel',
      usage_role: 'Cleanser',
      display_price: 425000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'CeraVe Hydrating Cleanser',
      usage_role: 'Cleanser',
      display_price: 370000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: 'Innisfree Green Tea Seed',
      usage_role: 'Serum',
      display_price: 610000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Paula’s Choice 2% BHA',
      usage_role: 'Exfoliator',
      display_price: 850000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22100-qj9e0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Neutrogena Hydro Boost',
      usage_role: 'Moisturizer',
      display_price: 350000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Anessa Perfect UV',
      usage_role: 'Sunscreen',
      display_price: 520000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: 'Vichy Mineral 89',
      usage_role: 'Serum',
      display_price: 890000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Some By Mi AHA-BHA-PHA',
      usage_role: 'Toner',
      display_price: 280000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22100-qj9e0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Klairs Supple Preparation',
      usage_role: 'Toner',
      display_price: 320000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    // Combination Skin
    {
      name: 'COSRX Snail Mucin 96',
      usage_role: 'Essence',
      display_price: 450000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: 'Obagi Retinol 1.0',
      usage_role: 'Treatment',
      display_price: 1350000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'The Ordinary Niacinamide',
      usage_role: 'Serum',
      display_price: 210000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22100-qj9e0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Hada Labo Gokujyun',
      usage_role: 'Lotion',
      display_price: 240000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Melano CC Vitamin C',
      usage_role: 'Serum',
      display_price: 290000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: 'Avene Thermal Spring Water',
      usage_role: 'Mist',
      display_price: 310000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Laneige Water Bank',
      usage_role: 'Moisturizer',
      display_price: 850000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22100-qj9e0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Dr.Jart+ Cicapair',
      usage_role: 'Cream',
      display_price: 780000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: "Kiehl's Calendula Toner",
      usage_role: 'Toner',
      display_price: 950000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: 'Shiseido Ultimune',
      usage_role: 'Serum',
      display_price: 2500000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    // Sensitive Skin
    {
      name: 'Sukin Facial Cleanser',
      usage_role: 'Cleanser',
      display_price: 220000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22100-qj9e0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Muji Sensitive Skin Toner',
      usage_role: 'Toner',
      display_price: 210000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Bio-Oil Skincare Oil',
      usage_role: 'Oil',
      display_price: 320000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: 'Rohto Mentholatum Sunplay',
      usage_role: 'Sunscreen',
      display_price: 95000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Himalaya Neem Face Wash',
      usage_role: 'Cleanser',
      display_price: 85000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22100-qj9e0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Senka Perfect Whip',
      usage_role: 'Cleanser',
      display_price: 105000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Nivea Sun Protect',
      usage_role: 'Sunscreen',
      display_price: 155000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: 'Bioré UV Aqua Rich',
      usage_role: 'Sunscreen',
      display_price: 215000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Nature Republic Aloe Vera',
      usage_role: 'Gel',
      display_price: 125000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22100-qj9e0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'DHC Deep Cleansing Oil',
      usage_role: 'Oil',
      display_price: 650000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    // Oily Skin
    {
      name: 'Banila Co Clean It Zero',
      usage_role: 'Balm',
      display_price: 420000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: 'Cosmedica Hyaluronic Acid',
      usage_role: 'Serum',
      display_price: 350000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Timeless Vitamin C+E',
      usage_role: 'Serum',
      display_price: 490000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22100-qj9e0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Mad Hippie Vitamin C',
      usage_role: 'Serum',
      display_price: 650000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Lush Mask of Magnaminty',
      usage_role: 'Mask',
      display_price: 550000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: "Kiehl's Ultra Facial",
      usage_role: 'Moisturizer',
      display_price: 950000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Clinique Moisture Surge',
      usage_role: 'Moisturizer',
      display_price: 1100000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22100-qj9e0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Clarins Double Serum',
      usage_role: 'Serum',
      display_price: 2400000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqebjt8xvp6f85.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'Estee Lauder Night Repair',
      usage_role: 'Serum',
      display_price: 3200000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-82h0z-m76m5v6n57at75.webp',
      affiliate_url: 'https://vn.shp.ee/q1N7B5S',
    },
    {
      name: 'SK-II Facial Treatment Essence',
      usage_role: 'Essence',
      display_price: 4500000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-22120-4oat0z41xukvf0.webp',
      affiliate_url: 'https://vn.shp.ee/8oFEvmB',
    },
    {
      name: 'SOINLAB Micellar Water',
      usage_role: 'Makeup Remover',
      display_price: 500000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134253-7rdxm-mdf3x0ncreqy13.webp',
      affiliate_url:
        'https://shopee.vn/N%C6%B0%E1%BB%9Bc-t%E1%BA%A9y-trang-SOINLAB-Ch%C3%ADnh-H%C3%A3ng-500ml-d%C3%A0nh-cho-Da-D%E1%BA%A7u-M%E1%BB%A5n-Da-Nh%E1%BA%A1y-C%E1%BA%A3m-Da-Kh%C3%B4-S%E1%BA%A1ch-s%C3%A2u-d%E1%BB%8Bu-nh%E1%BA%B9-i.308965874.42451651329',
    },
  ];

  console.log('📦 Seeding affiliate products...');

  const chunkSize = 20;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await prisma.affiliate_products.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(
      `✅ Seeded ${Math.min(i + chunkSize, data.length)}/${data.length} affiliate products`,
    );
  }
}
