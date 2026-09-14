import { Keyboard, InlineKeyboard } from "grammy";

// ── منوی اصلی (Reply Keyboard) ──
export const mainMenu = Keyboard.from([
  ["➕ ثبت تراکنش", "💼 موجودی حساب‌ها"],
  ["✅ موجودی دانکس" , "موجودی صراف ها 💱"],
]).resized();

// ── زیرمنوی ثبت تراکنش ──
export const txTypeMenu = new InlineKeyboard()
  .text("⬆️ واریز", "tx:deposit")
  .text("⬇️ برداشت", "tx:withdraw")
  .row()
  .text("❌ انصراف", "tx:cancel");

export const confirmMenu = new InlineKeyboard()
  .text("✅ تایید", "tx:confirm")
  .text("❌ انصراف", "tx:cancel");

export const txActions = {
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw",
} as const;

export type TxAction = (typeof txActions)[keyof typeof txActions];
