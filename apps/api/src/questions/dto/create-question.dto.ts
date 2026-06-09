import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

class AlternativeDto {
  @IsString()
  text!: string;

  @IsString()
  isCorrect!: boolean;
}

export class CreateQuestionDto {
  @IsString()
  @MinLength(1)
  text!: string;

  @IsString()
  topicId!: string;

  @IsString()
  difficulty!: string;

  @IsString()
  @IsOptional()
  bloomLevel?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativeDto)
  alternatives!: AlternativeDto[];
}
