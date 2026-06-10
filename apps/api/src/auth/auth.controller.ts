import { Body, Controller, Get, Post, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { EsqueceuSenhaDto } from './dto/esqueceu-senha.dto';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('cadastro')
  async cadastro(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.cadastro(dto);
    res.cookie('token', result.access_token, COOKIE_OPTIONS);
    return result;
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie('token', result.access_token, COOKIE_OPTIONS);
    return result;
  }

  @Public()
  @Post('esqueceu-senha')
  esqueceuSenha(@Body() dto: EsqueceuSenhaDto) {
    return this.authService.esqueceuSenha(dto.email);
  }

  @Public()
  @Post('recuperar-senha')
  recuperarSenha(@Body() dto: RecuperarSenhaDto) {
    return this.authService.recuperarSenha(dto.token, dto.novaSenha);
  }

  @Get('perfil')
  perfil(@CurrentUser('id') usuarioId: string) {
    return this.authService.perfil(usuarioId);
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', { path: '/' });
    return { mensagem: 'Sessão encerrada' };
  }
}
