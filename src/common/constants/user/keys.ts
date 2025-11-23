import { Markup } from 'telegraf';
import {
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
} from 'telegraf/typings/core/types/typegram';

export const userMenu: Record<string, ReplyKeyboardMarkup> = {
  uz: {
    keyboard: [
      [Markup.button.text('🛍️ Mahsulotlar')],
      [Markup.button.text('🛒 Savat')],
      [Markup.button.text('📦 Buyurtmalar tarixi')],
      [Markup.button.text("🌐 Tilni o'zgartirish")],
    ],
    resize_keyboard: true,
  },
  kr: {
    keyboard: [
      [Markup.button.text('🛍️ Маҳсулотлар')],
      [Markup.button.text('🛒 Сават')],
      [Markup.button.text('📦 Буюртмалар тарихи')],
      [Markup.button.text('🌐 Тилни ўзгартириш')],
    ],
    resize_keyboard: true,
  },
};

export const chooseLanguageUser: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback("🇺🇿 O'zbekcha", 'setUserLangUz')],
    [Markup.button.callback('🇺🇿 Ўзбекча', 'setUserLangUzKrill')],
  ],
};
