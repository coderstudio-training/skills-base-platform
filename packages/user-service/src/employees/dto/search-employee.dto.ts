import { PaginationDto } from '@skills-base/shared';

export class EmployeeSearchDto extends PaginationDto {
  searchTerm!: string;
}
