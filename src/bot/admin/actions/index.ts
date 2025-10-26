/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UseGuards } from '@nestjs/common';
import { Update, Action, Ctx } from 'nestjs-telegraf';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { MyContext } from 'src/common/types';
import { config } from 'src/config';
import { Referal } from 'src/common/database/schemas/referal.schema';
import {
  askcategoryName,
  askProductName,
  backFromReferalList,
  categoryInline,
  categoryMenu,
  categoryName,
  chooseDepartment,
  createdDate,
  editCategoryMenu,
  editProductMenu,
  existsCategories,
  existsProducts,
  noCategories,
  noProducts,
  noReferals,
  productInline,
  productmenu,
  productName,
  referalCreated,
  referalMenu,
} from 'src/common/constants';
import { LastMessageGuard } from 'src/common/guards/lastMessage.guard';
import { LanguageGuard } from 'src/common/guards/language.guard';
import { Category } from 'src/common/database/schemas/category.schema';
import { Markup } from 'telegraf';
import { Product } from 'src/common/database/schemas/products.schema';

@UseGuards(AdminGuard)
@UseGuards(LanguageGuard)
@UseGuards(LastMessageGuard)
@Update()
export class AdminActions {
  constructor(
    @InjectModel(Referal.name) private referalModel: Model<Referal>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}
  @Action('addReferal')
  async addReferal(@Ctx() ctx: MyContext) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const code = Array.from(
      { length: 10 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');

    const referal = `https://t.me/${config.BOT_USERNAME}?start=${code}`;

    await this.referalModel.create({
      referalBody: referal,
      referredBy: ctx.from?.id,
    });

    await ctx.answerCbQuery(referalCreated[ctx.session.lang] as string, {
      show_alert: true,
    });
  }

  @Action('listOfReferals')
  async listOfReferals(@Ctx() ctx: MyContext) {
    const referals = await this.referalModel
      .find({ referredBy: ctx.from?.id })
      .sort({ createdAt: -1 });

    if (referals.length == 0) {
      await ctx.answerCbQuery(noReferals[ctx.session.lang] as string, {
        show_alert: true,
      });
      return;
    }

    let text: string = '';
    for (const ref of referals) {
      text += `${createdDate[ctx.session.lang]} ${ref.createdAt.split('GMT')[0]}\n <code>${ref.referalBody}</code>\n\n`;
    }
    await ctx.editMessageText(text, {
      reply_markup: backFromReferalList[ctx.session.lang],
      parse_mode: 'HTML',
    });
  }

  @Action('backFromReferalList')
  async backFromReferalList(@Ctx() ctx: MyContext) {
    await ctx.editMessageText(chooseDepartment[ctx.session.lang] as string, {
      reply_markup: referalMenu[ctx.session.lang],
    });
  }

  @Action('addCategory')
  async addCategory(@Ctx() ctx: MyContext) {
    ctx.session.admin.lastState = 'awaitCategoryName';
    await ctx.editMessageText(askcategoryName[ctx.session.lang] as string);
  }

  @Action('listOfCategories')
  async listOfCategories(
    @Ctx() ctx: MyContext,
    page: number = 0,
    itsFromDeleteCategory: boolean = false,
    callback: string = 'selectedCategory',
    navigationCallback: string = 'categoryPage',
    backfromCallback: string = 'backFromCategoryList',
    messageTitle: string = existsCategories[ctx.session.lang] as string,
    itsFromDeleteProduct: boolean = false,
  ) {
    const PAGE_SIZE = 10;
    const BUTTONS_PER_ROW = 5;

    const categories = await this.categoryModel.find();

    if (categories.length == 0) {
      await ctx.answerCbQuery(noCategories[ctx.session.lang] as string, {
        show_alert: true,
      });
      if (itsFromDeleteCategory) {
        await ctx.editMessageText(messageTitle, {
          reply_markup: categoryMenu[ctx.session.lang],
        });
      }
      return;
    }

    const totalPages = Math.ceil(categories.length / PAGE_SIZE);

    const startIndex = page * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const visibleCategories = categories.slice(startIndex, endIndex);

    let text: string = messageTitle + '\n\n';
    visibleCategories.forEach((c, i) => {
      text += `<b>${startIndex + i + 1}.</b> ${c.name}\n`;
    });

    const buttons: any[] = [];
    for (let i = 0; i < visibleCategories.length; i += BUTTONS_PER_ROW) {
      const row = visibleCategories
        .slice(i, i + BUTTONS_PER_ROW)
        .map((c, idx) =>
          Markup.button.callback(
            `${startIndex + i + idx + 1}`,
            `${callback}=${c._id}`,
          ),
        );
      buttons.push(row);
    }

    const navButtons: any[] = [];
    if (totalPages > 1) {
      if (page > 0) {
        navButtons.push(
          Markup.button.callback('◀️', `${navigationCallback}=${page - 1}`),
        );
      }
      if (page < totalPages - 1) {
        navButtons.push(
          Markup.button.callback('▶️', `${navigationCallback}=${page + 1}`),
        );
      }
    }
    if (navButtons.length > 0) {
      buttons.push(navButtons);
    }

    buttons.push([Markup.button.callback('⬅️ Orqaga', backfromCallback)]);

    if (itsFromDeleteProduct) {
      ctx.session.lastMessage = await ctx.sendMessage(text, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard(buttons as []),
      });
    } else {
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard(buttons as []),
      });
    }
  }

  @Action(/categoryPage=(\d+)/)
  async onPageChange(@Ctx() ctx: MyContext) {
    const page = (
      ctx.update as { callback_query: { data: string } }
    ).callback_query.data.split('=')[1];
    ctx.session.admin.categoryPage = +page;
    await this.listOfCategories(ctx, +page, false, 'selectedCategory');
  }

  @Action('backFromCategoryList')
  async backFromCategoryList(@Ctx() ctx: MyContext) {
    await ctx.editMessageText(chooseDepartment[ctx.session.lang] as string, {
      reply_markup: categoryMenu[ctx.session.lang],
    });
  }

  @Action(/selectedCategory/)
  async selectedCategory(@Ctx() ctx: MyContext) {
    const id = (
      ctx.update as { callback_query: { data: string } }
    ).callback_query.data.split('=')[1];
    const category = await this.categoryModel.findById(id);
    if (!category) return;
    ctx.session.admin.selectedCategoryId = category._id as string;
    await ctx.editMessageText(
      `${category.name} ${categoryName[ctx.session.lang]}`,
      {
        reply_markup: categoryInline[ctx.session.lang],
      },
    );
  }

  @Action('editCategory')
  async editCategory(@Ctx() ctx: MyContext) {
    await ctx.editMessageText(chooseDepartment[ctx.session.lang] as string, {
      reply_markup: editCategoryMenu[ctx.session.lang],
    });
  }

  @Action('addProduct')
  async addProduct(@Ctx() ctx: MyContext) {
    ctx.session.admin.lastState = 'addingProduct';
    const newProduct = new this.productModel({
      categoryId: ctx.session.admin.selectedCategoryId,
      lastState: 'awaitName',
    });
    await newProduct.save();
    ctx.session.admin.newProductId = newProduct._id as string;
    await ctx.editMessageText(askProductName[ctx.session.lang] as string);
  }

  @Action('backFromCategoryInline')
  async backFromCategoryInline(@Ctx() ctx: MyContext) {
    await this.listOfCategories(
      ctx,
      ctx.session.admin.categoryPage || 0,
      false,
      'selectedCategory',
    );
  }

  @Action('changeCategoryName')
  async changeCategoryName(@Ctx() ctx: MyContext) {
    ctx.session.admin.lastState = 'awaitNewCategoryName';
    await ctx.editMessageText(askcategoryName[ctx.session.lang] as string);
  }

  @Action('deleteCategory')
  async deleteCategory(@Ctx() ctx: MyContext) {
    await this.productModel.deleteMany({
      categoryId: ctx.session.admin.selectedCategoryId,
    });
    await this.categoryModel.findByIdAndDelete(
      ctx.session.admin.selectedCategoryId,
    );
    await this.listOfCategories(
      ctx,
      ctx.session.admin.categoryPage || 0,
      true,
      'selectedCategory',
    );
  }

  @Action('backFromEditCategoryMenu')
  async backFromEditCategoryMenu(@Ctx() ctx: MyContext) {
    const category = await this.categoryModel.findById(
      ctx.session.admin.selectedCategoryId,
    );

    if (!category) return;

    await ctx.editMessageText(
      `${category.name} ${categoryName[ctx.session.lang]}`,
      {
        reply_markup: categoryInline[ctx.session.lang],
      },
    );
  }

  @Action('listOfProducts')
  async listOfProducts(
    @Ctx() ctx: MyContext,
    itsFromDeleteProduct: boolean = false,
  ) {
    if (itsFromDeleteProduct) {
      await this.listOfCategories(
        ctx,
        ctx.session.admin.categoryPage || 0,
        false,
        'categoryForProducts',
        'pageOfCategoryForProducts',
        'backFromProductListToCategory',
        chooseDepartment[ctx.session.lang] as string,
        true,
      );
      return;
    }
    await this.listOfCategories(
      ctx,
      0,
      false,
      'categoryForProducts',
      'pageOfCategoryForProducts',
      'backFromProductListToCategory',
      chooseDepartment[ctx.session.lang] as string,
    );
  }

  @Action(/pageOfCategoryForProducts=(\d+)/)
  async pageOfCategoryForProducts(@Ctx() ctx: MyContext) {
    const page = (
      ctx.update as { callback_query: { data: string } }
    ).callback_query.data.split('=')[1];
    ctx.session.admin.categoryPage = +page;
    await this.listOfCategories(
      ctx,
      +page,
      false,
      'categoryForProducts',
      'pageOfCategoryForProducts',
      'backFromProductListToCategory',
      chooseDepartment[ctx.session.lang] as string,
    );
  }

  @Action(/categoryForProducts/)
  async categoryForProducts(@Ctx() ctx: MyContext, page: number = 0) {
    const id = (
      ctx.update as { callback_query: { data: string } }
    ).callback_query.data.split('=')[1];
    const category = await this.categoryModel.findById(id);
    if (!category) return;
    const products = await this.productModel
      .find({})
      .where('categoryId')
      .equals(category._id);
    if (products.length == 0) {
      await ctx.answerCbQuery(noProducts[ctx.session.lang] as string, {
        show_alert: true,
      });
      return;
    }
    const PAGE_SIZE = 10;
    const BUTTONS_PER_ROW = 5;

    const totalPages = Math.ceil(products.length / PAGE_SIZE);

    const startIndex = page * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const visibleProducts = products.slice(startIndex, endIndex);

    let text: string = existsProducts[ctx.session.lang] as string;
    visibleProducts.forEach((p, i) => {
      text += `<b>${startIndex + i + 1}.</b> ${p.name}\n`;
    });

    const buttons: any[] = [];
    for (let i = 0; i < visibleProducts.length; i += BUTTONS_PER_ROW) {
      const row = visibleProducts
        .slice(i, i + BUTTONS_PER_ROW)
        .map((p, idx) =>
          Markup.button.callback(
            `${startIndex + i + idx + 1}`,
            `selectedProduct=${p._id}`,
          ),
        );
      buttons.push(row);
    }

    const navButtons: any[] = [];
    if (totalPages > 1) {
      if (page > 0) {
        navButtons.push(
          Markup.button.callback('◀️', `pageOfCategoryForProducts=${page - 1}`),
        );
      }
      if (page < totalPages - 1) {
        navButtons.push(
          Markup.button.callback('▶️', `pageOfCategoryForProducts=${page + 1}`),
        );
      }
    }
    buttons.push(navButtons);

    buttons.push([Markup.button.callback('⬅️ Orqaga', 'backFromProductList')]);
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(buttons as []),
    });
  }

  @Action('backFromProductList')
  async backFromProductList(@Ctx() ctx: MyContext) {
    await this.listOfCategories(
      ctx,
      ctx.session.admin.categoryPage || 0,
      false,
      'categoryForProducts',
      'pageOfCategoryForProducts',
      'backFromProductListToCategory',
      chooseDepartment[ctx.session.lang] as string,
    );
  }

  @Action('backFromProductListToCategory')
  async backFromProductListToCategory(@Ctx() ctx: MyContext) {
    await ctx.editMessageText(chooseDepartment[ctx.session.lang] as string, {
      reply_markup: productmenu[ctx.session.lang],
    });
  }

  @Action(/selectedProduct/)
  async selectedProduct(@Ctx() ctx: MyContext, id?: string) {
    let productId: string;

    if (id) {
      productId = id;
    } else {
      productId = (
        ctx.update as { callback_query: { data: string } }
      ).callback_query.data.split('=')[1];
    }

    const product = await this.productModel.findById(productId);
    if (!product) return;

    ctx.session.admin.selectedProductId = product._id as string;

    await ctx.deleteMessage();

    ctx.session.lastMessage = await ctx.sendPhoto(product.imageUrl, {
      caption: `${productName[ctx.session.lang]}: ${product.name}\n\nMahsulot haqida ma'lumot kiritilmagan.`,
      reply_markup: productInline[ctx.session.lang],
    });
  }

  @Action('editProduct')
  async editProduct(@Ctx() ctx: MyContext) {
    const product = await this.productModel.findById(
      ctx.session.admin.selectedProductId,
    );
    if (!product) return;
    await ctx.editMessageCaption(
      `${productName[ctx.session.lang]}: ${product.name}\n\nMahsulot haqida ma'lumot kiritilmagan.`,
      {
        reply_markup: editProductMenu[ctx.session.lang],
      },
    );
  }

  @Action('backFromEditProductMenu')
  async backFromEditProductMenu(@Ctx() ctx: MyContext) {
    const product = await this.productModel.findById(
      ctx.session.admin.selectedProductId,
    );
    if (!product) return;
    await ctx.editMessageCaption(
      `${productName[ctx.session.lang]}: ${product.name}\n\nMahsulot haqida ma'lumot kiritilmagan.`,
      {
        reply_markup: productInline[ctx.session.lang],
      },
    );
  }

  @Action('deleteProduct')
  async deleteProduct(@Ctx() ctx: MyContext) {
    try {
      await this.productModel.findByIdAndDelete(
        ctx.session.admin.selectedProductId,
      );
    } catch (error) {
      console.log(error);
    }
    await ctx.deleteMessage();
    ctx.session.admin.selectedProductId = '';
    await this.listOfProducts(ctx, true);
  }
}
