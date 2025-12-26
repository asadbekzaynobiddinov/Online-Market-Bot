import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Update, Ctx, Start } from 'nestjs-telegraf';
import { Model } from 'mongoose';
import { MyContext } from 'src/common/types';
import { adminMenu, chooseDepartment, fullyRegister, helloUser } from 'src/common/constants';
import { User } from 'src/common/database/schemas/user.schema';
import { Markup } from 'telegraf';
import { Inject } from '@nestjs/common';
import { Referal } from 'src/common/database/schemas/referal.schema';
import { config } from 'src/config';
import { userMenu } from 'src/common/constants/user/keys';

@Update()
export class UserCommands {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Referal.name) private referalModel: Model<Referal>,
  ) {}
  @Start()
  async start(@Ctx() ctx: MyContext): Promise<void> {
    const referal = (ctx.update as { message: { text: string } }).message.text
      ?.replace('/', `https://t.me/${config.BOT_USERNAME}?`)
      .replaceAll(' ', '=');

    const isReferred = await this.referalModel.findOne({
      referalBody: referal,
    });
    let user = await this.userModel.findOne({ telegramId: ctx.from?.id });

    if (!user) {
      const newUser = {
        telegramId: ctx.from?.id,
        username: ctx.from?.username || 'unknown',
        lastState: 'awaitLang',
        role: isReferred ? 'admin' : 'user',
      };

      user = await this.userModel.create(newUser);

      await ctx.reply(helloUser, {
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback("🇺🇿 O'zbekcha", 'setLangUz')],
            [Markup.button.callback('🇺🇿 Ўзбекча', 'setLangUzKrill')],
          ],
        },
      });
      return;
    }

    if (isReferred) {
      user.role = 'admin';
      await user.save();
      await ctx.reply(chooseDepartment[user.lang] as string, {
        reply_markup: adminMenu[user.lang],
      });
      return;
    }

    if (!user.fullfilled) {
      await ctx.reply(fullyRegister[user.lang || 'uz'] as string);
      return;
    };

    const lang = user.lang || 'uz';
    if (user.role === 'admin') {
      await ctx.reply(chooseDepartment[lang] as string, {
        reply_markup: adminMenu[lang],
      });
    } else {
      await ctx.reply(chooseDepartment[lang] as string, {
        reply_markup: userMenu[lang],
      });
    }
  }
}
