import { IsNotEmpty, IsString } from 'class-validator';

export class FailEmailDto {
  @IsNotEmpty()
  @IsString()
  error: string;
  
  @IsNotEmpty()
  @IsString()
  workflowName: string;
}