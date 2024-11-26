import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DataDto, ExecutionDto, WorkflowDto } from './n8n-webhook.dto';
export class NotificationResponseDto {
  @IsString()
  _id!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => WorkflowDto)
  workflow?: WorkflowDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ExecutionDto)
  execution?: ExecutionDto;

  @IsObject()
  @ValidateNested()
  @Type(() => DataDto)
  @IsOptional()
  data?: DataDto;
}
