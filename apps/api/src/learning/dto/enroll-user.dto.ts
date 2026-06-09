import { IsString } from 'class-validator';

export class EnrollUserDto {
  @IsString()
  userId!: string;

  @IsString()
  courseId!: string;
}
