import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getProducts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.affiliate_products.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.affiliate_products.count(),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  async getProductDetail(id: string) {
    const product = await this.prisma.affiliate_products.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(data: {
    name: string;
    display_price?: number;
    affiliate_url: string;
    image_url?: string;
  }) {
    return this.prisma.affiliate_products.create({
      data,
    });
  }

  async updateProduct(
    id: string,
    data: {
      product_name?: string;
      display_price?: number;
      affiliate_url?: string;
      image_url?: string;
      usage_role?: string;
    },
  ) {
    const existing = await this.prisma.affiliate_products.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.affiliate_products.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: string) {
    const existing = await this.prisma.affiliate_products.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.combo_products.deleteMany({
      where: { product_id: id },
    });

    return this.prisma.affiliate_products.delete({
      where: { id },
    });
  }
  async getProductStatsByMonth(params?: { from?: string; to?: string }) {
    const from =
      params?.from && params.from.trim() !== ''
        ? new Date(params.from)
        : undefined;

    const to =
      params?.to && params.to.trim() !== '' ? new Date(params.to) : undefined;

    // validate
    if (from && Number.isNaN(from.getTime())) {
      throw new BadRequestException('Invalid "from" date');
    }

    if (to && Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid "to" date');
    }

    if (from && to && from > to) {
      throw new BadRequestException('"from" must be <= "to"');
    }

    const products = await this.prisma.affiliate_products.findMany({
      where: {
        ...(from || to
          ? {
              created_at: {
                ...(from && { gte: from }),
                ...(to && { lte: to }),
              },
            }
          : {}),
      },
      select: {
        id: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    const monthly: Record<string, number> = {};

    for (const p of products) {
      const month = p.created_at.toISOString().slice(0, 7);

      if (!monthly[month]) {
        monthly[month] = 0;
      }

      monthly[month]++;
    }

    const monthlyData = Object.entries(monthly)
      .map(([month, count]) => ({
        month,
        totalProducts: count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalProducts: products.length,
      monthly: monthlyData,
    };
  }
}
