import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CONFIG } from '../common/config';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async cadastro(dto: SignupDto) {
    const existente = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existente) {
      throw new ConflictException('Email já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, CONFIG.bcrypt.saltRounds);

    const usuario = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: senhaHash,
        name: dto.nome,
        role: 'STUDENT',
        university: dto.universidade,
        period: dto.periodo,
      },
    });

    this.emailService.sendWelcome(dto.email, dto.nome ?? 'Estudante').catch(() => {});

    return this.gerarToken(usuario.id, usuario.email, usuario.role);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!usuario) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (!usuario.passwordHash) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.passwordHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    return this.gerarToken(usuario.id, usuario.email, usuario.role);
  }

  async perfil(usuarioId: string) {
    const usuario = await this.prisma.user.findUnique({
      where: { id: usuarioId },
      select: { id: true, email: true, name: true, role: true, university: true, period: true, createdAt: true },
    });
    return usuario;
  }

  async esqueceuSenha(email: string) {
    const usuario = await this.prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      return { mensagem: 'Se o email existir, você receberá um link de recuperação.' };
    }

    const resetToken = this.jwtService.sign(
      { sub: usuario.id, email: usuario.email, tipo: 'reset_senha' },
      { expiresIn: '1h' },
    );

    await this.emailService.sendPasswordReset(email, resetToken).catch(() => {});

    return { mensagem: 'Se o email existir, você receberá um link de recuperação.' };
  }

  async recuperarSenha(token: string, novaSenha: string) {
    try {
      const payload = this.jwtService.verify(token) as { sub: string; tipo: string };
      if (payload.tipo !== 'reset_senha') {
        throw new UnauthorizedException('Token inválido');
      }

      const senhaHash = await bcrypt.hash(novaSenha, CONFIG.bcrypt.saltRounds);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash: senhaHash },
      });

      return { mensagem: 'Senha redefinida com sucesso' };
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private gerarToken(usuarioId: string, email: string, role: string) {
    const payload = { sub: usuarioId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: { id: usuarioId, email, role },
    };
  }
}
