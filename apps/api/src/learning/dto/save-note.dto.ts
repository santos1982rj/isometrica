import { IsOptional, IsString, MinLength } from 'class-validator';

export class SaveNoteDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  lessonId!: string;

  @IsString()
  @MinLength(1)
  notes!: string;
}
