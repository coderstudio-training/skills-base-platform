import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '@skills-base/shared';

@Schema()
export class Taxonomy extends BaseEntity {
  @Prop({ required: true, unique: true, index: true})
  docId!: string;

  @Prop({ required: true })
  docRevisionId!: string;

  @Prop({ required: true })
  docTitle!: string;

  @Prop({ required: true })
  tscTitle!: string;

  @Prop({ required: true })
  tscCategory!: string;

  @Prop({ required: true })
  tscDescription!: string;

  @Prop({ type: Object, required: true })
  tscProficiencyDescription!: Record<string, any>;

  @Prop({ type: Object, required: true })
  abilities!: Record<string, any>;

  @Prop({ type: Object, required: true })
  knowledge!: Record<string, any>;

  @Prop({ type: [String], required: false })
  rangeOfApplication?: string[];
}

export const TaxonomyEntity = SchemaFactory.createForClass(Taxonomy);