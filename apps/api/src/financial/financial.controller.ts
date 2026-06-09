import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('plans')
  findAllPlans() {
    return this.financialService.findAllPlans();
  }

  @Post('subscriptions')
  subscribe(@Body() body: { userId: string; planId: string }) {
    return this.financialService.subscribe(body);
  }

  @Get('subscriptions/:userId')
  getUserSubscriptions(@Param('userId') userId: string) {
    return this.financialService.getUserSubscriptions(userId);
  }

  @Get('admin/overview')
  @Roles(UserRole.ADMIN)
  getAdminOverview() {
    return this.financialService.getAdminOverview();
  }
}
