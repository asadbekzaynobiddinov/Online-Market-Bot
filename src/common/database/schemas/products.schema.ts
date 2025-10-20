import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'products' })
export class Product extends Document {
  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  price: number;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  imageUrl: string;

  @Prop({ required: true, default: true })
  isAvailable: boolean;

  @Prop({ required: false })
  quantity: number;

  @Prop({ required: false })
  unit: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'categories' })
  categoryId: string;

  @Prop({ required: false })
  lastState: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
