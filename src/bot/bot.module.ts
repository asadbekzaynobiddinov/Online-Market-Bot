/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { config } from 'src/config';

@Module({
  imports: [
    UserModule,
    AdminModule,
    TelegrafModule.forRoot({
      token: config.TOKEN,
      middlewares: [
        session(),
        async (ctx, next) => {
          if (!ctx.session) {
            ctx.session = {};
            if (!ctx.session.admin) {
              ctx.session.admin = {};
            }
          }
          await next();
        },
      ],
    }),
  ],
})
export class BotModule {}
