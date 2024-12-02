import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
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
import { Request } from 'express';
import { BulkUpsertTaxonomyDTO } from './dto/taxonomy.dto';
import { TaxonomyService } from './taxonomy.service';

@ApiTags('Taxonomy')
@ApiBearerAuth('JWT-Admin')
@Controller('taxonomy')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class TaxonomyController {
  private readonly logger = new Logger(TaxonomyController.name);

  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Post('bulk-upsert')
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
  async bulkUpsert(@Body() dto: BulkUpsertTaxonomyDTO) {
    this.logger.log('[DTO RECEIVED] ', JSON.stringify(dto, null, 2));
    return this.taxonomyService.bulkUpsert(dto);
  }

  @Get()
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
  async findAll(@Req() req: Request) {
    const businessUnit = req.query.businessUnit as string;
    if (!businessUnit) {
      throw new Error('Business unit is required to find records.');
    }
    return this.taxonomyService.findAll(businessUnit);
  }

  @Get(':docId')
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
    example: '1FpwF_0S9w7RuZlpkFPK4f0rNIRSfAzGu5eqj38ME5NA',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the taxonomy record',
    example: {
      _id: '672bbdac3df9b0d50f970410',
      docId: '1FpwF_0S9w7RuZlpkFPK4f0rNIRSfAzGu5eqj38ME5NA',
      __v: 0,
      abilities: {
        'Level 1': [''],
        'Level 2': [
          'Identify basic tools and processes to carry out required tests',
          'Document testware, tools and resources used, in accordance to project test plan across the different product life stages',
          'Maintain link between requirements and test done using a traceability matrix',
          'Gather resources, data and tools required to implement a test plan',
        ],
        'Level 3': [
          'Determine the requirements and specifications of applications or systems to be tested',
          'Propose relevant tests for applications or systems to achieve the testing objectives',
          'Identify points across the different product life stages for optimal scheduling of tests and verification of different requirements',
          'Develop a phase test plan',
          'Assess appropriate way for executing test scripts through manual, automated or mixed',
        ],
        'Level 4': [
          'Define testing objectives, taking into account the unique requirements of the application or system to be tested',
          'Review a range of tests and select a suitable combination',
          'Design a series of systematic test procedures in alignment with the test strategy',
          'Design test plans and procedures that leverages test automation',
          'Develop a master test plan, indicating the scope, approach, resources and schedule of intended test activities',
          'Select means for executing test scripts',
          'Determine the resources, data and tools required to implement the test plan successfully',
          'Design plans for post-mortem activities and root cause analysis',
        ],
        'Level 5': [
          'Develop the overall test strategy',
          'Articulate implications of industry developments and regulatory changes on testing processes or elements that need to be tested',
          'Establish testing policies and guidelines according to internal requirements and industry regulations',
          'Define metrics and desired outcomes for testing activities, in accordance to  established standards and baselines',
        ],
        'Level 6': [''],
      },
      category: 'Development and Implementation',
      createdAt: '2024-11-06T19:04:12.901Z',
      description:
        'Develop a test strategy and systematic test procedures to verify and ensure that a product, system or technical solution meets its design specifications as well as the performance, load and volume levels set out. This includes the ability to define when different requirements will be verified across the product life stages, the tools used to perform the test, the data and/or resources needed to conduct the tests and testware in test cases, test scripts, test reports and test plans required',
      docRevisionId:
        'ALBJ4Lsl5noFE7w3ASf-g0UwA-MIWkq6YlGtY5JgP3_9MnxNzwyOAaOvZXbTDddwZRcxE57wl_-sKQK7jvQBZjt-qg',
      docTitle: 'TSC_Test Planning',
      knowledge: {
        'Level 1': [''],
        'Level 2': [
          'Basic testing tools and processes',
          'Documentation requirements of software testing',
          'Concept and usage of traceability matrix',
        ],
        'Level 3': [
          'Different types or levels of testing over product life stages',
          'Range of tests, testware and their applications',
          'Optimal scheduling times for different tests',
          'Critical components of a phase test plan',
          'Different means for executing test scripts',
        ],
        'Level 4': [
          'Testing objectives and scope',
          'Range of tests, testware and their pros, cons, applicability and compatibility',
          'Test plans and procedures regarding test automation',
          'Critical components of a master test plan',
          'Key resources, data and tools required to implement test plans',
          'Post mortem activities and root cause analysis',
        ],
        'Level 5': [
          'Principles of defining test strategy',
          'Industry regulations for product, software or system development',
          'Organization and industry standards and baselines',
          'Testing guidelines and metrics',
        ],
        'Level 6': [''],
      },
      proficiencyDescription: {
        'Level 1': ['N/A', 'N/A'],
        'Level 2': [
          'ICT-DIT-2017-1.1 ',
          'Identify and document the basic tools, testware, resources and processes to carry out required tests',
        ],
        'Level 3': [
          'ICT-DIT-3017-1.1 ',
          'Determine requirements and develop a phase test plan, identifying optimal schedules and means for executing test scripts',
        ],
        'Level 4': [
          'ICT-DIT-4017-1.2 ',
          'Define testing objectives, and design a master test plan including a series of systematic test procedures to achieve them',
        ],
        'Level 5': [
          'ICT-DIT-5017-1.1 ',
          'Develop a test strategy, and establish testing policies, guidelines and metrics according to internal and external standards',
        ],
        'Level 6': ['N/A', 'N/A'],
      },
      rangeOfApplication: [
        'Test planning may be applied but are not limited to:',
        'Stress Tests',
        'Load Tests',
        'Volume Tests',
        'Baseline Tests',
      ],
      title: 'Test Planning',
      updatedAt: '2024-11-06T19:04:12.902Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Business unit is required',
  })
  async findOne(@Param('docId') docId: string, @Req() req: Request) {
    const businessUnit = req.query.businessUnit as string;
    if (!businessUnit) {
      throw new Error('Business unit is required to find the document.');
    }
    return this.taxonomyService.findByDocId(docId, businessUnit);
  }

  @ApiOperation({
    summary: 'Get all taxonomy records by title inclusion & business unit',
  })
  @ApiQuery({
    name: 'businessUnit',
    required: true,
    description: 'taxonomy is grouped by busines unit',
    example: 'QA',
  })
  @ApiParam({
    name: 'title',
    description: 'Title of the taxonomy record',
    example: 'Test',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns matching taxonomy records',
    example: [
      {
        _id: '672bbdac3df9b0d50f970410',
        docId: '1FpwF_0S9w7RuZlpkFPK4f0rNIRSfAzGu5eqj38ME5NA',
        __v: 0,
        abilities: {
          'Level 1': [''],
          'Level 2': [
            'Identify basic tools and processes to carry out required tests',
            'Document testware, tools and resources used, in accordance to project test plan across the different product life stages',
            'Maintain link between requirements and test done using a traceability matrix',
            'Gather resources, data and tools required to implement a test plan',
          ],
          'Level 3': [
            'Determine the requirements and specifications of applications or systems to be tested',
            'Propose relevant tests for applications or systems to achieve the testing objectives',
            'Identify points across the different product life stages for optimal scheduling of tests and verification of different requirements',
            'Develop a phase test plan',
            'Assess appropriate way for executing test scripts through manual, automated or mixed',
          ],
          'Level 4': [
            'Define testing objectives, taking into account the unique requirements of the application or system to be tested',
            'Review a range of tests and select a suitable combination',
            'Design a series of systematic test procedures in alignment with the test strategy',
            'Design test plans and procedures that leverages test automation',
            'Develop a master test plan, indicating the scope, approach, resources and schedule of intended test activities',
            'Select means for executing test scripts',
            'Determine the resources, data and tools required to implement the test plan successfully',
            'Design plans for post-mortem activities and root cause analysis',
          ],
          'Level 5': [
            'Develop the overall test strategy',
            'Articulate implications of industry developments and regulatory changes on testing processes or elements that need to be tested',
            'Establish testing policies and guidelines according to internal requirements and industry regulations',
            'Define metrics and desired outcomes for testing activities, in accordance to  established standards and baselines',
          ],
          'Level 6': [''],
        },
        category: 'Development and Implementation',
        createdAt: '2024-11-06T19:04:12.901Z',
        description:
          'Develop a test strategy and systematic test procedures to verify and ensure that a product, system or technical solution meets its design specifications as well as the performance, load and volume levels set out. This includes the ability to define when different requirements will be verified across the product life stages, the tools used to perform the test, the data and/or resources needed to conduct the tests and testware in test cases, test scripts, test reports and test plans required',
        docRevisionId:
          'ALBJ4Lsl5noFE7w3ASf-g0UwA-MIWkq6YlGtY5JgP3_9MnxNzwyOAaOvZXbTDddwZRcxE57wl_-sKQK7jvQBZjt-qg',
        docTitle: 'TSC_Test Planning',
        knowledge: {
          'Level 1': [''],
          'Level 2': [
            'Basic testing tools and processes',
            'Documentation requirements of software testing',
            'Concept and usage of traceability matrix',
          ],
          'Level 3': [
            'Different types or levels of testing over product life stages',
            'Range of tests, testware and their applications',
            'Optimal scheduling times for different tests',
            'Critical components of a phase test plan',
            'Different means for executing test scripts',
          ],
          'Level 4': [
            'Testing objectives and scope',
            'Range of tests, testware and their pros, cons, applicability and compatibility',
            'Test plans and procedures regarding test automation',
            'Critical components of a master test plan',
            'Key resources, data and tools required to implement test plans',
            'Post mortem activities and root cause analysis',
          ],
          'Level 5': [
            'Principles of defining test strategy',
            'Industry regulations for product, software or system development',
            'Organization and industry standards and baselines',
            'Testing guidelines and metrics',
          ],
          'Level 6': [''],
        },
        proficiencyDescription: {
          'Level 1': ['N/A', 'N/A'],
          'Level 2': [
            'ICT-DIT-2017-1.1 ',
            'Identify and document the basic tools, testware, resources and processes to carry out required tests',
          ],
          'Level 3': [
            'ICT-DIT-3017-1.1 ',
            'Determine requirements and develop a phase test plan, identifying optimal schedules and means for executing test scripts',
          ],
          'Level 4': [
            'ICT-DIT-4017-1.2 ',
            'Define testing objectives, and design a master test plan including a series of systematic test procedures to achieve them',
          ],
          'Level 5': [
            'ICT-DIT-5017-1.1 ',
            'Develop a test strategy, and establish testing policies, guidelines and metrics according to internal and external standards',
          ],
          'Level 6': ['N/A', 'N/A'],
        },
        rangeOfApplication: [
          'Test planning may be applied but are not limited to:',
          'Stress Tests',
          'Load Tests',
          'Volume Tests',
          'Baseline Tests',
        ],
        title: 'Test Planning',
        updatedAt: '2024-11-06T19:04:12.902Z',
      },
    ],
  })
  @Get('title/:title')
  async findByTitle(@Param('title') title: string, @Req() req: Request) {
    const businessUnit = req.query.businessUnit as string;
    if (!businessUnit) {
      throw new Error('Business unit is required to find records by title.');
    }

    return this.taxonomyService.findByTitle(
      new RegExp(title, 'i'),
      businessUnit,
    );
  }
}
