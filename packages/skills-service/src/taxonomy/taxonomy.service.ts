import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { BulkWriteResult } from 'mongodb';
import { Connection, Model } from 'mongoose';
import {
  BulkUpsertSTaxonomyDTO,
  BulkUpsertTaxonomyDTO,
  BulkUpsertTTaxonomyDTO,
  Taxonomy,
} from './dto/taxonomy.dto';
import {
  S_Taxonomy,
  S_TaxonomyEntity,
  T_Taxonomy,
  T_TaxonomyEntity,
} from './entities/taxonomy.entity';

@Injectable()
export class TaxonomyService {
  private readonly logger = new Logger(TaxonomyService.name);
  private readonly BATCH_SIZE = 1000;
  private softTaxonomyModel: Model<S_Taxonomy> | null = null;
  private indexTracking: Map<string, boolean> = new Map(); // Track index creation by collection

  constructor(
    @InjectConnection() private readonly connection: Connection, // Inject Mongoose connection
  ) {}

  private async bulkUpsert<T extends BulkUpsertTaxonomyDTO, V>(
    dto: T,
    model: Model<V>,
  ): Promise<{ updatedCount: number; errors: any[] }> {
    let totalUpdatedCount = 0;
    const errors = [];

    for (let i = 0; i < dto.data.length; i += this.BATCH_SIZE) {
      const batch = dto.data.slice(i, i + this.BATCH_SIZE);
      try {
        const result = await this.processBatch(batch, model);
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

  private async processBatch<T extends Taxonomy, V>(
    batch: T[],
    model: Model<V>,
  ): Promise<BulkWriteResult> {
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

    const result = await model.bulkWrite(operations, { ordered: false });
    this.logger.debug(
      `Batch processed: ${result.modifiedCount} updated, ${result.upsertedCount} inserted`,
    );
    return result as unknown as BulkWriteResult;
  }

  private async ensureIndexes(
    model: Model<any>,
    indexes: { field: string; unique?: boolean }[],
    collectionName: string, // Use collection name as a key
  ) {
    if (this.indexTracking.get(collectionName)) return; // Skip if already created
    for (const index of indexes) {
      await model.collection.createIndex(
        { [index.field]: 1 },
        { unique: index.unique || false, background: true },
      );
    }
    this.indexTracking.set(collectionName, true); // Mark as created for this collection
  }

  //Technical skills

  // Function to generate dynamic collection names
  private getCollectionName(businessUnit: string): string {
    const abbreviation = businessUnit.split('_')[0]; // Extract abbreviation
    return `${abbreviation}_skillsInventory`;
  }

  private async getTechnicalTaxonomyModel(
    businessUnit: string,
  ): Promise<Model<T_Taxonomy>> {
    const collectionName = this.getCollectionName(businessUnit);
    const model = this.connection.model<T_Taxonomy>(
      T_Taxonomy.name,
      T_TaxonomyEntity,
      collectionName,
    );
    await this.ensureIndexes(
      model,
      [
        { field: 'title', unique: true },
        { field: 'docId', unique: true },
      ],
      collectionName,
    ); // Ensure indexes for this collection
    return model;
  }

  async bulkUpsertTechnical(
    dto: BulkUpsertTTaxonomyDTO,
  ): Promise<{ updatedCount: number; errors: any[] }> {
    const model = await this.getTechnicalTaxonomyModel(
      dto.data[0].businessUnit,
    );
    return this.bulkUpsert<BulkUpsertTTaxonomyDTO, T_Taxonomy>(dto, model);
  }

  async findAllTechnical(businessUnit: string): Promise<T_Taxonomy[]> {
    const taxonomyModel = await this.getTechnicalTaxonomyModel(businessUnit);
    return taxonomyModel.find().exec();
  }

  async findTechnicalByDocId(
    docId: string,
    businessUnit: string,
  ): Promise<T_Taxonomy | null> {
    const taxonomyModel = await this.getTechnicalTaxonomyModel(businessUnit);
    return taxonomyModel.findOne({ docId }).exec();
  }

  async findTechnicalByTitle(
    title: string | RegExp,
    businessUnit: string,
  ): Promise<T_Taxonomy[]> {
    const taxonomyModel = await this.getTechnicalTaxonomyModel(businessUnit);
    return taxonomyModel.find({ title }).exec();
  }

  // Soft skills
  async bulkUpsertSoft(
    dto: BulkUpsertSTaxonomyDTO,
  ): Promise<{ updatedCount: number; errors: any[] }> {
    const model = await this.getSoftTaxonomyModel();
    return this.bulkUpsert<BulkUpsertSTaxonomyDTO, S_Taxonomy>(dto, model);
  }

  private async getSoftTaxonomyModel(): Promise<Model<S_Taxonomy>> {
    if (!this.softTaxonomyModel) {
      const collectionName = 'soft_skillsInventory';
      const model = this.connection.model<S_Taxonomy>(
        S_Taxonomy.name,
        S_TaxonomyEntity,
        collectionName,
      );
      await this.ensureIndexes(
        model,
        [
          { field: 'title', unique: true },
          { field: 'docId', unique: true },
        ],
        collectionName,
      );
      this.softTaxonomyModel = model;
    }
    return this.softTaxonomyModel;
  }

  async findAllSoft(): Promise<S_Taxonomy[]> {
    const taxonomyModel = await this.getSoftTaxonomyModel();
    return taxonomyModel.find().exec();
  }

  async findSoftById(docId: string): Promise<S_Taxonomy | null> {
    const taxonomyModel = await this.getSoftTaxonomyModel();
    return taxonomyModel.findOne({ docId }).exec();
  }

  async findSoftByTitle(title: string) {
    const taxonomyModel = await this.getSoftTaxonomyModel();
    return taxonomyModel.find({ title }).exec();
  }
}
