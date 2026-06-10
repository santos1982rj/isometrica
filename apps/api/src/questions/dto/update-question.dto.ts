import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

class AlternativeUpdateDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}

export class UpdateQuestionDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  topicId?: string;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsString()
  @IsOptional()
  bloomLevel?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativeUpdateDto)
  @IsOptional()
  alternatives?: AlternativeUpdateDto[];
}
