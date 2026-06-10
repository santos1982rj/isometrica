import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, MinLength, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDifficulty, BloomLevel } from '../../generated/prisma/enums';

class AlternativeDto {
  @IsString()
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class CreateQuestionDto {
  @IsString()
  @MinLength(1)
  text!: string;

  @IsString()
  topicId!: string;

  @IsEnum(QuestionDifficulty)
  difficulty!: QuestionDifficulty;

  @IsEnum(BloomLevel)
  @IsOptional()
  bloomLevel?: BloomLevel;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativeDto)
  alternatives!: AlternativeDto[];
}
