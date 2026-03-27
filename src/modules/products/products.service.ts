import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PageOptionsDto } from '../../common/dtos/page-options.dto';
import { Order } from '@Constant/index';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAllAffiliateProducts(pageOptionsDto: PageOptionsDto) {
    const { take, skip } = pageOptionsDto;

    const [items, total] = await Promise.all([
      this.prisma.affiliate_products.findMany({
        where: { is_active: true },
        select: {
          id: true,
          name: true,
          display_price: true,
          image_url: true,
          affiliate_url: true,
        },
        take: take,
        skip: skip,
        orderBy: { name: Order.ASC },
      }),
      this.prisma.affiliate_products.count({ where: { is_active: true } }),
    ]);

    return {
      items,
      meta: {
        total,
        page: pageOptionsDto.page,
        take: pageOptionsDto.take,
        itemCount: items.length,
        totalPages: Math.ceil(total / take),
        hasPreviousPage: pageOptionsDto.page > 1,
        hasNextPage: pageOptionsDto.page < Math.ceil(total / take),
      },
    };
  }
}
