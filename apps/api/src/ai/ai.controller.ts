import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('conversations')
  createConversation(@Body() body: { userId: string; title?: string }) {
    return this.aiService.createConversation(body.userId, body.title);
  }

  @Post('conversations/:id/messages')
  addMessage(@Param('id') id: string, @Body() body: { role: string; content: string }) {
    return this.aiService.addMessage({ conversationId: id, ...body });
  }

  @Get('conversations/:id')
  getConversation(@Param('id') id: string) {
    return this.aiService.getConversation(id);
  }

  @Get('conversations/user/:userId')
  getUserConversations(@Param('userId') userId: string) {
    return this.aiService.getUserConversations(userId);
  }

  @Post('recommendations')
  createRecommendation(@Body() body: { userId: string; title: string; type: string; description?: string; link?: string }) {
    return this.aiService.createRecommendation(body);
  }

  @Get('recommendations/:userId')
  getUserRecommendations(@Param('userId') userId: string) {
    return this.aiService.getUserRecommendations(userId);
  }
}
