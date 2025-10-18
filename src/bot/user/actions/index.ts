import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { Action, Update, Ctx } from 'nestjs-telegraf';
import { MyContext } from 'src/common/types';
import { askName } from 'src/common/constants';
import { User } from 'src/common/database/schemas/user.schema';
import { Inject } from '@nestjs/common';

@Update()
export class UserActions {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}
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
    cachedUser.lastState = 'awaitName';
    await this.cache.set(`user-${ctx.from?.id}`, cachedUser);
    await ctx.editMessageText(askName.uz);
  }
}
