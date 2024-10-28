import { Body, Controller, Get, Logger, Param, Post, Req } from '@nestjs/common';
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
  async findAll() {
    return this.taxonomyService.findAll();
  }

  @Get(':DOC_Id')
  async findOne(@Param('DOC_Id') DOC_Id: string) {
    return this.taxonomyService.findByGdocId(DOC_Id);
  }

}
