/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { config } from 'src/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../database/schemas/user.schema';
import { MyContext } from '../types';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly bot: Telegraf;

  constructor(@InjectModel(User.name) private adminRepo: Model<User>) {
    this.bot = new Telegraf(config.TOKEN);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx: MyContext = context.getArgs()[0];
    const admin = await this.adminRepo.findOne({
      telegramId: ctx.from?.id,
    });
    if (!admin || admin.role !== 'admin') {
      return false;
    }
    return true;
  }
}
