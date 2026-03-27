import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './product.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  getProducts(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.getProducts(Number(page), Number(limit));
  }
  @Get('stats/monthly')
  getStats(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.getProductStatsByMonth({ from, to });
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.service.getProductDetail(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.createProduct(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.updateProduct(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteProduct(id);
  }
}
