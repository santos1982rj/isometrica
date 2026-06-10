import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';

export class CreateExamDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  board!: string;

  @IsString()
  @IsOptional()
  year?: string;

  @IsArray()
  @IsString({ each: true })
  questionIds!: string[];
}
