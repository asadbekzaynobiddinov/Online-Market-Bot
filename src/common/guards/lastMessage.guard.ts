/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { config } from 'src/config';
import { MyContext } from '../types';
import { lastMessageText } from '../constants';

@Injectable()
export class LastMessageGuard implements CanActivate {
  private readonly bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(config.TOKEN);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx: MyContext = context.getArgs()[0];
    // let user: User | undefined | null = await this.cache.get(
    //   `user-${ctx.from?.id}`,
    // );
    // if (!user) {
    //   user = await this.userModel.findOne({ telegramId: ctx.from?.id });
    //   if (!user) return false;
    // }
    const update = ctx.update as unknown as {
      callback_query: {
        id: string;
        from: Record<string, any>;
        message: Record<string, any>;
        chat_instance: string;
        data: string;
      };
    };

    if (
      ctx.session.lastMessage &&
      update.callback_query.message.message_id !=
        ctx.session.lastMessage.message_id
    ) {
      await ctx.answerCbQuery(lastMessageText[ctx.session.lang] as string, {
        show_alert: true,
      });
      await ctx.deleteMessage(
        update.callback_query.message.message_id as number,
      );
      return false;
    }
    return true;
  }
}
