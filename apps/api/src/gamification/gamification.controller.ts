import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('profile/:userId')
  getProfile(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    const targetUserId = role === UserRole.ADMIN ? userId : currentUserId;
    return this.gamificationService.getProfile(targetUserId);
  }

  @Post('profile/:userId/xp/:amount')
  @Roles(UserRole.ADMIN)
  addXp(@Param('userId') userId: string, @Param('amount') amount: string) {
    return this.gamificationService.addXp(userId, parseInt(amount, 10));
  }

  @Post('profile/:userId/streak')
  updateStreak(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string, @CurrentUser('papel') role: UserRole) {
    const targetUserId = role === UserRole.ADMIN ? userId : currentUserId;
    return this.gamificationService.updateStreak(targetUserId);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.gamificationService.getLeaderboard(limit ? parseInt(limit, 10) : 10);
  }
}
