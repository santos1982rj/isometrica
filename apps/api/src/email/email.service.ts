import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend client initialized');
    } else {
      this.logger.warn('RESEND_API_KEY not configured — emails will not be sent');
    }
  }

  async sendPasswordReset(email: string, resetToken: string) {
    const appUrl = this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';
    const resetLink = `${appUrl}/recuperar-senha?token=${resetToken}`;

    if (!this.resend) {
      this.logger.log(`[MOCK] Password reset email to ${email}: ${resetLink}`);
      return { message: 'Email enviado (modo mock)' };
    }

    try {
      const result = await this.resend.emails.send({
        from: 'Isométrica <noreply@isometrica.eng.br>',
        to: email,
        subject: 'Redefina sua senha - Isométrica',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
          <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f5f7;padding:40px 16px">
              <tr><td align="center">
                <table width="480" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px;overflow:hidden">
                  <tr><td style="padding:40px 32px 8px;text-align:center">
                    <span style="font-size:24px;font-weight:800;color:#1a2e3c">Isométrica</span>
                  </td></tr>
                  <tr><td style="padding:8px 32px 24px;text-align:center">
                    <h1 style="font-size:20px;font-weight:700;color:#1a1e2c;margin:0">Redefinição de senha</h1>
                    <p style="font-size:14px;color:#6b7285;margin:12px 0 0;line-height:1.5">Recebemos uma solicitação de redefinição de senha para sua conta na Isométrica.</p>
                  </td></tr>
                  <tr><td style="padding:0 32px 32px;text-align:center">
                    <a href="${resetLink}" style="display:inline-block;background:#e85d32;color:#ffffff;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">Redefinir senha</a>
                    <p style="font-size:12px;color:#9ca3af;margin:16px 0 0;line-height:1.4">Se você não solicitou esta redefinição, ignore este email. O link expira em 1 hora.</p>
                  </td></tr>
                  <tr><td style="padding:16px 32px;background:#f9fafb;text-align:center">
                    <p style="font-size:11px;color:#9ca3af;margin:0">Isométrica — Plataforma de evolução acadêmica</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}: ${result.data?.id}`);
      return { message: 'Email enviado com sucesso' };
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${email}`, err);
      throw err;
    }
  }

  async sendWelcome(email: string, name: string) {
    if (!this.resend) {
      this.logger.log(`[MOCK] Welcome email to ${email}`);
      return { message: 'Email enviado (modo mock)' };
    }

    try {
      const result = await this.resend.emails.send({
        from: 'Isométrica <noreply@isometrica.eng.br>',
        to: email,
        subject: 'Bem-vindo à Isométrica!',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
          <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f5f7;padding:40px 16px">
              <tr><td align="center">
                <table width="480" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px;overflow:hidden">
                  <tr><td style="padding:40px 32px 8px;text-align:center">
                    <span style="font-size:24px;font-weight:800;color:#1a2e3c">Isométrica</span>
                  </td></tr>
                  <tr><td style="padding:8px 32px 24px;text-align:center">
                    <h1 style="font-size:20px;font-weight:700;color:#1a1e2c;margin:0">Bem-vindo, ${name}!</h1>
                    <p style="font-size:14px;color:#6b7285;margin:12px 0 0;line-height:1.5">Sua jornada na engenharia começa aqui. Explore cursos, pratique com exercícios e evoluia com o acompanhamento da nossa IA.</p>
                  </td></tr>
                  <tr><td style="padding:0 32px 32px;text-align:center">
                    <a href="${this.configService.get<string>('APP_URL') ?? 'http://localhost:3000'}/dashboard" style="display:inline-block;background:#e85d32;color:#ffffff;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">Começar agora</a>
                  </td></tr>
                  <tr><td style="padding:16px 32px;background:#f9fafb;text-align:center">
                    <p style="font-size:11px;color:#9ca3af;margin:0">Isométrica — Plataforma de evolução acadêmica</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
      });
      this.logger.log(`Welcome email sent to ${email}: ${result.data?.id}`);
      return { message: 'Email enviado com sucesso' };
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${email}`, err);
      throw err;
    }
  }
}
