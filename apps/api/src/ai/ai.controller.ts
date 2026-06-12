import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
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

  @Post('conversations/:id/stream')
  async streamMessage(@Param('id') id: string, @Body() _body: { role: string; content: string }, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // User message is already saved by the frontend before calling stream
    const reply = await this.aiService.streamReply(id, res);

    if (reply) {
      await this.aiService.addMessage({ conversationId: id, role: 'assistant', content: reply });
    }

    res.end();
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
