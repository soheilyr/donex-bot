import { Bot } from "grammy";

import { config } from "./config.js";

import { registerStartHandler } from "./handlers/start.js";
import {
  registerDonexBalances,
  registerUserBalances,
} from "./handlers/balances.js";
import { registerTransactionHandlers } from "./handlers/transactions.js";

if (!config.botToken || !config.spreadsheetId) {
  console.error("❌ متغیرهای محیطی ناقص‌اند. فایل .env را بررسی کنید.");
  process.exit(1);
}

const bot = new Bot(config.botToken);

// Error handling
bot.catch((err) => {
  console.error("❌ Bot error:", err.error);
});

// 1. Log EVERY update
bot.use(async (ctx, next) => {
  console.log("📨 UPDATE RECEIVED");
  console.log("   Update ID:", ctx.update.update_id);
  console.log("   From:", ctx.from?.id, ctx.from?.username ? `(@${ctx.from.username})` : "");
  console.log("   Text:", ctx.message?.text || ctx.callbackQuery?.data);

  await next();
});

// 2. Auth / Whitelist Middleware (فقط به شما و ادمین‌های مجاز پاسخ می‌دهد)
const allowedUserIds: number[] = (process.env.ALLOWED_USER_IDS || "")
  .split(",")
  .map((id) => Number(id.trim()))
  .filter((id) => !isNaN(id) && id > 0);

bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;

  if (!userId || !allowedUserIds.includes(userId)) {
    console.warn(`⛔ Unauthorized access attempt from User ID: ${userId}`);
    // هیچ واکنشی نشان نده (سکوت کامل)
    return;
  }

  await next();
});

// 3. Register Specific handlers
registerStartHandler(bot);
registerUserBalances(bot);
registerDonexBalances(bot);
registerTransactionHandlers(bot);

async function main() {
  console.log("🚀 Starting bot...");
  console.log("🔑 Token:", config.botToken ? "✅ Found" : "❌ Missing");
  console.log("👥 Allowed Users:", allowedUserIds.length > 0 ? allowedUserIds : "⚠️ None (Nobody can use the bot!)");

  await bot.start({
    onStart: (botInfo) => {
      console.log(`🤖 Bot started successfully: @${botInfo.username}`);
      console.log("⏳ Waiting for Telegram updates...");
    },
  });
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
});
