import { IsEmail, IsString, MinLength, IsOptional, Min } from 'class-validator';

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

}
