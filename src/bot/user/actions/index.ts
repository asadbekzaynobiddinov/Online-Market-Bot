/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { Action, Update, Ctx } from 'nestjs-telegraf';
import { MyContext } from 'src/common/types';
import { Types } from 'mongoose';
import {
  askLocation,
  askName,
  awaitProductQuantityForUser,
  chooseDepartment,
  noProducts,
} from 'src/common/constants';
import { User } from 'src/common/database/schemas/user.schema';
import { Inject, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  backFromProductList,
  productMenuForUser,
  sendLocationButton,
  userMenu,
} from 'src/common/constants/user/keys';
import { Product } from 'src/common/database/schemas/products.schema';
import { Markup } from 'telegraf';
import { LanguageGuard } from 'src/common/guards/language.guard';
import { LastMessageGuard } from 'src/common/guards/lastMessage.guard';
import { Category } from 'src/common/database/schemas/category.schema';
import { Cart } from 'src/common/database/schemas/cart.schema';

@Update()
export class UserActions {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}
  @Action('setLangUz')
  async setLangUz(@Ctx() ctx: MyContext) {
    const user = await this.userModel.findOne({ telegramId: ctx.from?.id });
    if (!user) return;
    user.lang = 'uz';
    user.lastState = 'awaitName';
    ctx.session.lang = 'uz';
    await user.save();
    await ctx.editMessageText(askName.uz);
  }

  @Action('setLangUzKrill')
  async setLangUzKrill(@Ctx() ctx: MyContext) {
    const user = await this.userModel.findOne({ telegramId: ctx.from?.id });
    if (!user) return;
    user.lang = 'kr';
    ctx.session.lang = 'kr';
    user.lastState = 'awaitName';
    await user.save();
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

  @UseGuards(LanguageGuard, LastMessageGuard)
  @Action(/categoryForUser/)
  async categoryFOrUser(@Ctx() ctx: MyContext) {
    const id = (
      ctx.update as { callback_query: { data: string } }
    ).callback_query.data.split('=')[1];

    ctx.session.user.selectedCategory = id;

    const products = await this.productModel.find({
      categoryId: new Types.ObjectId(id),
      lastState: 'fullfilled',
      isAvailable: true,
    });
    let text: string = '';
    products.forEach((item, i) => (text += `${i + 1}. ${item.name}\n`));
    const buttons: any[] = [];
    for (let i = 0; i < products.length; i += 5) {
      const row = products
        .slice(i, i + 5)
        .map((c, idx) =>
          Markup.button.callback(
            `${0 + i + idx + 1}`,
            `productForUser=${c._id}`,
          ),
        );
      buttons.push(row);
    }
    if (products.length == 10) {
      buttons.push([Markup.button.callback('▶️', `nextPageOfProductsForUser`)]);
    }
    if (ctx.session.user.page > 0) {
      buttons.push([
        Markup.button.callback('◀️', `previousPageOfProductsForUser`),
      ]);
    }
    await ctx.editMessageText(text, {
      reply_markup: {
        inline_keyboard: [
          ...buttons,
          ...backFromProductList[ctx.session.lang].inline_keyboard,
        ],
      },
    });
  }

  @UseGuards(LanguageGuard, LastMessageGuard)
  @Action('nextPageOfProductsForUser')
  async nextPageOfProductsForUser(@Ctx() ctx: MyContext) {
    ctx.session.user.page = ctx.session.user.page || 0 + 1;
    const skip = (ctx.session.user.page - 1) * 10;
    const categories = await this.categoryModel.find().skip(skip).limit(10);
    if (categories.length == 0) {
      await ctx.reply(noProducts[ctx.session.lang || 'uz'] as string);
      return;
    }
    let text = chooseDepartment[ctx.session.lang] + '\n\n';
    categories.forEach((item, i) => (text += `${i + 1}. ${item.name}\n`));
    const buttons: any[] = [];
    for (let i = 0; i < categories.length; i += 5) {
      const row = categories
        .slice(i, i + 5)
        .map((c, idx) =>
          Markup.button.callback(
            `${0 + i + idx + 1}`,
            `categoryForUser=${c._id}`,
          ),
        );
      buttons.push(row);
    }
    if (categories.length == 10) {
      buttons.push([Markup.button.callback('▶️', `nextPageOfCategoryForUser`)]);
    }
    if (ctx.session.user.page > 0) {
      buttons.push([
        Markup.button.callback('◀️', `previousPageOfCategoryForUser`),
      ]);
    }
    await ctx.editMessageText(text, {
      reply_markup: {
        inline_keyboard: [...buttons],
      },
    });
  }

  @UseGuards(LanguageGuard, LastMessageGuard)
  @Action('previousPageOfCategoryForUser')
  async previousPageOfCategoryForUser(@Ctx() ctx: MyContext) {
    ctx.session.user.page = ctx.session.user.page || 2 - 1;
    const skip = (ctx.session.user.page - 1) * 10;
    const categories = await this.categoryModel.find().skip(skip).limit(10);
    if (categories.length == 0) {
      await ctx.reply(noProducts[ctx.session.lang || 'uz'] as string);
      return;
    }
    let text = chooseDepartment[ctx.session.lang] + '\n\n';
    categories.forEach((item, i) => (text += `${i + 1}. ${item.name}\n`));
    const buttons: any[] = [];
    for (let i = 0; i < categories.length; i += 5) {
      const row = categories
        .slice(i, i + 5)
        .map((c, idx) =>
          Markup.button.callback(
            `${0 + i + idx + 1}`,
            `categoryForUser=${c._id}`,
          ),
        );
      buttons.push(row);
    }
    if (categories.length == 10) {
      buttons.push([Markup.button.callback('▶️', `nextPageOfCategoryForUser`)]);
    }
    if (ctx.session.user.page > 0) {
      buttons.push([
        Markup.button.callback('◀️', `previousPageOfCategoryForUser`),
      ]);
    }
    await ctx.editMessageText(text, {
      reply_markup: {
        inline_keyboard: [...buttons],
      },
    });
  }

  @UseGuards(LanguageGuard, LastMessageGuard)
  @Action('backFromProductListforUser')
  async backFromProductListforUser(@Ctx() ctx: MyContext) {
    const skip = (ctx.session.user.page || 1 - 1) * 10;
    const categories = await this.categoryModel.find().skip(skip).limit(10);
    if (categories.length == 0) {
      await ctx.reply(noProducts[ctx.session.lang || 'uz'] as string);
      return;
    }
    let text = chooseDepartment[ctx.session.lang] + '\n\n';
    categories.forEach((item, i) => (text += `${i + 1}. ${item.name}\n`));
    const buttons: any[] = [];
    for (let i = 0; i < categories.length; i += 5) {
      const row = categories
        .slice(i, i + 5)
        .map((c, idx) =>
          Markup.button.callback(
            `${0 + i + idx + 1}`,
            `categoryForUser=${c._id}`,
          ),
        );
      buttons.push(row);
    }
    if (categories.length == 10) {
      buttons.push([Markup.button.callback('▶️', `nextPageOfCategoryForUser`)]);
    }
    if (ctx.session.user.page > 0) {
      buttons.push([
        Markup.button.callback('◀️', `previousPageOfCategoryForUser`),
      ]);
    }
    await ctx.editMessageText(text, {
      reply_markup: {
        inline_keyboard: [...buttons],
      },
    });
  }

  @UseGuards(LanguageGuard, LastMessageGuard)
  @Action(/productForUser/)
  async productForUser(@Ctx() ctx: MyContext) {
    const id = (
      ctx.update as { callback_query: { data: string } }
    ).callback_query.data.split('=')[1];
    ctx.session.user.selectedProduct = id;
    const product = await this.productModel.findOne({ _id: id });
    if (!product) return;
    await ctx.deleteMessage();
    ctx.session.lastMessage = await ctx.sendPhoto(product.imageUrl, {
      caption:
        `<b>${product.name}\n\n</b>` +
        `ℹ️: ${product.description}\n` +
        `💸<b>(1 ${product.unit})</b>: ${product.price}\n`,
      parse_mode: 'HTML',
      reply_markup: productMenuForUser[ctx.session.lang],
    });
  }

  @UseGuards(LanguageGuard, LastMessageGuard)
  @Action('backFromProductForUser')
  async backFromProductForUser(@Ctx() ctx: MyContext) {
    await ctx.deleteMessage();
    if (!ctx.session.user.selectedCategory) return;
    const products = await this.productModel.find({
      categoryId: new Types.ObjectId(ctx.session.user.selectedCategory),
      lastState: 'fullfilled',
      isAvailable: true,
    });
    let text: string = '';
    products.forEach((item, i) => (text += `${i + 1}. ${item.name}\n`));
    const buttons: any[] = [];
    for (let i = 0; i < products.length; i += 5) {
      const row = products
        .slice(i, i + 5)
        .map((c, idx) =>
          Markup.button.callback(
            `${0 + i + idx + 1}`,
            `productForUser=${c._id}`,
          ),
        );
      buttons.push(row);
    }
    if (products.length == 10) {
      buttons.push([Markup.button.callback('▶️', `nextPageOfProductsForUser`)]);
    }
    if (ctx.session.user.page > 0) {
      buttons.push([
        Markup.button.callback('◀️', `previousPageOfProductsForUser`),
      ]);
    }
    ctx.session.lastMessage = await ctx.reply(text, {
      reply_markup: {
        inline_keyboard: [
          ...buttons,
          ...backFromProductList[ctx.session.lang].inline_keyboard,
        ],
      },
    });
  }

  @UseGuards(LanguageGuard, LastMessageGuard)
  @Action('addToCart')
  async addToCart(@Ctx() ctx: MyContext) {
    if (!ctx.session.user.selectedProduct) return;
    const product = await this.productModel.findOne({
      _id: ctx.session.user.selectedProduct,
    });
    if (!product) return;
    const user = await this.userModel.findOne({ telegramId: ctx.from?.id });

    if (!user) return;

    const cart = await this.cartModel.findOne({ userId: user?._id });

    ctx.session.user.lastState = 'addingProductToCart';

    if (!cart) {
      const newCart = new this.cartModel({
        userId: user?._id,
        products: [],
      });
      await newCart.save();
    }

    await ctx.deleteMessage();
    await ctx.reply(
      (awaitProductQuantityForUser[ctx.session.lang] as string) +
        `(${product.unit})`,
    );
  }

  @UseGuards(LanguageGuard, LastMessageGuard)
  @Action('buy')
  async buy(@Ctx() ctx: MyContext) {
    ctx.session.user.lastState = 'sendingLocation';
    await ctx.deleteMessage();
    await ctx.reply(askLocation[ctx.session.lang] as string, {
      parse_mode: 'HTML',
      reply_markup: sendLocationButton[ctx.session.lang],
    });
  }
}
