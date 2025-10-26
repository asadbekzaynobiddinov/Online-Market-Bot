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

export const productmenu: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('📊 Statistika', 'productStats')],
      [Markup.button.callback('🔍 Qidirish', 'searchProduct')],
      [Markup.button.callback("📋 Mahsulotlar ro'yxati", 'listOfProducts')],
    ],
  },
  kr: {
    inline_keyboard: [
      [Markup.button.callback('📊 Статистика', 'productStats')],
      [Markup.button.callback('🔍 Қидириш', 'searchProduct')],
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

export const categoryInline: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('⚙️ Taxrirlash', 'editCategory')],
      [Markup.button.callback("➕ Mahsulot qo'shish", 'addProduct')],
      [Markup.button.callback('⬅️ Orqaga', 'backFromCategoryInline')],
    ],
  },
  kr: {
    inline_keyboard: [
      [Markup.button.callback('⚙️ Таҳрирлаш', 'editCategory')],
      [Markup.button.callback('➕ Маҳсулот қўшиш', 'addProduct')],
      [Markup.button.callback('⬅️ Орқага', 'backFromCategoryInline')],
    ],
  },
};

export const editCategoryMenu: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback("✏️ Nomini o'zgartirish", 'changeCategoryName')],
      [Markup.button.callback("🗑️ O'chirib yuborish", 'deleteCategory')],
      [Markup.button.callback('⬅️ Orqaga', 'backFromEditCategoryMenu')],
    ],
  },
  kr: {
    inline_keyboard: [
      [Markup.button.callback('✏️ Номини ўзгартириш', 'changeCategoryName')],
      [Markup.button.callback('🗑️ Ўчириб юбориш', 'deleteCategory')],
      [Markup.button.callback('⬅️ Орқага', 'backFromEditCategoryMenu')],
    ],
  },
};

export const productInline: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('⚙️ Taxrirlash', 'editProduct')],
      [Markup.button.callback("🗑️ O'chirib yuborish", 'deleteProduct')],
      [Markup.button.callback('⬅️ Orqaga', 'backFromProductInline')],
    ],
  },
  kr: {
    inline_keyboard: [
      [Markup.button.callback('⚙️ Таҳрирлаш', 'editProduct')],
      [Markup.button.callback('🗑️ Ўчириб юбориш', 'deleteProduct')],
      [Markup.button.callback('⬅️ Орқага', 'backFromProductInline')],
    ],
  },
};

export const editProductMenu: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback("✏️ Nomini o'zgartirish", 'changeProductName')],
      [Markup.button.callback("💸 Narxini o'zgartirish", 'changeProductPrice')],
      [
        Markup.button.callback(
          "ℹ️ Tavsifini o'zgartirish",
          'changeProductDescription',
        ),
      ],
      [Markup.button.callback("🖼️ Rasmini o'zgartirish", 'changeProductImage')],
      [
        Markup.button.callback(
          "📦 O'lchov birligini o'zgartirish",
          'changeProductUnit',
        ),
      ],
      [
        Markup.button.callback(
          "🔢 Miqdorini o'zgartirish",
          'changeProductQuantity',
        ),
      ],
      [Markup.button.callback('⬅️ Orqaga', 'backFromEditProductMenu')],
    ],
  },
};
