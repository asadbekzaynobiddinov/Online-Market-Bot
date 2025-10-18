import * as dotenv from 'dotenv';
dotenv.config();

export type ConfigType = {
  PORT: number;
  TOKEN: string;
  ERROR_CHANNEL: string;
  DATABASE_URL: string;
  BOT_USERNAME?: string;
};

export const config: ConfigType = {
  PORT: Number(process.env.PORT),
  TOKEN: process.env.TOKEN as string,
  ERROR_CHANNEL: process.env.ERROR_CHANNEL as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
  BOT_USERNAME: process.env.BOT_USERNAME as string,
};
