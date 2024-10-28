import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '@skills-base/shared';

@Schema()
export class Taxonomy extends BaseEntity {
  @Prop({ required: true, unique: true, index: true})
  DOC_Id!: string;

  @Prop({ required: true })
  DOC_RevisionId!: string;

  @Prop({ required: true })
  DOC_Title!: string;

  @Prop({ required: true })
  TSC_Title!: string;

  @Prop({ required: true })
  TSC_Category!: string;

  @Prop({ required: true })
  TSC_Description!: string;

  @Prop({ type: Object, required: true })
  TSC_ProficiencyDescription!: Record<string, any>;

  @Prop({ type: Object, required: true })
  Abilities!: Record<string, any>;

  @Prop({ type: Object, required: true })
  Knowledge!: Record<string, any>;

  @Prop({ type: String, required: true})
  BusinessUnit!: string;

  @Prop({ type: [String], required: false })
  RangeOfApplication?: string[];
}

export const TaxonomyEntity = SchemaFactory.createForClass(Taxonomy);