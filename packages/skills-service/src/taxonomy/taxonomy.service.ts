import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { BulkWriteResult } from 'mongodb';
import { Connection, Model } from 'mongoose';
import { BulkUpsertTaxonomyDTO, TaxonomyDTO } from './dto/taxonomy.dto';
import { Taxonomy, TaxonomyEntity } from './entities/taxonomy.entity';

@Injectable()
export class TaxonomyService {
  private readonly logger = new Logger(TaxonomyService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectConnection() private readonly connection: Connection, // Inject Mongoose connection
  ) {}

  // Function to generate dynamic collection names
  private getCollectionName(businessUnit: string): string {
    const abbreviation = businessUnit.split('_')[0]; // Extract abbreviation
    return `${abbreviation}_skillsInventory`;
  }

  private getTaxonomyModel(businessUnit: string): Model<Taxonomy> {
    const collectionName = this.getCollectionName(businessUnit);
    return this.connection.model<Taxonomy>(
      Taxonomy.name,
      TaxonomyEntity,
      collectionName,
    );
  }

  async bulkUpsert(
    dto: BulkUpsertTaxonomyDTO,
  ): Promise<{ updatedCount: number; errors: any[] }> {
    let totalUpdatedCount = 0;
    const errors = [];

    for (let i = 0; i < dto.data.length; i += this.BATCH_SIZE) {
      const batch = dto.data.slice(i, i + this.BATCH_SIZE);
      try {
        const result = await this.processBatch(batch);
        totalUpdatedCount += result.modifiedCount + result.upsertedCount;
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(
            `Error processing batch ${i / this.BATCH_SIZE + 1}: ${error.message}`,
          );
          errors.push({
            batchIndex: i / this.BATCH_SIZE + 1,
            error: error.message,
          });
        } else {
          this.logger.error(
            `Error processing batch ${i / this.BATCH_SIZE + 1}: ${String(error)}`,
          );
          errors.push({
            batchIndex: i / this.BATCH_SIZE + 1,
            error: String(error),
          });
        }
      }
    }

    return { updatedCount: totalUpdatedCount, errors };
  }

  private async processBatch(batch: TaxonomyDTO[]): Promise<BulkWriteResult> {
    // Use the businessUnit from the first item as an example (assuming uniformity in batch)
    const businessUnit = batch[0].businessUnit;
    const taxonomyModel = this.getTaxonomyModel(businessUnit);

    const operations = batch.map((item) => ({
      updateOne: {
        filter: { docId: item.docId },
        update: {
          $set: {
            ...item,
            lastUpdated: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await taxonomyModel.bulkWrite(operations, {
      ordered: false,
    });
    this.logger.debug(
      `Batch processed: ${result.modifiedCount} updated, ${result.upsertedCount} inserted`,
    );
    return result as unknown as BulkWriteResult;
  }

  async findAll(businessUnit: string): Promise<Taxonomy[]> {
    const taxonomyModel = this.getTaxonomyModel(businessUnit);
    return taxonomyModel.find().exec();
  }

  async findByDocId(
    docId: string,
    businessUnit: string,
  ): Promise<Taxonomy | null> {
    const taxonomyModel = this.getTaxonomyModel(businessUnit);
    return taxonomyModel.findOne({ docId }).exec();
  }
}
