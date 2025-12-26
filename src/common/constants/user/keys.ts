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
      [Markup.button.text("🌐 Tilni o'zgartirish")],
    ],
    resize_keyboard: true,
  },
  kr: {
    keyboard: [
      [Markup.button.text('🛍️ Маҳсулотлар')],
      [Markup.button.text('🛒 Сават')],
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

export const backFromProductList: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('⬅️ Orqaga', 'backFromProductListforUser')],
    ],
  },
  kr: {
    inline_keyboard: [
      [Markup.button.callback('⬅️ Орқага', 'backFromProductListForUser')],
    ],
  },
};

export const productMenuForUser: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🛒 Savatga', 'addToCart')],
      [Markup.button.callback('⬅️ Orqaga', 'backFromProductForUser')],
    ],
  },
  kr: {
    inline_keyboard: [
      [Markup.button.callback('🛒 Саватга', 'addToCart')],
      [Markup.button.callback('⬅️ Орқага', 'backFromProductForUser')],
    ],
  },
};

export const buyButton: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [[Markup.button.callback('🛒 Sotib olish', 'buy')]],
  },
  kr: {
    inline_keyboard: [[Markup.button.callback('🛒 Сотиб олиш', 'buy')]],
  },
};

export const sendLocationButton: Record<string, ReplyKeyboardMarkup> = {
  uz: {
    keyboard: [[Markup.button.locationRequest('📍Manzilni yuborish')]],
    resize_keyboard: true,
  },
  kr: {
    keyboard: [[Markup.button.locationRequest('📍Манзилни юбориш')]],
    resize_keyboard: true,
  },
};
