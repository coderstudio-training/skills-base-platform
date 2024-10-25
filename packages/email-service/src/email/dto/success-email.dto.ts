import { IsNotEmpty, IsString } from 'class-validator';

export class SuccessEmailDto {
  @IsNotEmpty()
  @IsString()
  workflowName: string;
}