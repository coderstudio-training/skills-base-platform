import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EmailDto {
  @ApiProperty({
    description: 'Name of the workflow that triggered the notification',
    example: 'data-sync-workflow',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  workflowName: string;
}
