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
  @ApiProperty({
    description: 'The unique identifier of the notification',
    example: '507f1f77bcf86cd799439011',
    format: 'mongodb-objectid',
  })
  @IsString()
  _id!: string;

  @ApiProperty({
    type: WorkflowDto,
    description:
      'Information about the workflow that generated this notification',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WorkflowDto)
  workflow?: WorkflowDto;

  @ApiProperty({
    type: ExecutionDto,
    description: 'Details about the workflow execution',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ExecutionDto)
  execution?: ExecutionDto;

  @ApiPropertyOptional({
    type: DataDto,
    description: 'Additional data from the workflow execution',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DataDto)
  @IsOptional()
  data?: DataDto;
}
