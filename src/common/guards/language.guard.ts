/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Telegraf } from 'telegraf';
import { config } from 'src/config';
import { User } from '../database/schemas/user.schema';
import { MyContext } from '../types';

@Injectable()
export class LanguageGuard implements CanActivate {
  private readonly bot: Telegraf;

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    this.bot = new Telegraf(config.TOKEN);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx: MyContext = context.getArgs()[0];
    let user: User | undefined | null = await this.cache.get(
      `user-${ctx.from?.id}`,
    );
    if (!user) {
      user = await this.userModel.findOne({ telegramId: ctx.from?.id });
      if (!user) return false;
    }
    ctx.session.lang = user.lang;
    return true;
  }
}
