import { IsString, IsBoolean } from 'class-validator';

export class MarkProgressDto {
  @IsString()
  userId!: string;

  @IsString()
  lessonId!: string;

  @IsBoolean()
  completed!: boolean;
}
