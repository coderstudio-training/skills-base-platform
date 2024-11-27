import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@skills-base/shared';

export class EmployeeSearchDto extends PaginationDto {
  @ApiProperty({
    description: 'Search term to filter employees by name or email',
    required: true,
    example: 'john',
  })
  searchTerm!: string;

  @ApiProperty({
    description: 'Filter employees by business unit',
    required: false,
    example: 'Engineering',
  })
  businessUnit?: string;
}
