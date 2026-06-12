import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class MarkProgressDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  lessonId!: string;

  @IsBoolean()
  completed!: boolean;
}
