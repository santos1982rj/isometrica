import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('plans')
  findAllPlans() {
    return this.financialService.findAllPlans();
  }

  @Post('subscriptions')
  subscribe(@Body() body: { userId?: string; planId: string }, @CurrentUser('id') userId: string) {
    return this.financialService.subscribe({ userId, planId: body.planId });
  }

  @Get('subscriptions/:userId')
  getUserSubscriptions(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    const targetUserId = role === UserRole.ADMIN ? userId : currentUserId;
    return this.financialService.getUserSubscriptions(targetUserId);
  }

  @Get('admin/overview')
  @Roles(UserRole.ADMIN)
  getAdminOverview() {
    return this.financialService.getAdminOverview();
  }
}
