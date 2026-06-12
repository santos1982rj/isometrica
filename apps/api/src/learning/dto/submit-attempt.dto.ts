import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class SubmitAttemptDto {
  @IsString()
  userId!: string;

  @IsString()
  questionId!: string;

  @IsString()
  selectedId!: string;

  @IsNumber()
  @IsOptional()
  timeSpent?: number;

  @IsBoolean()
  @IsOptional()
  hintUsed?: boolean;
}
