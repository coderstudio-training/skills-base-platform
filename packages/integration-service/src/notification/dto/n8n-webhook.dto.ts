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
  @IsString()
  id: string = 'No Workflow ID';

  @IsString()
  name: string = 'No Workflow Name';
}

export class ExecutionDto {
  @IsString()
  id: string = 'No Execution ID';

  @IsEnum(['success', 'error', 'running'])
  status?: 'success' | 'error' | 'running';

  @IsDate()
  @Type(() => Date)
  startedAt: Date = new Date();

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  finishedAt?: Date;
}

export class DataDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  recordsProcessed?: number;
}

export class N8nWebhookDto {
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
