import { IsString, IsIn, IsOptional, IsObject } from 'class-validator';
import { EventType } from '../../generated/prisma/enums';

export class TrackEventDto {
  @IsString()
  userId!: string;

  @IsString()
  @IsIn(Object.values(EventType))
  type!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
