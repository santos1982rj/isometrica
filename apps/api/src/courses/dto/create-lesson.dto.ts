import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  title!: string;

  @IsString()
  type!: string;

  @IsNumber()
  @Min(0)
  order!: number;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsBoolean()
  @IsOptional()
  free?: boolean;
}
