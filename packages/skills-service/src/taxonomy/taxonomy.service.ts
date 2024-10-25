import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BulkWriteResult } from 'mongodb';
import { Model } from 'mongoose';
import { BulkUpsertTaxonomyDTO, TaxonomyDTO } from './dto/taxonomy.dto';
import { Taxonomy } from './entities/taxonomy.entity';

@Injectable()
export class TaxonomyService {
  private readonly logger = new Logger(TaxonomyService.name)
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectModel(Taxonomy.name)
    private readonly taxonomyModel: Model<Taxonomy>,
  ) {
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    try {
      await this.taxonomyModel.collection.createIndex(
        {doc_Id: 1},
        { unique: true, background: true },
      );

      this.logger.log('Indexes ensured for Taxonomy collection');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error ensuring indexes: ${error.message}`);
      } else {
        this.logger.error(`Unknown error: ${error}`);
      }
    }
  }

  async bulkUpsert(dto: BulkUpsertTaxonomyDTO): Promise<{ updatedCount: number, errors: any[] }> {
    let totalUpdatedCount = 0;
    const errors = [];

    for (let i = 0; i < dto.data.length; i += this.BATCH_SIZE) {
      const batch = dto.data.slice(i, i + this.BATCH_SIZE);
      try {
        const result = await this.processBatch(batch);
        totalUpdatedCount += result.modifiedCount + result.upsertedCount;
      } catch (error) {
        this.logger.error(`Error processing batch ${i / this.BATCH_SIZE + 1}: ${error.message}`);
        errors.push({ batchIndex: i / this.BATCH_SIZE + 1, error: error.message });
      }
    }

    return { updatedCount: totalUpdatedCount, errors }; 
  }

  private async processBatch(
    batch: TaxonomyDTO[],
  ): Promise<BulkWriteResult> {
    const operations = batch.map((item) => ({
      updateOne: {
        filter: { DOC_Id: item.DOC_Id }, // Using email as the unique identifier
        update: {
          $set: {
            ...item,
            lastUpdated: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await this.taxonomyModel.bulkWrite(operations, {
      ordered: false,
    });
    this.logger.debug(
      `Batch processed: ${result.modifiedCount} updated, ${result.upsertedCount} inserted`,
    );
    return result;
  }

  async findAll(): Promise<Taxonomy[]> {
    return this.taxonomyModel.find().exec();
  }

  async findByGdocId(DOC_Id: string): Promise<Taxonomy | null> {
    return this.taxonomyModel.findOne({ DOC_Id: DOC_Id}).exec();
  }
}
