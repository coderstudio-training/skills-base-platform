import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '@skills-base/shared';

@Schema()
export class T_Taxonomy extends BaseEntity {
  @Prop({ required: true, unique: true, index: true })
  docId!: string;

  @Prop({ required: true })
  docRevisionId!: string;

  @Prop({ required: true })
  docTitle!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: Object, required: true })
  proficiencyDescription!: Record<string, any>;

  @Prop({ type: Object, required: true })
  abilities!: Record<string, any>;

  @Prop({ type: Object, required: true })
  knowledge!: Record<string, any>;

  @Prop({ type: [String], required: false })
  rangeOfApplication?: string[];
}

@Schema()
export class S_Taxonomy extends BaseEntity {
  @Prop({ required: true, unique: true, index: true })
  docId!: string;

  @Prop({ required: true })
  docRevisionId!: string;

  @Prop({ required: true })
  docTitle!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: Object, required: true })
  proficiencyDescription!: Record<string, string[]>;

  @Prop({ type: Object, required: true })
  benchmark!: Record<string, string[]>;
}

export const T_TaxonomyEntity = SchemaFactory.createForClass(T_Taxonomy);
export const S_TaxonomyEntity = SchemaFactory.createForClass(S_Taxonomy);
