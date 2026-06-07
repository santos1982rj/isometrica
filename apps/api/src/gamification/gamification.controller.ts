import { Controller, Get, Param, Post } from '@nestjs/common';
import { GamificationService } from './gamification.service';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('profile/:userId')
  getProfile(@Param('userId') userId: string) {
    return this.gamificationService.getProfile(userId);
  }

  @Post('profile/:userId/xp/:amount')
  addXp(@Param('userId') userId: string, @Param('amount') amount: string) {
    return this.gamificationService.addXp(userId, parseInt(amount, 10));
  }
}
