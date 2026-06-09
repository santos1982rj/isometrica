import { IsString, IsOptional, IsNumber, IsBoolean, IsUrl, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  estimatedHours?: number;

  @IsString()
  @IsOptional()
  level?: string;

  @IsBoolean()
  @IsOptional()
  premium?: boolean;

  @IsBoolean()
  @IsOptional()
  certificateEnabled?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
