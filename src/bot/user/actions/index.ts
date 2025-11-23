import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { Action, Update, Ctx } from 'nestjs-telegraf';
import { MyContext } from 'src/common/types';
import { Types } from 'mongoose';
import { askName, chooseDepartment } from 'src/common/constants';
import { User } from 'src/common/database/schemas/user.schema';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { userMenu } from 'src/common/constants/user/keys';
import { Product } from 'src/common/database/schemas/products.schema';

@Update()
export class UserActions {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}
  @Action('setLangUz')
  async setLangUz(@Ctx() ctx: MyContext) {
    const cachedUser: User | undefined = await this.cache.get(
      `user-${ctx.from?.id}`,
    );
    if (cachedUser == undefined || cachedUser.lastState !== 'awaitLang') {
      return;
    }
    cachedUser.lang = 'uz';
    cachedUser.lastState = 'awaitName';
    ctx.session.lang = 'uz';
    await this.cache.set(`user-${ctx.from?.id}`, cachedUser);
    await ctx.editMessageText(askName.uz);
  }

  @Action('setLangUzKrill')
  async setLangUzKrill(@Ctx() ctx: MyContext) {
    const cachedUser: User | undefined = await this.cache.get(
      `user-${ctx.from?.id}`,
    );
    if (cachedUser == undefined || cachedUser.lastState !== 'awaitLang') {
      return;
    }
    cachedUser.lang = 'kr';
    ctx.session.lang = 'kr';
    cachedUser.lastState = 'awaitName';
    await this.cache.set(`user-${ctx.from?.id}`, cachedUser);
    await ctx.editMessageText(askName.uz);
  }

  @Action('setUserLangUz')
  async setUserLangUz(@Ctx() ctx: MyContext) {
    await ctx.deleteMessage();
    ctx.session.lang = 'uz';
    await ctx.reply(chooseDepartment.uz, {
      reply_markup: userMenu.uz,
    });
    await this.userModel.findOneAndUpdate(
      { telegramId: ctx.from?.id },
      { lang: 'uz' },
    );
  }

  @Action('setUserLangUzKrill')
  async setUserLangUzKrill(@Ctx() ctx: MyContext) {
    await ctx.deleteMessage();
    ctx.session.lang = 'kr';
    await ctx.reply(chooseDepartment.kr, {
      reply_markup: userMenu.kr,
    });
    await this.userModel.findOneAndUpdate(
      { telegramId: ctx.from?.id },
      { lang: 'kr' },
    );
  }

  @Action(/categoryForUser/)
  async categoryFOrUser(@Ctx() ctx: MyContext) {
    const id = (
      ctx.update as { callback_query: { data: string } }
    ).callback_query.data.split('=')[1];
    console.log(id);
    const products = await this.productModel.find({
      categoryId: new Types.ObjectId(id),
      lastState: 'fullfilled',
      isAvailable: true,
    });
    console.log(products);
  }
}
