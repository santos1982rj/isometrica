import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { EsqueceuSenhaDto } from './dto/esqueceu-senha.dto';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('cadastro')
  cadastro(@Body() dto: SignupDto) {
    return this.authService.cadastro(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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
}
