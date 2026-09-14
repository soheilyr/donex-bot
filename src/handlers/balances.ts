import { Bot } from "grammy";
import { sheetsService } from "../services/googleSheets.js";
import { formatBalances } from "../services/ledger.js";
import { InlineKeyboard } from "grammy";
import {
  formatSinglePersonBalance,
  aggregateBalancesByPerson,
} from "../services/balanceAggregator.js";

export function registerUserBalances(bot: Bot): void {
  bot.hears("💼 موجودی حساب‌ها", async (ctx) => {
    try {
      const balances = await sheetsService.getBalances();
      const formattedMessage = formatBalances(balances);

      // استخراج لیست منحصربه‌فرد اسامی جهت ساخت دکمه‌های اینلاین
      const personMap = aggregateBalancesByPerson(balances);
      const keyboard = new InlineKeyboard();

      let count = 0;
      for (const personName of personMap.keys()) {
        keyboard.text(`👤 ${personName}`, `person_balance:${personName}`);
        count++;
        if (count % 2 === 0) keyboard.row(); // هر ۲ دکمه در یک سطر
      }

      await ctx.reply(formattedMessage, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("Error fetching balances:", error);
      await ctx.reply("❌ در دریافت اطلاعات موجودی مشکلی پیش آمد.");
    }
  });

  // هندلر کلیک روی دکمه‌های اینلاین اشخاص
  bot.callbackQuery(/^person_balance:(.+)$/, async (ctx) => {
    const personName = ctx.match[1];
    try {
      const balances = await sheetsService.getBalances();
      const personReport = formatSinglePersonBalance(personName, balances);

      await ctx.answerCallbackQuery(); // بستن حالت loading دکمه
      await ctx.reply(personReport, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("Error generating person balance:", error);
      await ctx.answerCallbackQuery({
        text: "خطا در دریافت موجودی شخص",
      });
    }
  });
}

export function registerDonexBalances(bot: Bot): void {
  bot.hears("✅ موجودی دانکس", async (ctx) => {
    try {
      const balances = await sheetsService.getDonexBalances();
      const formattedMessage = formatBalances(balances);

      await ctx.reply(formattedMessage, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("Error fetching balances:", error);
      await ctx.reply("❌ در دریافت اطلاعات موجودی مشکلی پیش آمد.");
    }
  });
}

export function registerSourceBalancesHandler(bot: Bot): void {
  bot.hears("موجودی صراف ها 💱", async (ctx) => {
    try {
      const balances = await sheetsService.getDonexSourceBalances();
      const formattedMessage = formatBalances(balances);

      await ctx.reply(formattedMessage, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("Error fetching balances:", error);
      await ctx.reply("❌ در دریافت اطلاعات موجودی مشکلی پیش آمد.");
    }
  });
}
