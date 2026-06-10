import { Controller, Get, Put, Param, Body, UnauthorizedException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UpdateProfileDto } from './dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getMyProfile(@CurrentUser('id') userId: string) {
    if (!userId) throw new UnauthorizedException();
    return this.profileService.getMyProfile(userId);
  }

  @Put()
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    if (!userId) throw new UnauthorizedException();
    return this.profileService.updateProfile(userId, dto);
  }

  @Get('public/:id')
  @Public()
  getPublicProfile(@Param('id') id: string) {
    return this.profileService.getPublicProfile(id);
  }
}
