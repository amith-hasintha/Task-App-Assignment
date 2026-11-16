import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    let databaseStatus = 'connected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = 'disconnected';
    }

    return {
      status: 'ok',
      database: databaseStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
