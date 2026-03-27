import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CombosService {
  constructor(private prisma: PrismaService) {}

  async findRecommendedCombos(comboIds: string[]) {
    return this.prisma.skincare_combos.findMany({
      where: {
        id: { in: comboIds },
        is_active: true,
      },
      include: {
        combo_products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image_url: true,
                display_price: true,
                affiliate_url: true,
                usage_role: true,
              },
            },
          },
        },
      },
    });
  }

  async findProductsInCombos(comboIds: string[]) {
    const combos = await this.prisma.skincare_combos.findMany({
      where: {
        id: { in: comboIds },
        is_active: true,
      },
      include: {
        combo_products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image_url: true,
                affiliate_url: true,
                display_price: true,
                usage_role: true,
              },
            },
          },
        },
      },
    });

    const allProducts = combos.flatMap((combo) =>
      combo.combo_products.map((cp) => cp.product),
    );

    const uniqueProducts = Array.from(
      new Map(allProducts.map((p) => [p.id, p])).values(),
    );

    return uniqueProducts;
  }
}
