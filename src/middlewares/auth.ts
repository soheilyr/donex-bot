import { Context, NextFunction } from "grammy";
import "dotenv/config";

// خواندن آیدی‌های مجاز از فایل env و تبدیل به آرایه‌ای از اعداد
const allowedUserIds: number[] = (process.env.ALLOWED_USER_IDS || "")
  .split(",")
  .map((id) => Number(id.trim()))
  .filter((id) => !isNaN(id) && id > 0);

export async function authMiddleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {
  const userId = ctx.from?.id;

  // اگر شناسه کاربر در لیست سفید وجود نداشت
  if (!userId || !allowedUserIds.includes(userId)) {
    console.warn(
      `⛔ دسترسی غیرمجاز از کاربر: ${userId} (${ctx.from?.username || "بدون یوزرنیم"})`,
    );
    // دو حالت وجود دارد:
    // ۱. سکوت کامل ربات (بدون پاسخ):
    return;

    // ۲. یا اگر خواستی پیام هشدار بدهد:
    // await ctx.reply("⛔ شما دسترسی لازم برای استفاده از این ربات را ندارید.");
    // return;
  }

  // در صورت مجاز بودن، درخواست به هندلرهای بعدی منتقل می‌شود
  await next();
}
