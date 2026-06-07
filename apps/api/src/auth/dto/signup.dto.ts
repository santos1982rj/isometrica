import { IsEmail, IsString, MinLength, IsOptional, IsEnum, Min } from 'class-validator';
import { UserRole } from '../../generated/prisma/enums';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  senha!: string;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  universidade?: string;

  @IsOptional()
  @Min(1)
  periodo?: number;

  @IsEnum(UserRole)
  @IsOptional()
  papel?: UserRole;
}
