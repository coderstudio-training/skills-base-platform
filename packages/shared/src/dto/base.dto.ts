// src/dto/base.dto.ts
import { IsOptional, IsDate } from 'class-validator';

export class BaseDto {
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
