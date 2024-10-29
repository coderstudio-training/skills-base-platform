import { Body, Controller, Get, Logger, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { BulkUpsertTaxonomyDTO } from './dto/taxonomy.dto';
import { TaxonomyService } from './taxonomy.service';

@Controller('taxonomy')
export class TaxonomyController {
  private readonly logger = new Logger(TaxonomyController.name);

  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Post('bulk-upsert')
  async bulkUpsert(@Body() dto: BulkUpsertTaxonomyDTO, @Req() req: Request) {
    return this.taxonomyService.bulkUpsert(dto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const businessUnit = req.query.businessUnit as string;
    if (!businessUnit) {
      throw new Error('Business unit is required to find records.');
    }
    return this.taxonomyService.findAll(businessUnit);
  }

  @Get(':docId')
  async findOne(@Param('docId') docId: string, @Req() req: Request) {
    const businessUnit = req.query.businessUnit as string;
    if (!businessUnit) {
      throw new Error('Business unit is required to find the document.');
    }
    return this.taxonomyService.findByDocId(docId, businessUnit);
  }

}
