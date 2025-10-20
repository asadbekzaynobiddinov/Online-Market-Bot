import { Context } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';

export type MyContext = Context &
  SceneContext & {
    session: {
      lang: string;
      lastMessage: any;
      admin: {
        lastState: string;
        selectedCategoryId: string;
        categoryPage: number;
        newProductId: string;
      };
    };
  };
