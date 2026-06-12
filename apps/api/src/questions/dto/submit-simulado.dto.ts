import { IsArray, IsString, IsOptional, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsString()
  questionId!: string;

  @IsString()
  @IsOptional()
  selectedId!: string | null;

  @IsInt()
  @IsOptional()
  timeSpent!: number;
}

export class SubmitSimuladoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];
}
