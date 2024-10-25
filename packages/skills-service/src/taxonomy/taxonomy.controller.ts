import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { BulkUpsertTaxonomyDTO } from './dto/taxonomy.dto';
import { TaxonomyService } from './taxonomy.service';

@Controller('taxonomy')
export class TaxonomyController {
  private readonly logger = new Logger(TaxonomyController.name);

  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Post('bulk-upsert')
  async bulkUpsert(@Body() dto: BulkUpsertTaxonomyDTO) {
    return this.taxonomyService.bulkUpsert(dto);
  }

  @Get()
  async findAll() {
    return this.taxonomyService.findAll();
  }

  @Get(':doc_Id')
  async findOne(@Param('doc_Id') doc_Id: string) {
    return this.taxonomyService.findByGdocId(doc_Id);
  }

}
