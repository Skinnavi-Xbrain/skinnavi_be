import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoutinesService {
  constructor(private prisma: PrismaService) {}

  async getRoutinePackages() {
    return this.prisma.routine_packages.findMany();
  }
}
