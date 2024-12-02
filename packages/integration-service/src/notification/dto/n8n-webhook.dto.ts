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
  @ApiProperty({ description: 'The unique identifier of the workflow' })
  @IsString()
  id: string = 'No Workflow ID';

  @ApiProperty({ description: 'The name of the workflow' })
  @IsString()
  name: string = 'No Workflow Name';
}

export class ExecutionDto {
  @ApiProperty({ description: 'The unique identifier of the execution' })
  @IsString()
  id: string = 'No Execution ID';

  @ApiPropertyOptional({
    enum: ['success', 'error', 'running'],
    description: 'The current status of the execution',
  })
  @IsEnum(['success', 'error', 'running'])
  status?: 'success' | 'error' | 'running';

  @ApiProperty({ description: 'The timestamp when execution started' })
  @IsDate()
  @Type(() => Date)
  startedAt: Date = new Date();

  @ApiPropertyOptional({ description: 'The timestamp when execution finished' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  finishedAt?: Date;
}

export class DataDto {
  @ApiPropertyOptional({
    description: 'Number of records processed in this execution',
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  recordsProcessed?: number;
}

export class N8nWebhookDto {
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
