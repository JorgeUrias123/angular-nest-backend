import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Belt } from "src/auth/entities/user.entity";

@Schema()
export class BeltCategory {

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], enum: Belt, required: true })
  belts: Belt[];
}

export const BeltCategorySchema = SchemaFactory.createForClass(BeltCategory);

