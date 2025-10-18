import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Update, Ctx, Start } from 'nestjs-telegraf';
import { Model } from 'mongoose';
import { MyContext } from 'src/common/types';
import { adminMenu, chooseDepartment, helloUser } from 'src/common/constants';
import { User } from 'src/common/database/schemas/user.schema';
import { Markup } from 'telegraf';
import { Inject } from '@nestjs/common';
import { Referal } from 'src/common/database/schemas/referal.schema';
import { config } from 'src/config';

@Update()
export class UserCommands {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Referal.name) private referalModel: Model<Referal>,
  ) {}
  @Start()
  async start(@Ctx() ctx: MyContext): Promise<string | void> {
    const referal = (ctx.update as { message: { text: string } }).message.text
      .replace('/', `https://t.me/${config.BOT_USERNAME}?`)
      .replace(' ', '=');
    const isReferred = await this.referalModel.findOne({
      referalBody: referal,
    });
    const user = await this.userModel.findOne({
      telegramId: ctx.from?.id,
    });
    const cachedUser: User | undefined = await this.cache.get(
      `user-${ctx.from?.id}`,
    );
    if (!user && cachedUser == undefined) {
      const newUser = {
        telegramId: ctx.from?.id,
        username: ctx.from?.username || 'unknown',
        lastState: 'awaitLang',
        role: isReferred ? 'admin' : 'user',
      };
      await this.cache.set(`user-${ctx.from?.id}`, newUser);
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
    if (!isReferred) return;
    await this.userModel.findOneAndUpdate(
      { telegramId: ctx.from?.id },
      { role: isReferred ? 'admin' : 'user' },
    );
    if (user) {
      user.role = isReferred ? 'admin' : 'user';
      await this.cache.set(`user-${ctx.from?.id}`, user);
    }
    if (isReferred) {
      if (cachedUser && cachedUser.lang) {
        await ctx.reply(chooseDepartment[cachedUser.lang] as string, {
          reply_markup: adminMenu[cachedUser.lang],
        });
      } else {
        await ctx.reply(chooseDepartment.uz, {
          reply_markup: adminMenu['uz'],
        });
      }
    }
  }
}
