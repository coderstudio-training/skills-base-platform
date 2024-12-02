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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Bulk upsert taxonomy records for a specific business unit',
  })
  @ApiResponse({
    status: 201,
    description: 'Taxonomy records upserted successfully',
    schema: {
      type: 'object',
      properties: {
        updatedCount: { type: 'number', example: 1 },
        errors: { type: 'array', example: [] },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
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
  @ApiOperation({
    summary: 'Bulk upsert soft skill taxonomy records',
  })
  @ApiResponse({
    status: 201,
    description: 'Taxonomy records upserted successfully',
    schema: {
      type: 'object',
      properties: {
        updatedCount: { type: 'number', example: 1 },
        errors: { type: 'array', example: [] },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async bulkUpsertSoft(@Body() dto: BulkUpsertSTaxonomyDTO) {
    this.logger.log(
      '[SOFT TAXONOMY DTO RECEIVED]',
      JSON.stringify(dto, null, 2),
    );
    return this.taxonomyService.bulkUpsertSoft(dto);
  }

  // Find all Technical Taxonomy
  @Get('technical')
  @ApiOperation({ summary: 'Get all taxonomy records by business unit' })
  @ApiQuery({
    name: 'businessUnit',
    required: true,
    description: 'taxonomy is grouped by business unit',
    example: 'TESTING',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all taxonomy records within the business unit',
    example: [
      {
        _id: '672bbf7e3df9b0d50f973aea',
        docId: 'TEST_FOO',
        __v: 0,
        abilities: {
          'Level 1': [''],
        },
        category: 'Tests',
        createdAt: '2024-11-06T19:11:58.140Z',
        description: 'Preparing to test your imagination',
        docRevisionId: 'FOOBAR',
        docTitle: 'TEST_BAR',
        knowledge: {
          'Level 1': [''],
        },
        proficiencyDescription: {
          'Level 1': ['N/A', 'N/A'],
        },
        rangeOfApplication: [''],
        title: 'TEST_BAR',
        updatedAt: '2024-11-06T19:11:58.141Z',
      },
      {
        _id: '67395bfe3df9b0d50f09a2ee',
        docId: 'testin',
        __v: 0,
        abilities: {
          'level 1': ['testin'],
        },
        category: 'test',
        createdAt: '2024-11-17T02:59:10.229Z',
        description: 'lorem ipsum dolor',
        docRevisionId: 'testin',
        docTitle: 'testin',
        knowledge: {
          'level 1': ['test bot'],
        },
        proficiencyDescription: {
          'level 1': ['testin'],
        },
        rangeOfApplication: ['testing application'],
        title: 'testin',
        updatedAt: '2024-11-17T02:59:10.229Z',
      },
    ],
  })
  @ApiResponse({
    status: 400,
    description: 'Business unit is required',
  })
  async findAllTechnical(@Query('businessUnit') businessUnit: string) {
    if (!businessUnit) {
      throw new Error('Business unit is required to find technical records.');
    }
    return this.taxonomyService.findAllTechnical(businessUnit);
  }

  // Find all Soft Taxonomy
  @Get('soft')
  @ApiOperation({
    summary: 'Get all soft skills taxonomy',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all soft skill taxonomy records',
    example: [],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async findAllSoft() {
    return this.taxonomyService.findAllSoft();
  }

  // Find Technical Taxonomy by docId
  @Get('technical/:docId')
  @ApiOperation({
    summary: 'Get a taxonomy record by document ID & business unit',
  })
  @ApiQuery({
    name: 'businessUnit',
    required: true,
    description: 'taxonomy is grouped by business unit',
    example: 'QA',
  })
  @ApiParam({
    name: 'docId',
    description: 'Document ID of the taxonomy record',
    example: 'TEST_FOO',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the taxonomy record',
    example: {
      _id: '672bbf7e3df9b0d50f973aea',
      docId: 'TEST_FOO',
      __v: 0,
      abilities: {
        'Level 1': [''],
      },
      category: 'Tests',
      createdAt: '2024-11-06T19:11:58.140Z',
      description: 'Preparing to test your imagination',
      docRevisionId: 'FOOBAR',
      docTitle: 'TEST_BAR',
      knowledge: {
        'Level 1': [''],
      },
      proficiencyDescription: {
        'Level 1': ['N/A', 'N/A'],
      },
      rangeOfApplication: [''],
      title: 'TEST_BAR',
      updatedAt: '2024-11-06T19:11:58.141Z',
    },
  })
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
  @ApiOperation({
    summary: 'Get soft skill taxonomy by document ID',
  })
  @ApiParam({
    name: 'docId',
    description: 'Document ID of the soft skill taxonomy record',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a soft skill taxonomy record',
    example: {},
  })
  @Get('soft/:docId')
  async findOneSoft(@Param('docId') docId: string) {
    return this.taxonomyService.findSoftById(docId);
  }

  // Find Technical Taxonomy by title
  @Get('technical/title/:title')
  @ApiOperation({
    summary: 'Get all taxonomy records by title inclusion & business unit',
  })
  @ApiQuery({
    name: 'businessUnit',
    required: true,
    description: 'taxonomy is grouped by busines unit',
    example: 'TESTING',
  })
  @ApiParam({
    name: 'title',
    description: 'Title of the taxonomy record',
    example: 'TEST',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns matching taxonomy records',
    example: [
      {
        _id: '672bbf7e3df9b0d50f973aea',
        docId: 'TEST_FOO',
        __v: 0,
        abilities: {
          'Level 1': [''],
        },
        category: 'Tests',
        createdAt: '2024-11-06T19:11:58.140Z',
        description: 'Preparing to test your imagination',
        docRevisionId: 'FOOBAR',
        docTitle: 'TEST_BAR',
        knowledge: {
          'Level 1': [''],
        },
        proficiencyDescription: {
          'Level 1': ['N/A', 'N/A'],
        },
        rangeOfApplication: [''],
        title: 'TEST_BAR',
        updatedAt: '2024-11-06T19:11:58.141Z',
      },
      {
        _id: '67395bfe3df9b0d50f09a2ee',
        docId: 'testin',
        __v: 0,
        abilities: {
          'level 1': ['testin'],
        },
        category: 'test',
        createdAt: '2024-11-17T02:59:10.229Z',
        description: 'lorem ipsum dolor',
        docRevisionId: 'testin',
        docTitle: 'testin',
        knowledge: {
          'level 1': ['test bot'],
        },
        proficiencyDescription: {
          'level 1': ['testin'],
        },
        rangeOfApplication: ['testing application'],
        title: 'testin',
        updatedAt: '2024-11-17T02:59:10.229Z',
      },
    ],
  })
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
  @ApiOperation({
    summary: 'Get all matching title for soft skills taxonomy',
  })
  @ApiParam({
    name: 'title',
    description: 'Title of the soft skill taxonomy record',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns matching taxonomy records',
    example: [],
  })
  async findByTitleSoft(@Param('title') title: string) {
    return this.taxonomyService.findSoftByTitle(title);
  }
}
