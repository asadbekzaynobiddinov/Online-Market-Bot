import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'src/config';

@Module({
  imports: [MongooseModule.forRoot(config.DATABASE_URL)],
})
export class DatabaseModule {}
