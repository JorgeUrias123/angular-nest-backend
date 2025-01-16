import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
export class Location {

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);


@Schema({ _id: false })
export class ContactInfo {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;
}

export const ContactInfoSchema = SchemaFactory.createForClass(ContactInfo);


export enum MatchStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed'
}

@Schema({ _id: false })
export class Score {
  @Prop({ required: true })
  player1Points: number;

  @Prop({ required: true })
  player2Points: number;

  @Prop({ required: true })
  winner?: Types.ObjectId;
}

export const ScoreSchema = SchemaFactory.createForClass(Score);

@Schema({ _id: true })
export class Match {

  @Prop({ type: String, default: () => new Types.ObjectId().toString() })
  _id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  player1: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  player2?: Types.ObjectId;

  @Prop({ type: ScoreSchema })
  score?: Score;

  @Prop({ enum: MatchStatus, default: MatchStatus.Pending })
  status: MatchStatus;

  @Prop()
  round?: number;

}

export const MatchSchema = SchemaFactory.createForClass(Match);


@Schema()
export class Tournament {
  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  _userId: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  registrationDeadline: Date;

  @Prop({ type: String})
  image?: string;

  @Prop({ type: String})
  imageUrl?: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: LocationSchema, required: true })
  location: Location;


  @Prop({
    type: [
      {
        beltCategory: { type: MongooseSchema.Types.ObjectId, ref: 'BeltCategory', required: true },
        ageCategories: [
          {
            ageCategory: { type: MongooseSchema.Types.ObjectId, ref: 'AgeCategory', required: true },
            weightCategories: [
              {
                weightCategory: { type: MongooseSchema.Types.ObjectId, ref: 'WeightCategory', required: true },
                participants: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
                matches: [{ type: MatchSchema }]
              }
            ],
          },
        ],
      },
    ],
    required: true,
  })
  divisions: Array<{
    beltCategory: Types.ObjectId;
    ageCategories: Array<{
      ageCategory: Types.ObjectId;
      weightCategories: Array<{
        weightCategory: Types.ObjectId;
        participants?: Types.ObjectId[];
        matches?: Match[];
      }>
    }>;
  }>;

  @Prop({ default: 0 })
  participantsCount: number;

  @Prop({ type: ContactInfoSchema, required: true })
  contactInfo: ContactInfo;

  @Prop({ 
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    validate: {
      validator: function(array: any[]) {
        return array.length <= 10;
      },
      message: 'El número máximo de jueces permitidos es 10'
    }
  })
  judges?: Types.ObjectId[];

  @Prop({ 
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    validate: {
      validator: function(array: any[]) {
        return array.length <= 10;
      },
      message: 'El número máximo de árbitros permitidos es 10'
    }
  })
  referees?: Types.ObjectId[];

  @Prop()
  price?: number;

  @Prop({ default: false })
  isActive: boolean;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
export type TournamentDocument = Tournament & Document;
