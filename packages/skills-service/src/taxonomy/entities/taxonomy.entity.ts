import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Taxonomy extends Document {
    // No attribute to index yet. 
  @Prop({ required: true, unique: true})
  doc_Id: string;

  @Prop({ required: true })
  doc_revisionId: string;

  @Prop({ required: true })
  doc_title: string;

  @Prop({ required: true })
  TSCTitle: string;

  @Prop({ required: true })
  TSCCategory: string;

  @Prop({ required: true })
  TSCDescription: string;

  @Prop({ type: Object, required: true })
  TSCProficiencyDescription: Record<string, any>;

  @Prop({ type: Object, required: true })
  Abilities: Record<string, any>;

  @Prop({ type: Object, required: true })
  Knowledge: Record<string, any>;

  @Prop({ type: [String], required: false })
  RangeOfApplication?: string[];
}

export const TaxonomyEntity = SchemaFactory.createForClass(Taxonomy);