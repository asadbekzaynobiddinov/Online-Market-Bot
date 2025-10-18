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
  backFromReferalList,
  categoryMenu,
  chooseDepartment,
  createdDate,
  existsCategories,
  noReferals,
  referalCreated,
  referalMenu,
} from 'src/common/constants';
import { LastMessageGuard } from 'src/common/guards/lastMessage.guard';
import { LanguageGuard } from 'src/common/guards/language.guard';
import { Category } from 'src/common/database/schemas/category.schema';
import { Markup } from 'telegraf';

@UseGuards(AdminGuard)
@UseGuards(LanguageGuard)
@UseGuards(LastMessageGuard)
@Update()
export class AdminActions {
  constructor(
    @InjectModel(Referal.name) private referalModel: Model<Referal>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
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
  async listOfCategories(@Ctx() ctx: MyContext, page: number = 0) {
    const PAGE_SIZE = 10;
    const BUTTONS_PER_ROW = 5;

    const categories = await this.categoryModel.find();
    const totalPages = Math.ceil(categories.length / PAGE_SIZE);

    const startIndex = page * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const visibleCategories = categories.slice(startIndex, endIndex);

    let text: string = existsCategories[ctx.session.lang] as string;
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
            `selectedCategory=${c._id}`,
          ),
        );
      buttons.push(row);
    }

    const navButtons: any[] = [];
    if (totalPages > 1) {
      if (page > 0) {
        navButtons.push(
          Markup.button.callback('◀️', `categoryPage=${page - 1}`),
        );
      }
      if (page < totalPages - 1) {
        navButtons.push(
          Markup.button.callback('▶️', `categoryPage=${page + 1}`),
        );
      }
    }

    if (navButtons.length > 0) {
      buttons.push(navButtons);
    }

    buttons.push([Markup.button.callback('⬅️ Orqaga', 'backFromCategoryList')]);

    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(buttons as []),
    });
  }

  @Action(/categoryPage=(\d+)/)
  async onPageChange(@Ctx() ctx: MyContext) {
    const page = (
      ctx.update as { callback_query: { data: string } }
    ).callback_query.data.split('=')[1];
    await this.listOfCategories(ctx, +page);
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
    console.log(category);
  }
}
