import { IsString, MinLength } from 'class-validator';

export class SaveNoteDto {
  @IsString()
  userId!: string;

  @IsString()
  lessonId!: string;

  @IsString()
  @MinLength(1)
  notes!: string;
}
