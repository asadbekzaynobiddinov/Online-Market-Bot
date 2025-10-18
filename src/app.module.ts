import { Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BotModule } from './bot/bot.module';
import { DatabaseModule } from './common/database';

@Module({
  imports: [
    BotModule,
    DatabaseModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 86400,
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
