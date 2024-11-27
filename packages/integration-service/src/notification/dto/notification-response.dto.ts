import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DataDto, ExecutionDto, WorkflowDto } from './n8n-webhook.dto';

export class NotificationResponseDto {
  @ApiProperty({ description: 'The unique identifier of the notification' })
  @IsString()
  _id!: string;

  @ApiProperty({ type: WorkflowDto })
  @IsObject()
  @ValidateNested()
  @Type(() => WorkflowDto)
  workflow?: WorkflowDto;

  @ApiProperty({ type: ExecutionDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ExecutionDto)
  execution?: ExecutionDto;

  @ApiPropertyOptional({ type: DataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DataDto)
  @IsOptional()
  data?: DataDto;
}
