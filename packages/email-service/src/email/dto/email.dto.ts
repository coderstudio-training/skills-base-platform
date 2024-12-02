import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EmailDto {
  @ApiProperty({
    description: 'Name of the workflow',
    example: 'data-sync-workflow',
  })
  @IsNotEmpty()
  @IsString()
  workflowName: string;
}
