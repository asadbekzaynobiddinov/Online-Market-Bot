import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// --- Product subschema ---
@Schema({ _id: false })
class CartProduct {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: false, default: 'dona' })
  unit: string;
}

// --- Cart schema ---
@Schema({ timestamps: true, collection: 'cart' })
export class Cart extends Document {
  @Prop({ required: true, ref: 'users', type: Types.ObjectId })
  userId: string;

  @Prop({ type: [CartProduct], default: [] })
  products: CartProduct[];

  @Prop({ required: true, default: 0 })
  totalPrice: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
