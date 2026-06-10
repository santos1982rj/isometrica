import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  university?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  period?: number;

  @IsString()
  @IsOptional()
  lattes?: string;

  @IsString()
  @IsOptional()
  linkedin?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  twitter?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
