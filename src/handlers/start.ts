import { Bot, Context } from "grammy";
import { mainMenu } from "../constants/keyboards.js";

export function registerStartHandler(bot: Bot): void {
  bot.command("start", (ctx: Context) => {
    console.log(
      "`/start` command received from user:",
      ctx.from?.username || ctx.from?.id,
    ); // Add this line
    ctx.reply(
      "👋 به ربات حسابداری خوش آمدید!\n\n📊 *موجودی‌ها* → مشاهده موجودی شیت balances\n➕ *ثبت تراکنش* → افزودن ردیف به شیت ledger",
      { reply_markup: mainMenu, parse_mode: "Markdown" },
    );
  });
}
