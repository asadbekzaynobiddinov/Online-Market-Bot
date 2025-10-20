import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Referal,
  ReferalSchema,
} from 'src/common/database/schemas/referal.schema';
import { User, UserSchema } from 'src/common/database/schemas/user.schema';
import { AdminActions } from './actions';
import {
  Category,
  CategorySchema,
} from 'src/common/database/schemas/category.schema';
import {
  Product,
  ProductSchema,
} from 'src/common/database/schemas/products.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Referal.name, schema: ReferalSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [AdminActions],
})
export class AdminModule {}
