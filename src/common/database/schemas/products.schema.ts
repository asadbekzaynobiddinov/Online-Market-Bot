import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'products' })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  imageUrl: string;

  @Prop({ required: true, default: true })
  isAvailable: boolean;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'categories' })
  categoryId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
