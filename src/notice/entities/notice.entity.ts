import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Notice {

  @Prop({required: true, type: String})
  title: string;

  @Prop({type: String})
  image: string;

  @Prop({type: String})
  imageUrl: string;

  @Prop({ required: true, type: String })
  category: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: String })
  text: string;

  @Prop({ type: Date, default: Date.now })
  date?: Date;
}

export const noticeSchema = SchemaFactory.createForClass(Notice);

