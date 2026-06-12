import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class UpdateExamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  board?: string;

  @IsInt()
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  organization?: string;

  @IsInt()
  @IsOptional()
  timeLimit?: number;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  questionIds?: string[];
}
