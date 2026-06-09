import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  universidade?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  periodo?: number;
}
