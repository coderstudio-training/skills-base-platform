import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  JwtAuthGuard,
  LoggingInterceptor,
  Roles,
  RolesGuard,
  TransformInterceptor,
  UserRole,
} from '@skills-base/shared';
import {
  BulkUpsertSTaxonomyDTO,
  BulkUpsertTTaxonomyDTO,
} from './dto/taxonomy.dto';
import { TaxonomyService } from './taxonomy.service';

@ApiTags('Taxonomy')
@ApiBearerAuth('JWT-Admin')
@Controller('taxonomy')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class TaxonomyController {
  private readonly logger = new Logger(TaxonomyController.name);

  constructor(private readonly taxonomyService: TaxonomyService) {}

  // Bulk Upsert for Technical Taxonomy
  @Post('technical/bulk-upsert')
  @Roles(UserRole.ADMIN)
  async bulkUpsertTechnical(@Body() dto: BulkUpsertTTaxonomyDTO) {
    this.logger.log(
      '[TECHNICAL TAXONOMY DTO RECEIVED]',
      JSON.stringify(dto, null, 2),
    );
    return this.taxonomyService.bulkUpsertTechnical(dto);
  }

  // Bulk Upsert for Soft Taxonomy
  @Post('soft/bulk-upsert')
  @Roles(UserRole.ADMIN)
  async bulkUpsertSoft(@Body() dto: BulkUpsertSTaxonomyDTO) {
    this.logger.log(
      '[SOFT TAXONOMY DTO RECEIVED]',
      JSON.stringify(dto, null, 2),
    );
    return this.taxonomyService.bulkUpsertSoft(dto);
  }

  // Find all Technical Taxonomy
  @Get('technical')
  async findAllTechnical(@Query('businessUnit') businessUnit: string) {
    if (!businessUnit) {
      throw new Error('Business unit is required to find technical records.');
    }
    return this.taxonomyService.findAllTechnical(businessUnit);
  }

  // Find all Soft Taxonomy
  @Get('soft')
  async findAllSoft() {
    return this.taxonomyService.findAllSoft();
  }

  // Find Technical Taxonomy by docId
  @Get('technical/:docId')
  async findOneTechnical(
    @Param('docId') docId: string,
    @Query('businessUnit') businessUnit: string,
  ) {
    if (!businessUnit) {
      throw new Error(
        'Business unit is required to find the technical document.',
      );
    }
    return this.taxonomyService.findTechnicalByDocId(docId, businessUnit);
  }

  // Find Soft Taxonomy by docId
  @Get('soft/:docId')
  async findOneSoft(@Param('docId') docId: string) {
    return this.taxonomyService.findSoftById(docId);
  }

  // Find Technical Taxonomy by title
  @Get('technical/title/:title')
  async findByTitleTechnical(
    @Param('title') title: string,
    @Query('businessUnit') businessUnit: string,
  ) {
    if (!businessUnit) {
      throw new Error(
        'Business unit is required to find technical records by title.',
      );
    }
    return this.taxonomyService.findTechnicalByTitle(
      new RegExp(title, 'i'),
      businessUnit,
    );
  }

  // Find Soft Taxonomy by title
  @Get('soft/title/:title')
  async findByTitleSoft(@Param('title') title: string) {
    return this.taxonomyService.findSoftByTitle(title);
  }
}
