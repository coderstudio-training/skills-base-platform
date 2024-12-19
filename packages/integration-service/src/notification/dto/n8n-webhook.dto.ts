import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class WorkflowDto {
  @ApiProperty({
    description: 'The unique identifier of the workflow',
    example: '123',
    required: true,
  })
  @IsString()
  id: string = 'No Workflow ID';

  @ApiProperty({
    description: 'The name of the workflow',
    example: 'Data Sync Workflow',
    required: true,
  })
  @IsString()
  name: string = 'No Workflow Name';
}

export class ExecutionDto {
  @ApiProperty({
    description: 'The unique identifier of the execution',
    example: 'exec_456',
    required: true,
  })
  @IsString()
  id: string = 'No Execution ID';

  @ApiPropertyOptional({
    enum: ['success', 'error', 'running'],
    description: 'The current status of the execution',
    example: 'success',
    required: false,
  })
  @IsEnum(['success', 'error', 'running'])
  status?: 'success' | 'error' | 'running';

  @ApiProperty({
    description: 'The timestamp when execution started',
    example: '2024-12-13T04:32:49Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  startedAt: Date = new Date();

  @ApiPropertyOptional({
    description: 'The timestamp when execution finished',
    example: '2024-12-13T04:33:49Z',
    type: Date,
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  finishedAt?: Date;
}

export class DataDto {
  @ApiPropertyOptional({
    description: 'Number of records processed in this execution',
    example: 42,
    type: Number,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  recordsProcessed?: number;
}

export class N8nWebhookDto {
  @ApiProperty({
    type: WorkflowDto,
    description: 'Workflow information',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WorkflowDto)
  workflow?: WorkflowDto;

  @ApiProperty({
    type: ExecutionDto,
    description: 'Execution details and status',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ExecutionDto)
  execution?: ExecutionDto;

  @ApiPropertyOptional({
    type: DataDto,
    description: 'Additional execution data',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DataDto)
  @IsOptional()
  data?: DataDto;
}
