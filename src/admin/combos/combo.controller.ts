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
import { CombosService } from './combo.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('admin/combos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class CombosController {
  constructor(private readonly service: CombosService) {}

  @Get()
  getCombos(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.getCombos(Number(page), Number(limit));
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.service.getComboDetail(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.createCombo(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.updateCombo(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteCombo(id);
  }
}
