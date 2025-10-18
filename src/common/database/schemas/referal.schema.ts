import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'referals' })
export class Referal extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'user' })
  referredBy: Types.ObjectId;

  @Prop({ required: true })
  referalBody: string;

  @Prop()
  createdAt: string;
}

export const ReferalSchema = SchemaFactory.createForClass(Referal);
