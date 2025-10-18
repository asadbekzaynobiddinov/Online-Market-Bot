import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class OrderProduct {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  unit: string;
}

@Schema({ timestamps: true, collection: 'orders' })
export class Orders extends Document {
  @Prop({ required: true, ref: 'users', type: Types.ObjectId })
  userId: string;

  @Prop({ type: [OrderProduct], required: true })
  products: OrderProduct[];

  @Prop({ required: true })
  totalPrice: number;

  @Prop()
  address: string;
}

export const OrdersSchema = SchemaFactory.createForClass(Orders);
