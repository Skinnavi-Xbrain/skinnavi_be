import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Order } from '@Constant/enums';

@Injectable()
export class CombosService {
  constructor(private prisma: PrismaService) {}

  async getCombos(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.skincare_combos.findMany({
        skip,
        take: limit,
        include: {
          skin_type: true,
          combo_products: {
            include: {
              product: true,
            },
            orderBy: { step_order: Order.ASC },
          },
        },
        orderBy: { created_at: Order.DESC },
      }),
      this.prisma.skincare_combos.count(),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  async getComboDetail(id: string) {
    const combo = await this.prisma.skincare_combos.findUnique({
      where: { id },
      include: {
        combo_products: {
          include: {
            product: true,
          },
          orderBy: { step_order: Order.ASC },
        },
      },
    });

    if (!combo) {
      throw new NotFoundException('Combo not found');
    }

    return combo;
  }

  async createCombo(data: {
    skin_type_id: string;
    combo_name: string;
    display_price?: number;
    affiliate_url: string;
    image_url?: string;
    is_active?: boolean;
    products: {
      product_id: string;
      step_order: number;
    }[];
  }) {
    const stepSet = new Set(data.products.map((p) => p.step_order));
    if (stepSet.size !== data.products.length) {
      throw new Error('Duplicate step_order detected');
    }

    return this.prisma.skincare_combos.create({
      data: {
        skin_type_id: data.skin_type_id,
        combo_name: data.combo_name,
        display_price: data.display_price,
        affiliate_url: data.affiliate_url,
        image_url: data.image_url,
        is_active: data.is_active ?? true,

        combo_products: {
          create: data.products.map((p) => ({
            product_id: p.product_id,
            step_order: p.step_order,
          })),
        },
      },
      include: {
        combo_products: {
          include: { product: true },
          orderBy: { step_order: Order.ASC },
        },
      },
    });
  }

  async updateCombo(
    id: string,
    data: {
      skin_type_id?: string;
      combo_name?: string;
      display_price?: number;
      affiliate_url?: string;
      image_url?: string;
      is_active?: boolean;
      products?: {
        product_id: string;
        step_order: number;
      }[];
    },
  ) {
    const existing = await this.prisma.skincare_combos.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Combo not found');
    }

    if (data.products) {
      const stepSet = new Set(data.products.map((p) => p.step_order));
      if (stepSet.size !== data.products.length) {
        throw new Error('Duplicate step_order detected');
      }
    }

    return this.prisma.skincare_combos.update({
      where: { id },
      data: {
        skin_type_id: data.skin_type_id,
        combo_name: data.combo_name,
        display_price: data.display_price,
        affiliate_url: data.affiliate_url,
        image_url: data.image_url,
        is_active: data.is_active,

        ...(data.products && {
          combo_products: {
            deleteMany: {
              combo_id: id,
            },
            create: data.products.map((p) => ({
              product_id: p.product_id,
              step_order: p.step_order,
            })),
          },
        }),
      },
      include: {
        combo_products: {
          include: { product: true },
          orderBy: { step_order: Order.ASC },
        },
      },
    });
  }

  async deleteCombo(id: string) {
    const existing = await this.prisma.skincare_combos.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Combo not found');
    }

    await this.prisma.combo_products.deleteMany({
      where: { combo_id: id },
    });

    return this.prisma.skincare_combos.delete({
      where: { id },
    });
  }
}
