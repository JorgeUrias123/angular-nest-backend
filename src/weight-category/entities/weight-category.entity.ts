import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class WeightCategory {

  @Prop({ type: Types.ObjectId, ref: 'AgeCategory', required: true })
  _idAgeCategory: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  wMin: number;

  @Prop({ required: true })
  wMax: number;
}

export const WeightCategorySchema = SchemaFactory.createForClass( WeightCategory );