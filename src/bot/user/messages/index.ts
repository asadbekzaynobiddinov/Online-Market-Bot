import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, UseGuards } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Update, On, Ctx } from 'nestjs-telegraf';
import { Model } from 'mongoose';
import { MyContext } from 'src/common/types';
import { User } from 'src/common/database/schemas/user.schema';
import {
  adminMenu,
  askPhoneNumber,
  chooseDepartment,
  contactText,
  uncorrectPhoneMessage,
  noAdminRights,
  referalMenu,
  categoryMenu,
  askProductPrice,
  uncorrectPrice,
  askProductDeskription,
  askProductPicture,
  askProductUnit,
  askProductQuantity,
  uncorrectQuantity,
  categoryName,
  categoryInline,
  editCategoryMenu,
  productmenu,
} from 'src/common/constants';
import { Markup } from 'telegraf';
import { Category } from 'src/common/database/schemas/category.schema';
import { Product } from 'src/common/database/schemas/products.schema';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { LanguageGuard } from 'src/common/guards/language.guard';

@Update()
export class UserMessages {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private cateoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}
  @On('text')
  async handleText(@Ctx() ctx: MyContext) {
    let user: User | undefined | null = await this.cache.get(
      `user-${ctx.from?.id}`,
    );
    if (user == undefined) {
      user = await this.userModel.findOne({ telegramId: ctx.from?.id });
      if (user == null) {
        await ctx.reply(
          "Iltimos, botdan foydalanishni boshlash uchun /start buyrug'ini bering.",
        );
        return;
      }
      await this.cache.set(`user-${ctx.from?.id}`, user);
    }
    const text = (ctx.update as { message: { text: string } }).message.text;

    switch (text) {
      case '/admin': {
        if (!user || user.role != 'admin') {
          await ctx.reply(noAdminRights[user.lang] as string, {
            parse_mode: 'HTML',
          });
          return;
        }
        await ctx.reply(chooseDepartment[user.lang] as string, {
          reply_markup: adminMenu[user.lang],
        });
        return;
      }
      case '🔗 Referal tizimi':
      case '🔗 Реферал тизими':
        if (user.role != 'admin') return;
        ctx.session.lastMessage = await ctx.reply(
          chooseDepartment[user.lang] as string,
          {
            reply_markup: {
              inline_keyboard: [...referalMenu[user.lang].inline_keyboard],
            },
          },
        );
        return;
      case "📂 Kategoriyalar Bo'limi":
      case '📂 Категориялар бўлими':
        if (user.role != 'admin') return;
        ctx.session.lastMessage = await ctx.reply(
          chooseDepartment[user.lang] as string,
          {
            reply_markup: {
              inline_keyboard: [...categoryMenu[user.lang].inline_keyboard],
            },
          },
        );
        return;
      case "🛒 Mahsulotlar Bo'limi":
      case '🛒 Маҳсулотлар бўлими':
        if (user.role != 'admin') return;
        ctx.session.lastMessage = await ctx.reply(
          chooseDepartment[user.lang] as string,
          {
            reply_markup: productmenu[user.lang],
          },
        );
    }

    switch (ctx.session.admin.lastState) {
      case 'awaitCategoryName': {
        const categoryName = (ctx.update as { message: { text: string } })
          .message.text;
        await this.cateoryModel.create({
          name: categoryName,
        });
        ctx.session.lastMessage = await ctx.reply(
          chooseDepartment[user.lang] as string,
          {
            reply_markup: categoryMenu[user.lang],
          },
        );
        return;
      }
      case 'awaitNewCategoryName': {
        const newCategoryName = (ctx.update as { message: { text: string } })
          .message.text;
        await this.cateoryModel.findByIdAndUpdate(
          {
            _id: ctx.session.admin.selectedCategoryId,
          },
          {
            name: newCategoryName,
          },
        );
        ctx.session.lastMessage = await ctx.reply(
          chooseDepartment[user.lang] as string,
          {
            reply_markup: editCategoryMenu[user.lang],
          },
        );
        return;
      }
      case 'addingProduct': {
        const product = await this.productModel.findById(
          ctx.session.admin.newProductId,
        );
        if (!product) return;
        switch (product.lastState) {
          case 'awaitName': {
            const productName = (ctx.update as { message: { text: string } })
              .message.text;
            product.name = productName;
            product.lastState = 'awaitPrice';
            await product.save();
            await ctx.reply(askProductPrice[user.lang] as string);
            return;
          }
          case 'awaitPrice': {
            const productPrice = (ctx.update as { message: { text: string } })
              .message.text;
            const correctPrice = productPrice.match(/^[0-9]+$/);
            if (!correctPrice) {
              await ctx.reply(uncorrectPrice[user.lang] as string);
              return;
            }
            product.price = +productPrice;
            product.lastState = 'awaitDescription';
            await product.save();
            await ctx.reply(askProductDeskription[user.lang] as string);
            return;
          }
          case 'awaitDescription': {
            const desription = (ctx.update as { message: { text: string } })
              .message.text;
            product.description = desription;
            product.lastState = 'awaitPicture';
            await product.save();
            await ctx.reply(askProductPicture[user.lang] as string);
            return;
          }
          case 'awaitUnit': {
            const unit = (ctx.update as { message: { text: string } }).message
              .text;
            product.unit = unit;
            product.lastState = 'awaitQuantity';
            await product.save();
            await ctx.reply(askProductQuantity[user.lang] as string);
            return;
          }
          case 'awaitQuantity': {
            const quantity = (ctx.update as { message: { text: string } })
              .message.text;
            const correctQuantity = quantity.match(/^[0-9]+$/);
            if (!correctQuantity) {
              await ctx.reply(uncorrectQuantity[user.lang] as string);
              return;
            }
            product.quantity = +quantity;
            product.lastState = 'fullfilled';
            await product.save();
            ctx.session.admin.lastState = '';
            const category = await this.cateoryModel.findById(
              product.categoryId,
            );
            ctx.session.lastMessage = await ctx.reply(
              `${category?.name} ${categoryName[user.lang]}`,
              {
                reply_markup: categoryInline[user.lang],
              },
            );
          }
        }
      }
    }

    switch (user.lastState) {
      case 'awaitName':
        user.name = text;
        user.lastState = 'awaitNumber';
        await this.cache.set(`user-${ctx.from?.id}`, user);
        await ctx.reply(askPhoneNumber[user.lang] as string, {
          reply_markup: {
            keyboard: [
              [Markup.button.contactRequest(contactText[user.lang] as string)],
            ],
            one_time_keyboard: true,
            resize_keyboard: true,
          },
          parse_mode: 'HTML',
        });
        return;
      case 'awaitNumber': {
        const correctPhone = text.match(/^\+998[0-9]{9}$/);
        if (!correctPhone) {
          await ctx.reply(uncorrectPhoneMessage[user.lang] as string);
          return;
        }
        user.phoneNumber = text;
        user.lastState = 'active';
        await this.userModel.create(user);
        await this.cache.set(`user-${ctx.from?.id}`, user);
        await ctx.reply(
          "Siz muvaffaqiyatli ro'yxatdan o'tdingiz!",
          Markup.removeKeyboard(),
        );
        return;
      }
      default:
        break;
    }
  }

  @On('contact')
  async handleContact(@Ctx() ctx: MyContext) {
    const user: User | undefined = await this.cache.get(`user-${ctx.from?.id}`);
    if (user == undefined) return;
    const contact = (
      ctx.update as { message: { contact: { phone_number: string } } }
    ).message.contact;
    if (user.lastState !== 'awaitNumber') return;
    user.phoneNumber = contact.phone_number;
    user.lastState = 'active';
    await this.userModel.create(user);
    await this.cache.set(`user-${ctx.from?.id}`, user);
    await ctx.reply(
      "Siz muvaffaqiyatli ro'yxatdan o'tdingiz!",
      Markup.removeKeyboard(),
    );
  }

  @UseGuards(AdminGuard)
  @UseGuards(LanguageGuard)
  @On('photo')
  async handlePhoto(@Ctx() ctx: MyContext) {
    if (ctx.session.admin.lastState !== 'addingProduct') return;
    const product = await this.productModel.findById(
      ctx.session.admin.newProductId,
    );
    if (!product) return;
    const photos = (ctx.update as { message: { photo: { file_id: string }[] } })
      .message.photo;
    const fileId = photos[photos.length - 1].file_id;
    product.imageUrl = fileId;
    product.lastState = 'awaitUnit';
    await product.save();
    await ctx.reply(askProductUnit[ctx.session.lang] as string);
  }
}
