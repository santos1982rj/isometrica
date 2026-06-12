import { IsString, IsOptional, IsInt } from 'class-validator';

export class StartSimuladoDto {
  @IsString()
  examId!: string;
}
