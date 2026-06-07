import { IsString, MinLength } from 'class-validator';

export class RecuperarSenhaDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(6)
  novaSenha!: string;
}
