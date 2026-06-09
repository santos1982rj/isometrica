import { IsString, IsOptional } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateTopicDto {
  @IsString()
  name!: string;

  @IsString()
  subjectId!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
