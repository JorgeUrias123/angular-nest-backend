import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class AgeCategory {

  _id?: string;
  
  @Prop({required: true})
  name: string;

  @Prop({required: true})
  min: number;

  @Prop({required: true})
  max: number;
}

export const AgeCategorySchema = SchemaFactory.createForClass( AgeCategory );
