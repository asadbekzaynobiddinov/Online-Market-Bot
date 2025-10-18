import { Markup } from 'telegraf';
import {
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
} from 'telegraf/typings/core/types/typegram';

export const adminMenu: Record<string, ReplyKeyboardMarkup> = {
  uz: {
    keyboard: [
      [Markup.button.text('🔗 Referal tizimi')],
      [Markup.button.text("📂 Kategoriyalar Bo'limi")],
      [Markup.button.text("🛒 Mahsulotlar Bo'limi")],
      [Markup.button.text('⚙️ Sozlamalar')],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
  kr: {
    keyboard: [
      [Markup.button.text('🔗 Реферал тизими')],
      [Markup.button.text('📂 Категориялар бўлими')],
      [Markup.button.text('🛒 Маҳсулотлар бўлими')],
      [Markup.button.text('⚙️ Созламалар')],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

export const referalMenu: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('➕ Referal qo‘shish', 'addReferal')],
      [Markup.button.callback('📋 Referallar ro‘yxati', 'listOfReferals')],
    ],
  },
  kr: {
    inline_keyboard: [
      [Markup.button.callback('➕ Реферал қўшиш', 'addReferal')],
      [Markup.button.callback('📋 Рефераллар рўйхати', 'listOfReferals')],
    ],
  },
};

export const categoryMenu: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback("➕ Kategoriya qo'shish", 'addCategory')],
      [Markup.button.callback("📋 Kategoriyalar ro'yxati", 'listOfCategories')],
    ],
  },
  kr: {
    inline_keyboard: [
      [Markup.button.callback('➕ Категория қўшиш', 'addCategory')],
      [Markup.button.callback('📋 Категориялар рўйхати', 'listOfCategories')],
    ],
  },
};

export const addProductmenu: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback("➕ Mahsulot qo'shish", 'addProduct')],
      [Markup.button.callback("📋 Mahsulotlar ro'yxati", 'listOfProducts')],
    ],
  },
  kr: {
    inline_keyboard: [
      [Markup.button.callback('➕ Маҳсулот қўшиш', 'addProduct')],
      [Markup.button.callback('📋 Маҳсулотлар рўйхати', 'listOfProducts')],
    ],
  },
};

export const backFromReferalList: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('⬅️ Orqaga', 'backFromReferalList')],
    ],
  },
  kr: {
    inline_keyboard: [
      [Markup.button.callback('⬅️ Орқага', 'backFromReferalList')],
    ],
  },
};
