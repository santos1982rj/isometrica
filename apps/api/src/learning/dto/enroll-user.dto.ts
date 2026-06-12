import { IsOptional, IsString } from 'class-validator';

export class EnrollUserDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  courseId!: string;
}
