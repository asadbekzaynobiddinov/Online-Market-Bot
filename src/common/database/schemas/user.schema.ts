import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({ required: true, unique: true })
  telegramId: number;

  @Prop({ required: true })
  username: string;

  @Prop({ required: false })
  lang: string;

  @Prop({ required: false })
  lastState: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  phoneNumber: string;

  @Prop({ required: true, default: 'user', enum: ['user', 'admin'] })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
