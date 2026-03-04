import { PrismaClient } from '@prisma/client';

export async function seedProducts(prisma: PrismaClient) {
  const data = [
    // Normal Skin
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
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mk0tjz6md6h3a8@resize_w900_nl.webp',
      affiliate_url: 'https://vn.shp.ee/PWb1kde',
    },
    {
      name: 'BEPLAIN Tone-Up Sunscreen',
      usage_role: 'Sunscreen',
      display_price: 99000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134202-8260g-mjb2fg33wyyu6c.webp',
      affiliate_url: 'https://vn.shp.ee/mGbDdY7',
    },

    {
      name: 'Cocoon Winter Melon Gel Cream',
      usage_role: 'Moisturizer',
      display_price: 165000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltyr0io470nz42.webp',
      affiliate_url: 'https://vn.shp.ee/hKLLhxU',
    },
    {
      name: 'OLAY LUMINOUS Moisturizing Cream',
      usage_role: 'Moisturizer',
      display_price: 159000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-23010-7l9eio7o8ylv13@resize_w900_nl.webp',
      affiliate_url:
        'https://shopee.vn/Kem-D%C6%B0%E1%BB%A1ng-%E1%BA%A8m-OLAY-LUMINOUS-Ban-%C4%90%C3%AAm-S%C3%A1ng-Da-50G-i.156517921.6006810800',
    },

    {
      name: 'Focallure x Sanrio Micellar Water',
      usage_role: 'Makeup Remover',
      display_price: 119000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltkyzq9wox7100.webp',
      affiliate_url: 'https://vn.shp.ee/9Syk7MX',
    },
    {
      name: 'COLORKEY Luminous Micellar Water',
      usage_role: 'Makeup Remover',
      display_price: 139320,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mfc2xluzzg9430.webp',
      affiliate_url: 'https://vn.shp.ee/qVvdqG2',
    },
    // Dry Skin
    {
      name: 'Truesky Centella Anti-Acne Cleanser Gel',
      usage_role: 'Cleanser',
      display_price: 89000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqa89pbppviq41.webp',
      affiliate_url: 'https://vn.shp.ee/gGKbn7X',
    },
    {
      name: 'POP PURE Rice Facial Cleanser',
      usage_role: 'Cleanser',
      display_price: 99000,
      image_url:
        'https://down-vn.img.susercontent.com/file/cn-11134207-820l4-migrnyaczcw31d.webp',
      affiliate_url: 'https://vn.shp.ee/pQsTsJu',
    },

    {
      name: 'VEZE 24K Gold Serum',
      usage_role: 'Serum',
      display_price: 80000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltxyc9jv5b8fde.webp',
      affiliate_url: 'https://vn.shp.ee/9UYQ467',
    },
    {
      name: 'MIINSKIN Niacinamide Whitening Essence',
      usage_role: 'Serum',
      display_price: 330000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-md2ppvqp3h5od4.webp',
      affiliate_url: 'https://vn.shp.ee/bSLY6h5',
    },

    {
      name: 'Dr.G Brightening Up Sun+ Sunscreen',
      usage_role: 'Sunscreen',
      display_price: 115000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mh7fuxahy8eha2.webp',
      affiliate_url: 'https://vn.shp.ee/hCVfTR8',
    },
    {
      name: 'Skin Aqua Sunplay Sunscreen',
      usage_role: 'Sunscreen',
      display_price: 163000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-luh7dzyhs7wy2f.webp',
      affiliate_url: 'https://vn.shp.ee/iyE4cVE',
    },

    {
      name: 'ICESEA Chamomile Brightening Cream',
      usage_role: 'Moisturizer',
      display_price: 99000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m0l9bm02x6z360.webp',
      affiliate_url: 'https://vn.shp.ee/BnVFbTo',
    },
    {
      name: 'DoMeCare Moisturizing Cream',
      usage_role: 'Moisturizer',
      display_price: 156750,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-8259t-mgd1vx3xx0y681.webp',
      affiliate_url: 'https://vn.shp.ee/mEvXKDo',
    },

    {
      name: 'Carslan Micellar Cleansing Water',
      usage_role: 'Makeup Remover',
      display_price: 118419,
      image_url:
        'https://down-vn.img.susercontent.com/file/32167f9d15579b34489fb5a99b702571.webp',
      affiliate_url: 'https://vn.shp.ee/T1ZyZnx',
    },
    {
      name: 'Cocoon Hau Giang Lotus Micellar Water',
      usage_role: 'Makeup Remover',
      display_price: 136400,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mfc8jhudqfwv2f.webp',
      affiliate_url:
        'https://shopee.vn/N%C6%B0%E1%BB%9Bc-t%E1%BA%A9y-trang-sen-H%E1%BA%ADu-Giang-Cocoon-M%E1%BB%B9-ph%E1%BA%A9m-thu%E1%BA%A7n-chay-i.22823111.29392398280',
    },

    // Combination Skin
    {
      name: 'Actidem Derma pH Gel Cleanser',
      usage_role: 'Cleanser',
      display_price: 150000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mb1yxxdj1zgh44.webp',
      affiliate_url:
        'https://shopee.vn/Gel-r%E1%BB%ADa-m%E1%BA%B7t-cho-da-d%E1%BA%A7u-m%E1%BB%A5n-da-h%E1%BB%97n-h%E1%BB%A3p-Actidem-Derma-pH-Gel-Cleanser-30ml-150ml-180ml-Be-Glow-i.4967860.25752493911',
    },
    {
      name: 'MeO Foaming Face Cleanser',
      usage_role: 'Cleanser',
      display_price: 99000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mhk7wmj6dn2cf4.webp',
      affiliate_url:
        'https://shopee.vn/S%E1%BB%AFa-r%E1%BB%ADa-m%E1%BA%B7t-t%E1%BA%A1o-b%E1%BB%8Dt-MeO-Foaming-Face-Cleanser-thi%C3%AAn-nhi%C3%AAn-s%E1%BA%A1ch-b%C3%A3-nh%E1%BB%9Dn-gi%E1%BA%A3m-m%E1%BB%A5n-d%C6%B0%E1%BB%A1ng-da-m%E1%BB%8Bn-m%C3%A0ng-m%E1%BB%97i-ng%C3%A0y-100ml-i.1212741559.47752236381',
    },

    {
      name: 'Cosan Active Boost Serum',
      usage_role: 'Serum',
      display_price: 500000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m49w2bnu5yn4d3.webp',
      affiliate_url:
        'https://shopee.vn/Serum-k%C3%ADch-ho%E1%BA%A1t-l%C3%A0n-da-t%C4%83ng-c%C6%B0%E1%BB%9Dng-ho%E1%BA%A1t-%C4%91%E1%BB%99ng-c%E1%BB%A7a-da-Serum-Active-Boost-Cosan-30ml-i.1074852737.27721210218',
    },
    {
      name: 'Bee Venom Essence',
      usage_role: 'Serum',
      display_price: 500000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mhll4tn2ebk6ab.webp',
      affiliate_url:
        'https://shopee.vn/Tinh-Ch%E1%BA%A5t-N%E1%BB%8Dc-Ong-C%E1%BA%A5p-%E1%BA%A8m-C%C4%83ng-B%C3%B3ng-D%C6%B0%E1%BB%A1ng-Da-Ph%C3%B9-H%E1%BB%A3p-T%E1%BA%A5t-C%E1%BA%A3-C%C3%A1c-Lo%E1%BA%A1i-Da-Nitran-Store-Serum-L%C3%A0m-%C4%90%E1%BA%B9p-Da-i.1217445457.16399943550',
    },

    {
      name: 'VIBRANT GLAMOUR Vitamin C Sunscreen',
      usage_role: 'Sunscreen',
      display_price: 163500,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m89ywhelqdf275@resize_w900_nl.webp',
      affiliate_url:
        'https://shopee.vn/Kem-ch%E1%BB%91ng-n%E1%BA%AFng-vitamin-C-VIBRANT-GLAMOUR-l%C3%A0m-tr%E1%BA%AFng-da-b%E1%BA%A3o-v%E1%BB%87-da-kh%E1%BB%8Fi-tia-UVA-UVB-30g-i.1136844229.25113869603',
    },
    {
      name: 'Rice & B5 Brightening Sunscreen SPF50+ PA++++',
      usage_role: 'Sunscreen',
      display_price: 131001,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mhfx4njxt154e9.webp',
      affiliate_url:
        'https://shopee.vn/Beauty-of-Joseon-Kem-Ch%E1%BB%91ng-N%E1%BA%AFng-D%C6%B0%E1%BB%A1ng-Tr%E1%BA%AFng-G%E1%BA%A1o-B5-SPF50-PA-L%C3%A0m-%C4%90%E1%BB%81u-M%C3%A0u-Da-Gi%E1%BA%A3m-Th%C3%A2m-N%C3%A1m-i.1571686552.55352013298',
    },

    {
      name: 'The Originote Cica-B5 Soothing Cream',
      usage_role: 'Moisturizer',
      display_price: 122000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgrc59krzo5k5d.webp',
      affiliate_url:
        'https://shopee.vn/Kem-D%C6%B0%E1%BB%A1ng-L%C3%A0m-D%E1%BB%8Bu-Da-Cica-B5-The-Originote-ph%E1%BB%A5c-h%E1%BB%93i-d%C6%B0%E1%BB%A1ng-%E1%BA%A9m-gi%E1%BA%A3m-m%E1%BB%A5n-c%E1%BA%A3i-thi%E1%BB%87n-h%C3%A0ng-r%C3%A0o-b%E1%BA%A3o-v%E1%BB%87-da-Soothing-Moisturizer-i.849452085.26204292596',
    },
    {
      name: 'Felicia Moisturizing Cream',
      usage_role: 'Moisturizer',
      display_price: 145800,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mimds9ii6fwnea.webp',
      affiliate_url:
        'https://shopee.vn/KEM-D%C6%AF%E1%BB%A0NG-%E1%BA%A8M-FELICIA-%E2%80%93-D%C6%AF%E1%BB%A0NG-DA-M%E1%BB%80M-M%E1%BB%8AN-PH%E1%BB%A4C-H%E1%BB%92I-L%C3%80M-D%E1%BB%8AU-DA-i.1477470653.52303537936',
    },

    {
      name: 'Garnier 3-in-1 Micellar Cleansing Water',
      usage_role: 'Makeup Remover',
      display_price: 148400,
      image_url:
        'https://down-vn.img.susercontent.com/file/cn-11134207-820l4-mj51ebnoqo05e7@resize_w900_nl.webp',
      affiliate_url:
        'https://shopee.vn/N%C6%B0%E1%BB%9Bc-t%E1%BA%A9y-trang-v%C3%A0-t%E1%BA%A9y-trang-3-trong-1-Garnier-(M%E1%BA%AFt-M%C3%B4i-v%C3%A0-M%E1%BA%B7t-Nh%E1%BA%B9-nh%C3%A0ng-Kh%C3%B4ng-ch%E1%BB%A9a-c%E1%BB%93n-400ml)-i.1623081549.51554172379',
    },
    {
      name: 'TWG Amino Acid Micellar Water',
      usage_role: 'Makeup Remover',
      display_price: 54000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-7rdyx-mcrnedyr6zg965.webp',
      affiliate_url:
        'https://shopee.vn/N%C6%B0%E1%BB%9Bc-T%E1%BA%A9y-Trang-TWG-Amino-Acid-300ml-L%C3%A0m-S%E1%BA%A1ch-T%E1%BB%91i-%C4%90a-Kh%C3%B4ng-K%C3%ADch-Th%C3%ADch-Da-Ph%C3%B9-H%E1%BB%A3p-Da-Nh%E1%BA%A1y-C%E1%BA%A3m-i.1546476718.40860775167',
    },

    // Sensitive Skin
    {
      name: 'The Cafuné Ginger Facial Cleanser',
      usage_role: 'Cleanser',
      display_price: 500000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lvcy3chgua90e7.webp',
      affiliate_url:
        'https://shopee.vn/S%E1%BB%ADa-r%E1%BB%ADa-m%E1%BA%B7t-g%E1%BB%ABng-nh%E1%BA%B9-nh%C3%A0ng-l%C3%A0m-s%E1%BA%A1ch-s%C3%A2u-cho-da-th%C6%B0%E1%BB%9Dng-da-h%E1%BB%97n-h%E1%BB%A3p-da-d%E1%BA%A7u-nh%E1%BA%A1y-c%E1%BA%A3m-The-Cafun%C3%A9-120ml-i.697821129.19363483990',
    },
    {
      name: 'SVR Facial Cleanser',
      usage_role: 'Cleanser',
      display_price: 500000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lpg0vup5ikwe32.webp',
      affiliate_url:
        'https://shopee.vn/S%E1%BB%AFa-R%E1%BB%ADa-M%E1%BA%B7t-SVR-Cho-Da-Kh%C3%B4-V%C3%A0-Nh%E1%BA%A1y-C%E1%BA%A3m-TOPIALYSE-Gel-Lavant-55ml-200ml-400ml-Dr-Th%C3%AAm-i.18363975.12376741406',
    },

    {
      name: 'OLIS B5 HA Serum',
      usage_role: 'Serum',
      display_price: 500000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-milg4v9ju135dd.webp',
      affiliate_url:
        'https://shopee.vn/Tinh-ch%E1%BA%A5t-Serum-B5-HA-OLIS-Ph%E1%BB%A5c-H%E1%BB%93i-Da-Nh%E1%BA%A1y-C%E1%BA%A3m-D%C6%B0%E1%BB%A1ng-s%C3%A1ng-%C4%91%E1%BB%81u-m%C3%A0u-da-C%E1%BA%A5p-%E1%BA%A9m-ph%E1%BB%A5c-h%E1%BB%93i-M%E1%BB%9D-th%C3%A2m-i.1321005284.40665071984',
    },
    {
      name: 'Torriden DIVE-IN Serum',
      usage_role: 'Serum',
      display_price: 86000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgrqcwyuwuff7e.webp',
      affiliate_url:
        'https://shopee.vn/Torriden-Serum-DIVE-IN-ch%E1%BB%A9a-Hyaluronic-Acid-Serum-50-ml-i.1617219901.42676212374',
    },

    {
      name: 'LANCER KING Oil Control Sunscreen SPF50+ PA+++',
      usage_role: 'Sunscreen',
      display_price: 264999,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134253-824iz-mfk52xlf0ruw28@resize_w900_nl.webp',
      affiliate_url:
        'https://shopee.vn/Kem-Ch%E1%BB%91ng-N%E1%BA%AFng-Cho-Da-Nh%E1%BA%A1y-C%E1%BA%A3m-Ki%E1%BB%81m-D%E1%BA%A7u-LANCER-KING-SPF50-PA-Kh%C3%B4ng-B%E1%BA%BFt-D%C3%ADnh-D%C6%B0%E1%BB%A1ng-S%C3%A1ng-50g-i.681524496.26479171774',
    },
    {
      name: 'Xiufusheng Sensitive Skin Sunscreen',
      usage_role: 'Sunscreen',
      display_price: 145000,
      image_url:
        'https://down-vn.img.susercontent.com/file/cn-11134207-820l4-mfwacqp7z21848@resize_w900_nl.webp',
      affiliate_url:
        'https://shopee.vn/Kem-ch%E1%BB%91ng-n%E1%BA%AFng-da-nh%E1%BA%A1y-c%E1%BA%A3m-Xiufusheng-l%C3%A0m-m%E1%BB%9Bi-v%C3%A0-kh%C3%B4ng-nh%E1%BB%9Dn-cho-m%E1%BA%B7t-ch%E1%BB%91ng-th%E1%BA%A5m-n%C6%B0%E1%BB%9Bc-ch%E1%BB%91ng-m%E1%BB%93-h%C3%B4i-v%C3%A0-ch%E1%BB%91ng-tia-c%E1%BB%B1c-t%C3%ADm-i.1623081549.40274480959',
    },

    {
      name: 'Cetaphil Moisturising Cream for Sensitive Skin',
      usage_role: 'Moisturizer',
      display_price: 205000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134201-8261n-mjo23kga3gg7b1.webp',
      affiliate_url:
        'https://shopee.vn/-%C4%90%E1%BB%99c-quy%E1%BB%81n-th%C3%A1ng-1-Kem-d%C6%B0%E1%BB%A1ng-%E1%BA%A9m-d%E1%BB%8Bu-l%C3%A0nh-cho-da-nh%E1%BA%A1y-c%E1%BA%A3m-CETAPHIL-MOISTURISING-CREAM-50G-i.518445856.43073003091',
    },
    {
      name: 'ICESEA Tea Tree Moisturizing Cream',
      usage_role: 'Moisturizer',
      display_price: 129000,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134253-8225w-mhqikofzqio201.webp',
      affiliate_url:
        'https://shopee.vn/Kem-D%C6%B0%E1%BB%A1ng-Tr%C3%A0m-Tr%C3%A0-Icesea-50g-Gi%E1%BA%A3m-M%E1%BB%A5n-Ki%E1%BB%81m-D%E1%BA%A7u-D%C6%B0%E1%BB%A1ng-%E1%BA%A8m-V%C3%A0-Ph%E1%BB%A5c-H%E1%BB%93i-Da-Nh%E1%BA%A1y-C%E1%BA%A3m-i.1360326332.28711903500',
    },

    {
      name: 'SOINLAB Micellar Cleansing Water',
      usage_role: 'Makeup Remover',
      display_price: 56640,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134253-7rdxm-mdf3x0ncreqy13.webp',
      affiliate_url:
        'https://shopee.vn/N%C6%B0%E1%BB%9Bc-t%E1%BA%A9y-trang-SOINLAB-Ch%C3%ADnh-H%C3%A3ng-500ml-d%C3%A0nh-cho-Da-D%E1%BA%A7u-M%E1%BB%A5n-Da-Nh%E1%BA%A1y-C%E1%BA%A3m-Da-Kh%C3%B4-S%E1%BA%A1ch-s%C3%A2u-d%E1%BB%8Bu-nh%E1%BA%B9-i.308965874.42451651329',
    },
    {
      name: 'Bioderma Micellar Water',
      usage_role: 'Makeup Remover',
      display_price: 116000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134201-820l4-mh56ba5pxc0a03.webp',
      affiliate_url:
        'https://shopee.vn/N%C6%B0%C6%A1%CC%81c-T%C3%A2%CC%89y-Trang-Bioderma-Cho-Da-D%C3%A2%CC%80u-Mu%CC%A3n-Va%CC%80-Da-Nha%CC%A3y-Ca%CC%89m-S%E1%BA%A1ch-S%C3%A2u-L%C3%A0nh-T%C3%ADnh-500ML-i.1260017701.44501524105',
    },
    // Oily Skin
    {
      name: 'Tootoo Facial Cleanser',
      usage_role: 'Cleanser',
      display_price: 500000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgyx4r3x2cct40.webp',
      affiliate_url:
        'https://shopee.vn/tootoo-S%E1%BB%ADa-r%E1%BB%ADa-m%E1%BA%B7t-t%E1%BA%A1o-b%E1%BB%8Dt-l%C3%A0m-s%E1%BA%A1ch-nh%E1%BB%99-nh%C3%A0ng-d%C6%B0%E1%BB%9Fng-%E1%BA%A9m-l%C3%A2u-d%C3%A0i-Ph%C3%B9-h%E1%BB%A3p-cho-m%E1%BB%8Di-l%E1%BB%9F-tu%E1%BB%95i-90ml-i.1049768122.50200247169',
    },
    {
      name: 'Cokki Facial Cleanser',
      usage_role: 'Cleanser',
      display_price: 500000,
      image_url:
        'https://down-vn.img.susercontent.com/file/cn-11134207-820l4-mhtwwjfgcvt104.webp',
      affiliate_url:
        'https://shopee.vn/S%E1%BB%ADa-R%E1%BB%ADa-M%E1%BA%B7t-Cokki-Cho-Da-D%E1%BA%A7u-Da-Nh%E1%BA%A1y-C%E1%BA%A3m-500ml-i.1117361098.24834234760',
    },
    {
      name: 'Drceutics Basic Niacinamide 8% Serum',
      usage_role: 'Serum',
      display_price: 193050,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134253-81zte-miqbpmztghz6e7.webp',
      affiliate_url:
        'https://shopee.vn/Serum-Drceutics-Basic-Niacinamide-8-i.1579794733.40818820917',
    },
    {
      name: 'TIAM Serum',
      usage_role: 'Serum',
      display_price: 155000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134201-7ras8-manxqrytyu18a8.webp',
      affiliate_url:
        'https://shopee.vn/Serum-TIAM-Han-Quoc-40ml-i.1570670397.25097854552',
    },
    {
      name: 'd’Alba Sunscreen',
      usage_role: 'Sunscreen',
      display_price: 164565,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mivcld4gvcas54.webp',
      affiliate_url:
        'https://shopee.vn/Kem-Chong-Nang-dAlba-i.728512191.43376953635',
    },
    {
      name: 'Innisfree Tone Up No Sebum Sunscreen SPF50+ PA++++',
      usage_role: 'Sunscreen',
      display_price: 239000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mi9vrt0h5b0n1a.webp',
      affiliate_url:
        'https://shopee.vn/Innisfree-Tone-Up-No-Sebum-Sunscreen-i.1398953600.47703130639',
    },
    {
      name: 'The Originote Brightening Face Cream',
      usage_role: 'Moisturizer',
      display_price: 129000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgrc5j0m81l813.webp',
      affiliate_url:
        'https://shopee.vn/The-Originote-Brightening-Face-Cream-i.849452085.28804292203',
    },
    {
      name: 'FOCALSKIN Centella Moisturizing Cream',
      usage_role: 'Moisturizer',
      display_price: 98000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lry0rlncvtsp87.webp',
      affiliate_url:
        'https://shopee.vn/FOCALSKIN-Centella-Moisturizing-Cream-i.968434025.23740415211',
    },
    {
      name: 'SOINLAB Micellar Cleansing Water',
      usage_role: 'Makeup Remover',
      display_price: 56640,
      image_url:
        'https://down-vn.img.susercontent.com/file/sg-11134253-7rdxm-mdf3x0ncreqy13.webp',
      affiliate_url:
        'https://shopee.vn/SOINLAB-Micellar-Cleansing-Water-i.308965874.42451651329',
    },
    {
      name: 'Bioderma Micellar Water',
      usage_role: 'Makeup Remover',
      display_price: 116000,
      image_url:
        'https://down-vn.img.susercontent.com/file/vn-11134201-820l4-mh56ba5pxc0a03.webp',
      affiliate_url:
        'https://shopee.vn/Bioderma-Micellar-Water-i.1260017701.44501524105',
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
