import { PrismaClient, skin_type_enum } from '@prisma/client';

export async function seedProductCombos(prisma: PrismaClient) {
  const skinTypesFromDb = await prisma.skin_types.findMany();
  const skinTypeMap = new Map(skinTypesFromDb.map((st) => [st.code, st.id]));

  const getSkinTypeId = (typeStr: string): string => {
    const normalized = typeStr.toUpperCase().trim();
    let code: skin_type_enum;

    if (normalized.includes('NORMAL')) code = skin_type_enum.NORMAL;
    else if (normalized.includes('DRY')) code = skin_type_enum.DRY;
    else if (normalized.includes('COMBINATION'))
      code = skin_type_enum.COMBINATION;
    else if (normalized.includes('SENSITIVE')) code = skin_type_enum.SENSITIVE;
    else if (normalized.includes('OILY')) code = skin_type_enum.OILY;
    else code = skin_type_enum.NORMAL;

    const id = skinTypeMap.get(code);
    if (!id)
      throw new Error(
        `Not found ID for skin type: ${code} in DB. Please seed skin_types first.`,
      );
    return id;
  };

  const data = [
    // Normal skin combos
    {
      skinType: 'Normal',
      comboName: 'SIMPLE 3-Step Skincare Combo',
      comboPrice: 230400,
      comboUrl: 'https://vn.shp.ee/WFYXhET',
      comboImg:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m4ydah1vwqxj8a.webp',
      products: [
        {
          name: 'Simple Facial Cleanser',
          role: 'Cleanser',
          price: 120000,
          url: 'https://shopee.vn/-DI%E1%BB%86N-M%E1%BA%A0O-M%E1%BB%9AI-S%E1%BB%AFa-R%E1%BB%ADa-M%E1%BA%B7t-Simple-l%C3%A0nh-t%C3%ADnh-v%C3%A0-hi%E1%BB%87u-qu%E1%BA%A3-cho-m%E1%BB%8Di-lo%E1%BA%A1i-da-150ml-i.1397276155.27268477323?extraParams=%7B%22display_model_id%22%3A39491117419%2C%22model_selection_logic%22%3A3%7D',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m35x3j7w6b4e67.webp',
        },
        {
          name: 'Simple Micellar Cleansing Water',
          role: 'Cleanser',
          price: 75000,
          url: 'https://shopee.vn/N%C6%B0%E1%BB%9Bc-T%E1%BA%A9y-Trang-Simple-Micellar-Cleansing-Water-200ml-400ml-D%E1%BB%8Bu-Nh%E1%BA%B9-Cho-Da-Nh%E1%BA%A1y-C%E1%BA%A3m-Dr-Th%C3%AAm-i.18363975.14185378989?extraParams=%7B%22display_model_id%22%3A175734350640%2C%22model_selection_logic%22%3A3%7Dr',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lwjgu9nnoxjtca.webp',
        },
        {
          name: 'Simple Soothing Toner',
          role: 'Toner',
          price: 185000,
          url: 'https://shopee.vn/N%C6%AF%E1%BB%9AC-HOA-H%E1%BB%92NG-C%C3%82N-B%E1%BA%B0NG-DA-SIMPLE-SOOTHING-TONER-200ML-i.1397276155.28668472748?extraParams=%7B%22display_model_id%22%3A252092067660%2C%22model_selection_logic%22%3A3%7D',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m4x7nesp11xf6c.webp',
        },
      ],
    },
    {
      skinType: 'Normal',
      comboName: 'Cosan Skincare Combo',
      comboPrice: 1081000,
      comboUrl: 'https://vn.shp.ee/eYZnrzw',
      comboImg:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m1fn00xfiv9b68.webp',
      products: [
        {
          name: 'Cosan Gentle Facial Cleanser',
          role: 'Cleanser',
          price: 147000,
          url: 'https://shopee.vn/S%E1%BB%AFa-R%E1%BB%ADa-M%E1%BA%B7t-D%E1%BB%8Bu-Nh%E1%BA%B9-S%E1%BA%A1ch-D%E1%BA%A7u-Nh%E1%BB%9Dn-Ng%E1%BB%ABa-M%E1%BB%A5n-Gi%E1%BB%AF-%E1%BA%A8m-V%C3%A0-L%C3%A0m-S%C3%A1ng-Da-T%E1%BB%B1-Nhi%C3%AAn-COSAN-Dee-Purity-Cleanser-100g-i.1074852737.24700078985',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ln0dw03ocmk337.webp',
        },
        {
          name: 'Cosan UV Blocker Cream SPF50+ PA++++',
          role: 'Sunscreen',
          price: 246000,
          url: 'https://shopee.vn/Kem-ch%E1%BB%91ng-n%E1%BA%AFng-Cosan-UV-Blocker-Cream-SPF50-PA-i.1074852737.20934578591',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m1h1aoscu82baa.webp',
        },
        {
          name: 'Cosan Hydrapore Serum',
          role: 'Serum',
          price: 300000,
          url: 'https://shopee.vn/Serum-d%C6%B0%E1%BB%A1ng-ph%E1%BB%A5c-h%E1%BB%93i-Cosan-Hydrapore-Serum-i.1074852737.22434578901',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m1h1aoscu82baa.webp',
        },
        {
          name: 'Cosan Pure Luminescence Cream',
          role: 'Sunscreen',
          price: 282240,
          url: 'https://shopee.vn/Kem-d%C6%B0%E1%BB%A1ng-tr%E1%BA%AFng-da-Cosan-Pure-Luminescence-Cream-i.1074852737.22434578902',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m1h1aoscu82baa.webp',
        },
      ],
    },
    // Dry skin combos
    {
      skinType: 'Dry',
      comboName: 'Omuse Complete Skincare Set (4 Products)',
      comboPrice: 1699000,
      comboUrl: 'https://vn.shp.ee/N3sXRtZ',
      comboImg:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mee03zutq4ua3d.webp',
      products: [
        {
          name: 'OMUSE Brightening Face Cream',
          role: 'Sunscreen',
          price: 950000,
          url: 'https://shopee.vn/Kem-D%C6%B0%E1%BB%9Fng-Tr%E1%BA%AFng-Da-M%E1%BA%B7t-OMUSE-Oh-So-Glowy-Brightening-Cream-50g-Gi%C3%BAp-D%C6%B0%E1%BB%9Fng-%E1%BA%A8m-H%E1%BB%97-Tr%E1%BB%A3-Gi%E1%BA%A3m-Th%C3%A2m-M%E1%BB%A5n-i.62794689.41717922639',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-medsc2r0hpmped.webp',
        },
        {
          name: 'OMUSE Oil Control & Acne Prevention Set',
          role: 'Moisturizer',
          price: 1390000,
          url: 'https://shopee.vn/B%E1%BB%99-S%E1%BA%A3n-Ph%E1%BA%A9m-Ng%E1%BB%ABa-M%E1%BB%A5n-v%C3%A0-Ki%E1%BB%81m-D%E1%BA%A7u-OMUSE-Blemish-Solution-Acne-Correcting-D%C3%A0nh-Cho-Da-D%E1%BA%A7u-i.62794689.43017986088',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mee05jedg1dv6e.webp',
        },
        {
          name: 'OMUSE Secret Timeless Rejuvenating Cream + Serum (50g + 30ml)',
          role: 'Moisturizer',
          price: 874540,
          url: 'https://shopee.vn/Combo-D%C6%B0%E1%BB%9Fng-Da-OMUSE-Secret-Timeless-Rejuvenating-Cream-50g-Serum-30ml-MelaV-White-Toner-120ml-C%E1%BA%A5p-%E1%BA%A8m-Ng%E1%BB%ABa-N%E1%BA%BFp-Nh%C4%83n-i.62794689.43167927541',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mee0ivw3o4jrdb.webp',
        },
      ],
    },
    {
      skinType: 'Dry',
      comboName: 'Prettyskin B5 Complete Skincare Set',
      comboPrice: 1890000,
      comboUrl:
        'https://shopee.vn/Combo-5-s%E1%BA%A3n-ph%E1%BA%A9m-skincare-b%E1%BB%99-B5-SRM-TT-Toner-Serum-Kem-d%C6%B0%E1%BB%9Fng-B5-Prettyskin-i.737621633.22589702064',
      comboImg:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m492gk9c7n5zdc.webp',
      products: [
        {
          name: 'Prettyskin B5 Facial Cleanser',
          role: 'Cleanser',
          price: 380000,
          url: 'https://shopee.vn/S%E1%BB%AFa-r%E1%BB%ADa-m%E1%BA%B7t-B5-Prettyskin-300ml-i.737621633.25961822353',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lr6wv9une21029.webp',
        },
        {
          name: 'Prettyskin B5 Micellar Cleansing Water',
          role: 'Cleanser',
          price: 300000,
          url: 'https://shopee.vn/N%C6%B0%E1%BB%9Bc-t%E1%BA%A9y-trang-B5-Prettyskin-500ml-i.737621633.21681840943',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lpyimty5rrqv5b.webp',
        },
        {
          name: 'Prettyskin B5 Recovery Moisturizing Cream',
          role: 'Moisturizer',
          price: 450000,
          url: 'https://shopee.vn/Kem-d%C6%B0%E1%BB%9Fng-%E1%BA%A9m-gi%C3%BAp-ph%E1%BB%A5c-h%E1%BB%93i-B5-Prettyskin-i.737621633.24380916751',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lvezpckc54el1f.webp',
        },
        {
          name: 'Prettyskin B5 Recovery Toner',
          role: 'Toner',
          price: 410000,
          url: 'https://shopee.vn/N%C6%B0%E1%BB%9Bc-hoa-h%E1%BB%93ng-gi%C3%BAp-ph%E1%BB%A5c-h%E1%BB%93i-B5-Prettyskin-i.737621633.25056964006',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lr8c8p3ysa84c9.webp',
        },
        {
          name: 'Prettyskin B5 Brightening & Recovery Serum',
          role: 'Serum',
          price: 450000,
          url: 'https://shopee.vn/Serum-gi%C3%BAp-ph%E1%BB%A5c-h%E1%BB%93i-d%C6%B0%E1%BB%9Fng-s%C3%A1ng-B5-Prettyskin-50ml-i.737621633.18330485960',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lplnuxdsollnc3.webp',
        },
      ],
    },
    // Combination skin combos
    {
      skinType: 'Combination',
      comboName: 'ICESEA Tea Tree 5-Piece Skincare Combo',
      comboPrice: 759000,
      comboUrl:
        'https://shopee.vn/Combo-B%E1%BB%99-5-M%C3%B3n-Ch%C4%83m-S%C3%B3c-Da-Tr%C3%A0m-Tr%C3%A0-%C3%9Ac-ICESEA-H%E1%BB%97-Tr%E1%BB%A3-C%E1%BA%A5p-%E1%BA%A9m-ki%E1%BB%81m-d%E1%BA%A7u-Gi%E1%BA%A3m-M%E1%BB%A5n-Cho-Da-i.1341250995.27614266386',
      comboImg:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m1gnfx1kw9tra0@resize_w900_nl.webp',
      products: [
        {
          name: 'ICESEA Australian Tea Tree Anti-Acne Cleanser',
          role: 'Cleanser',
          price: 159000,
          url: 'https://shopee.vn/s%E1%BB%AFa-r%E1%BB%ADa-m%E1%BA%B7-tr%E1%BB%8B-m%E1%BB%A5n-Tr%C3%A0m-Tr%C3%A0-%C3%9Ac-ICESEA-da-d%E1%BA%A7u-m%E1%BB%A5n-L%C3%A0m-S%E1%BA%A1ch-S%C3%A2u-Ki%E1%BB%81m-D%E1%BA%A7u-H%E1%BB%97-Tr%E1%BB%A3-Gi%E1%BA%A3m-M%E1%BB%A5n-100g-i.1341250995.27963404715',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m12el1rd4ivz5d@resize_w900_nl.webp',
        },
        {
          name: 'ICESEA Tea Tree Hydrating Toner',
          role: 'Toner',
          price: 189000,
          url: 'https://shopee.vn/Toner-D%C6%B0%E1%BB%A1ng-%E1%BA%A8m-Tr%C3%A0m-Tr%C3%A0-%C3%9Ac-PURIFYING-TONER-ICESEA-D%C6%B0%E1%BB%A1ng-%E1%BA%A4m-C%C3%82N-B%E1%BA%B0NG-PH-Thu-Nh%E1%BB%8F-Ch%C3%A2n-L%C3%B4ng-150ml-i.1341250995.27013409577',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m12etwc2yun3da.webp',
        },
        {
          name: 'ICESEA Hydrate Serum',
          role: 'Serum',
          price: 219000,
          url: 'https://shopee.vn/La-M%C3%A3-Chamomile-l%C3%A0m-d%E1%BB%8Bu-Serum-Hydrate-C%E1%BA%A3i-thi%E1%BB%87n-m%E1%BA%B7t-%C4%91%E1%BB%8F-S%E1%BB%ADa-ch%E1%BB%AFa-h%C3%A0ng-r%C3%A0o-c%C6%A1-nh%E1%BA%A1y-c%E1%BA%A3m-Ch%C4%83m-s%C3%B3c-da-ICESEA-i.1341250995.28175369079',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m5xx5qe9pzqu55.webp',
        },
        {
          name: 'ICESEA Tea Tree Lotion',
          role: 'Moisturizer',
          price: 189000,
          url: 'https://shopee.vn/Lotion-Tea-tree-ICESEA-Tr%C3%A0m-Tr%C3%A0-%C3%9Ac-Ki%E1%BB%81m-D%E1%BA%A7u-Gi%E1%BA%A3m-M%E1%BB%A5n-D%C6%B0%E1%BB%A1ng-%E1%BA%A8m-Thu-Nh%E1%BB%8F-L%E1%BB%97-Ch%C3%A2n-L%C3%B4ng-150g-i.1341250995.25986840896',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m12ebxqh5ehr32.webp',
        },
        {
          name: 'ICESEA Chamomile Brightening Cream',
          role: 'Sunscreen',
          price: 99000,
          url: 'https://shopee.vn/Kem-D%C6%B0%E1%BB%A1ng-Tr%E1%BA%AFng-Da-C%C3%BAc-La-M%C3%A3-ICESEA-D%C6%B0%E1%BB%A1ng-%E1%BA%A8m-V%C3%A0-Ng%C4%83n-Ng%E1%BB%ABa-L%C3%A3o-H%C3%B3a-Ph%E1%BB%A5c-H%E1%BB%93i-T%C3%A1i-T%E1%BA%A1o-L%C3%A0n-Da-50g-i.1341250995.26162324982',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m0l9al6mstf1f6.webp',
        },
      ],
    },
    {
      skinType: 'Combination',
      comboName: 'Decumar Advanced Combo',
      comboPrice: 315000,
      comboUrl:
        'https://shopee.vn/Combo-Decumar-Advanced-g%E1%BB%93m-1-Gel-ng%E1%BB%ABa-m%E1%BB%A5n-01-Gel-r%E1%BB%ADa-m%E1%BA%B7t-01-kem-ch%E1%BB%91ng-n%E1%BA%AFng-gi%C3%A0nh-cho-da-m%E1%BB%A5n-DCA01-DGR01-DAV02-i.915674605.18367226371',
      comboImg:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mhitrhziwxl0ef.webp',
      products: [
        {
          name: 'Nano THC Oil-Control Acne Facial Cleanser',
          role: 'Cleanser',
          price: 123000,
          url: 'https://shopee.vn/S%E1%BB%AFa-r%E1%BB%ADa-m%E1%BA%B7t-cho-da-d%E1%BA%A7u-m%E1%BB%A5n-ngh%E1%BB%87-Nano-THC-Decumar-50g-gi%C3%BAp-s%E1%BA%A1ch-s%C3%A2u-c%C3%A2n-b%E1%BA%B1ng-%C4%91%E1%BB%99-PH-gi%E1%BA%A3m-m%E1%BB%A5n-s%C3%A1ng-da-l%C3%A0nh-t%C3%ADnh-DSM02-i.915674605.21167305061',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mhitl2gmg934fd.webp',
        },
        {
          name: 'Nano Decumar Advanced Acne & Dark Spot Gel',
          role: 'Moisturizer',
          price: 103000,
          url: 'https://shopee.vn/Gel-ch%E1%BA%A5m-ng%E1%BB%ABa-m%E1%BB%A5n-v%C3%A0-th%C3%A2m-Nano-Decumar-Advanced-20g-th%E1%BA%A9m-th%E1%BA%A5u-nhanh-kh%C3%B4ng-k%C3%ADch-%E1%BB%A9ng-hi%E1%BB%87u-qu%E1%BA%A3-t%E1%BB%91i-%C6%B0u-i.915674605.15295983127',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mhn0mby1d7gm45.webp',
        },
        {
          name: 'Decumar Suncream Oil-Control & Tone-Up for Acne-Prone Skin',
          role: 'Sunscreen',
          price: 247000,
          url: 'https://shopee.vn/Kem-ch%E1%BB%91ng-n%E1%BA%AFng-ki%E1%BB%81m-d%E1%BA%A7u-cho-da-m%E1%BB%A5n-n%C3%A2ng-tone-Suncream-Decumar-THC-SPF-50-PA-ch%C3%ADnh-h%C3%A3ng-ch%E1%BB%91ng-tr%C3%B4i-THC01-i.915674605.18167263925',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mhn0ehf57zep38.webp',
        },
      ],
    },
    // Sensitive skin combos
    {
      skinType: 'Sensitive',
      comboName: 'ICESEA Tea Tree 5-Piece Skincare Combo',
      comboPrice: 759000,
      comboUrl:
        'https://shopee.vn/Combo-B%E1%BB%99-5-M%C3%B3n-Ch%C4%83m-S%C3%B3c-Da-Tr%C3%A0m-Tr%C3%A0-%C3%9Ac-ICESEA-H%E1%BB%97-Tr%E1%BB%A3-C%E1%BA%A5p-%E1%BA%A9m-ki%E1%BB%81m-d%E1%BA%A7u-Gi%E1%BA%A3m-M%E1%BB%A5n-Cho-Da-i.1341250995.27614266386',
      comboImg:
        'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m1gnfx1kw9tra0@resize_w900_nl.webp',
      products: [
        {
          name: 'ICESEA Australian Tea Tree Anti-Acne Cleanser',
          role: 'Cleanser',
          price: 159000,
          url: 'https://shopee.vn/s%E1%BB%AFa-r%E1%BB%ADa-m%E1%BA%B7-tr%E1%BB%8B-m%E1%BB%A5n-Tr%C3%A0m-Tr%C3%A0-%C3%9Ac-ICESEA-da-d%E1%BA%A7u-m%E1%BB%A5n-L%C3%A0m-S%E1%BA%A1ch-S%C3%A2u-Ki%E1%BB%81m-D%E1%BA%A7u-H%E1%BB%97-Tr%E1%BB%A3-Gi%E1%BA%A3m-M%E1%BB%A5n-100g-i.1341250995.27963404715',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m12el1rd4ivz5d@resize_w900_nl.webp',
        },
        {
          name: 'ICESEA Tea Tree Hydrating Toner',
          role: 'Toner',
          price: 189000,
          url: 'https://shopee.vn/Toner-D%C6%B0%E1%BB%A1ng-%E1%BA%A8m-Tr%C3%A0m-Tr%C3%A0-%C3%9Ac-PURIFYING-TONER-ICESEA-D%C6%B0%E1%BB%A1ng-%E1%BA%A4m-C%C3%82N-B%E1%BA%A4NG-PH-Thu-Nh%E1%BB%8F-Ch%C3%A2n-L%C3%B4ng-150ml-i.1341250995.27013409577',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m12etwc2yun3da.webp',
        },
        {
          name: 'ICESEA Hydrate Serum',
          role: 'Serum',
          price: 219000,
          url: 'https://shopee.vn/La-M%C3%A3-Chamomile-l%C3%A0m-d%E1%BB%8Bu-Serum-Hydrate-C%E1%BA%A3i-thi%E1%BB%87n-m%E1%BA%B7t-%C4%91%E1%BB%8F-S%E1%BB%ADa-ch%E1%BB%AFa-h%C3%A0ng-r%C3%A0o-c%C6%A1-nh%E1%BA%A1y-c%E1%BA%A3m-Ch%C4%83m-s%C3%B3c-da-ICESEA-i.1341250995.28175369079',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m5xx5qe9pzqu55.webp',
        },
        {
          name: 'ICESEA Tea Tree Lotion',
          role: 'Moisturizer',
          price: 189000,
          url: 'https://shopee.vn/Lotion-Tea-tree-ICESEA-Tr%C3%A0m-Tr%C3%A0-%C3%9Ac-Ki%E1%BB%81m-D%E1%BA%A7u-Gi%E1%BA%A3m-M%E1%BB%A5n-D%C6%B0%E1%BB%A1ng-%E1%BA%A8m-Thu-Nh%E1%BB%8F-L%E1%BB%97-Ch%C3%A2n-L%C3%B4ng-150g-i.1341250995.25986840896',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m12ebxqh5ehr32.webp',
        },
        {
          name: 'ICESEA Chamomile Brightening Cream',
          role: 'Sunscreen',
          price: 99000,
          url: 'https://shopee.vn/Kem-D%C6%B0%E1%BB%A1ng-Tr%E1%BA%AFng-Da-C%C3%BAc-La-M%C3%A3-ICESEA-D%C6%B0%E1%BB%A1ng-%E1%BA%A8m-V%C3%A0-Ng%C4%83n-Ng%E1%BB%ABa-L%C3%A3o-H%C3%B3a-Ph%E1%BB%A5c-H%E1%BB%93i-T%C3%A1i-T%E1%BA%A1o-L%C3%A0n-Da-50g-i.1341250995.26162324982',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m0l9al6mstf1f6.webp',
        },
      ],
    },
    {
      skinType: 'Sensitive',
      comboName: 'Hella Skincare Combo',
      comboPrice: 500000,
      comboUrl:
        'https://shopee.vn/Combo-ch%C4%83m-s%C3%B3c-da-m%E1%BA%B7t-N%C6%B0%E1%BB%9Bc-t%E1%BA%A9y-trang-T%E1%BA%A9y-t%E1%BA%BF-b%C3%A0o-ch%E1%BA%BFt-da-m%E1%BA%B7t-Toner-c%C3%A2n-b%E1%BA%B1ng-%C4%91%E1%BB%99-%E1%BA%A9m-ph%E1%BB%A5c-h%E1%BB%93i-da-ph%C3%B9-h%E1%BB%A3p-cho-da-nh%E1%BA%A1y-c%E1%BA%A3m-i.359865795.41714439206',
      comboImg:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mfjfrw2lum1808@resize_w900_nl.webp',
      products: [
        {
          name: 'Hella Beauty Grape Micellar Cleansing Water',
          role: 'Cleanser',
          price: 110000,
          url: 'https://shopee.vn/N%C6%B0%E1%BB%9Bc-t%E1%BA%A9y-trang-nho-Hella-Beauty-s%E1%BA%A1ch-s%C3%A2u-d%C6%B0%E1%BB%A1ng-%E1%BA%A9m-kh%C3%B4ng-kh%C3%B4-r%C3%A1t-ph%C3%B9-h%E1%BB%A3p-cho-m%E1%BB%8Di-lo%E1%BA%A1i-da-i.359865795.23543280180',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mfjfsu6h9atkc0@resize_w900_nl.webp',
        },
        {
          name: 'Hella Beauty Avocado Hydrating & Softening Toner',
          role: 'Toner',
          price: 250000,
          url: 'https://shopee.vn/Toner-tr%C3%A1i-b%C6%A1-gi%C3%BAp-c%E1%BA%A5p-%E1%BA%A9m-l%C3%A0m-m%E1%BB%81m-da-Hella-Beauty-310ml-i.359865795.22466896889',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lufsoc9o8zdd73@resize_w900_nl.webp',
        },
        {
          name: 'Hella Beauty Coffee Facial Exfoliating Scrub',
          role: 'Exfoliator',
          price: 156000,
          url: 'https://shopee.vn/T%E1%BA%A9y-t%E1%BA%BF-b%C3%A0o-ch%E1%BA%BFt-da-m%E1%BA%B7t-c%C3%A0-ph%C3%AA-Hella-Beauty-150g-gi%C3%BAp-l%C3%A0m-s%E1%BA%A1ch-s%C3%A2u-h%E1%BB%97-tr%E1%BB%A3-s%C3%A1ng-da-%C4%91%E1%BB%81u-m%C3%A0u-i.359865795.21493897089',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-miwu08l85n2fe9@resize_w900_nl.webp',
        },
      ],
    },
    // Oily skin combos
    {
      skinType: 'Oily',
      comboName: 'Men Stay Simplicity Acne Relief Skincare Trio',
      comboPrice: 500000,
      comboUrl:
        'https://shopee.vn/Combo-ch%C4%83m-da-d%E1%BA%A7u-m%E1%BB%A5n-cho-nam-Men-Stay-Simplicity-Acne-Relief-Skincare-Trio-gi%E1%BA%A3m-m%E1%BB%A5n-an-to%C3%A0n-i.118768792.11535989197',
      comboImg:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj1l607uzbpj4c.webp',
      products: [
        {
          name: 'Men Stay Simplicity Facial Cleanser',
          role: 'Cleanser',
          price: 153000,
          url: 'https://shopee.vn/S%E1%BB%AFa-r%E1%BB%ADa-m%E1%BA%B7t-cho-nam-s%E1%BA%A1ch-d%E1%BA%A7u-nh%E1%BB%9Dn-ng%E1%BB%ABa-m%E1%BB%A5n-Men-Stay-Simplicity-Facial-Cleanser-100g-i.118768792.1853741392',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjo0cneke41v97@resize_w900_nl.webp',
        },
        {
          name: 'Men Stay Simplicity Calm Skin Relief Facial Serum',
          role: 'Serum',
          price: 102000,
          url: 'https://shopee.vn/Serum-gi%E1%BA%A3m-m%E1%BB%A5n-l%C3%A0m-d%E1%BB%8Bu-da-cho-nam-Men-Stay-Simplicity-Calm-Skin-Relief-Facial-Serum-10ml-30ml-i.118768792.5142070330',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjo0gwmvhh4z02.webp',
        },
        {
          name: 'Men Stay Simplicity Facial Moisturizer 5-in-1',
          role: 'Moisturizer',
          price: 229000,
          url: 'https://shopee.vn/Kem-d%C6%B0%E1%BB%A1ng-%E1%BA%A9m-cho-nam-%C4%91a-n%C4%83ng-ki%E1%BB%83m-so%C3%A1t-d%E1%BA%A7u-nh%E1%BB%9Dn-5-in-1-Men-Stay-Simplicity-Facial-Moisturizer-80g-i.118768792.1853722073',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjk5179c5m9t83.webp',
        },
      ],
    },
    {
      skinType: 'Oily',
      comboName: 'Centella Asiatica Oily Acne Care Skincare Set',
      comboPrice: 1150000,
      comboUrl:
        'https://shopee.vn/B%E1%BB%99-Ch%C4%83m-S%C3%B3c-Da-D%E1%BA%A7u-M%E1%BB%A5n-Rau-M%C3%A1-Chuy%C3%AAn-S%C3%A2u-C%E1%BB%8F-M%E1%BB%81m-i.134371556.20652109356',
      comboImg:
        'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjpdfvn733lued.webp',
      products: [
        {
          name: 'Centella Micellar Cleansing Water',
          role: 'Cleanser',
          price: 140000,
          url: 'https://shopee.vn/N%C6%B0%E1%BB%9Bc-T%E1%BA%A9y-Trang-Rau-M%C3%A1-D%C3%A0nh-Cho-Da-D%E1%BA%A7u-M%E1%BB%A5n-Nh%E1%BA%A1y-C%E1%BA%A3m-Lo%E1%BA%A1i-B%E1%BB%8F-D%E1%BA%A7u-Nh%E1%BB%9Dn-L%E1%BB%9Bp-Trang-%C4%90i%E1%BB%83m-C%E1%BB%8F-M%E1%BB%81m-150ml-i.134371556.28481906576',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lwie1e35t8m34a@resize_w900_nl.webp',
        },
        {
          name: 'Centella Foaming Facial Cleanser',
          role: 'Cleanser',
          price: 120000,
          url: 'https://shopee.vn/S%E1%BB%AFa-R%E1%BB%ADa-M%E1%BA%B7t-T%E1%BA%A1o-B%E1%BB%8Dt-Cho-Da-D%E1%BA%A7u-M%E1%BB%A5n-M%E1%BB%81m-M%E1%BB%8Bn-L%C3%A0m-S%E1%BA%A1ch-S%C3%A2u-Rau-M%C3%A1-C%E1%BB%8F-M%E1%BB%81m-150ml-i.134371556.28114336061',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m1h1aoscu82baa.webp',
        },
        {
          name: 'Centella Active Hydrating Toner',
          role: 'Toner',
          price: 240000,
          url: 'https://shopee.vn/Active-Toner-D%C6%B0%E1%BB%A1ng-%E1%BA%A8m-Ng%E1%BB%ABa-M%E1%BB%A5n-Rau-M%C3%A1-D%C3%A0nh-Cho-Da-M%E1%BB%A5n-Da-D%E1%BA%A7u-Nh%E1%BA%A1y-C%E1%BA%A3m-C%E1%BB%8F-M%E1%BB%81m-150ml-i.134371556.18852122597',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lwie1e35dsk954.webp',
        },
        {
          name: 'Centella Oil Control Facial Moisturizer',
          role: 'Moisturizer',
          price: 355000,
          url: 'https://shopee.vn/Kem-D%C6%B0%E1%BB%A1ng-%E1%BA%A8m-Da-M%E1%BA%B7t-Ki%E1%BB%81m-D%E1%BA%A7u-Ng%E1%BB%ABa-M%E1%BB%A5n-Chi%E1%BA%BFt-Xu%E1%BA%A5t-Rau-M%C3%A1-Cho-Da-D%E1%BA%A7u-Nh%E1%BA%A1y-C%E1%BA%A3m-C%E1%BB%8F-M%E1%BB%81m-50g-i.134371556.18452057440',
          img: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mha0hh4w47pma0.webp',
        },
      ],
    },
  ];

  for (const comboData of data) {
    const productIds: string[] = [];

    // Create or update products
    for (const p of comboData.products) {
      const existing = await prisma.affiliate_products.findFirst({
        where: { name: p.name },
      });

      let product;

      if (existing) {
        product = await prisma.affiliate_products.update({
          where: { id: existing.id },
          data: {
            display_price: p.price,
            affiliate_url: p.url,
            image_url: p.img,
            usage_role: p.role,
          },
        });
      } else {
        product = await prisma.affiliate_products.create({
          data: {
            name: p.name,
            usage_role: p.role,
            display_price: p.price,
            affiliate_url: p.url,
            image_url: p.img,
          },
        });
      }

      productIds.push(product.id);
    }

    // Create combo with linked products
    await prisma.skincare_combos.create({
      data: {
        skin_type_id: getSkinTypeId(comboData.skinType),
        combo_name: comboData.comboName,
        display_price: comboData.comboPrice,
        affiliate_url: comboData.comboUrl,
        image_url: comboData.comboImg,
        combo_products: {
          create: productIds.map((pid, index) => ({
            product_id: pid,
            step_order: index + 1,
          })),
        },
      },
    });
  }
}
