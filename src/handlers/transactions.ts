import { Bot, Context } from "grammy";
import {
  mainMenu,
  txTypeMenu,
  confirmMenu,
  txActions,
} from "../constants/keyboards.js";
import { recordTransaction } from "../services/ledger.js";
import type { TxAction } from "../constants/keyboards.js";

/** state در حافظه برای فلوی ۳ مرحله‌ای (برای v1.0.0 کافیه) */
interface TxSession {
  description?: string;
  action: TxAction;
  amount?: number;
}
const sessions = new Map<number, TxSession>();

export function registerTransactionHandlers(bot: Bot): void {
  // ورود به فلوی ثبت تراکنش
  bot.hears("➕ ثبت تراکنش", (ctx) => {
    sessions.delete(ctx.from!.id);
    ctx.reply("نوع تراکنش را انتخاب کنید:", { reply_markup: txTypeMenu });
  });

  bot.callbackQuery("tx:deposit", (ctx) => startStep(ctx, txActions.DEPOSIT));
  bot.callbackQuery("tx:withdraw", (ctx) => startStep(ctx, txActions.WITHDRAW));
  bot.callbackQuery("tx:cancel", (ctx) => {
    sessions.delete(ctx.from!.id);
    ctx.reply("❌ لغو شد.", { reply_markup: mainMenu });
  });

  bot.callbackQuery("tx:confirm", async (ctx) => {
    const session = sessions.get(ctx.from!.id);
    if (!session?.amount) return ctx.reply("⚠️ ابتدا تراکنش را شروع کنید.");

    try {
      await recordTransaction(
        session.action,
        session.amount,
        session?.description ?? "",
      );
      await ctx.editMessageText(
        `✅ تراکنش ثبت شد:\n${session.action === txActions.DEPOSIT ? "⬆️ واریز" : "⬇️ برداشت"} ${session.amount.toLocaleString("fa-IR")}`,
      );
      ctx.reply("منوی اصلی:", { reply_markup: mainMenu });
    } catch (err) {
      console.error("Tx error:", err);
      ctx.reply("⚠️ خطا در ثبت تراکنش.");
    } finally {
      sessions.delete(ctx.from!.id);
    }
  });

  async function startStep(ctx: Context, action: TxAction) {
    sessions.set(ctx.from!.id, { action });
    await ctx.editMessageText("🔢 مبلغ را وارد کنید (فقط عدد، به تومان):");
  }

  // دریافت مبلغ
  bot.on("message:text", async (ctx, next) => {
    const session = sessions.get(ctx.from!.id);
    if (!session || session.amount !== undefined) return next();

    const amount = Number(ctx.message.text.replace(/[,\s]/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      return ctx.reply("⚠️ لطفاً یک عدد معتبر وارد کنید:");
    }

    session.amount = amount;
    await ctx.reply(
      `📋 تأیید تراکنش:\n${session.action === txActions.DEPOSIT ? "⬆️ واریز" : "⬇️ برداشت"}: \`${amount.toLocaleString("fa-IR")}\`\nثبت شود؟`,
      { reply_markup: confirmMenu, parse_mode: "Markdown" },
    );
  });
}
