import { sheetsService, type LedgerEntry } from "./googleSheets.js";
import { txActions, type TxAction } from "../constants/keyboards.js";

/** قالب پیام موجودی‌ها */
import { Balance } from "../services/googleSheets.js"; // فرض: اینترفیس Balance بشکل درست

export function formatBalances(balances: Balance[]): string {
  if (balances.length === 0) return "📭 هیچ موجودی‌ای ثبت نشده است.";

  // دسته‌بندی بر اساس واحد ارزی
  const grouped = new Map<string, Balance[]>();

  for (const b of balances) {
    const unit = b.unit || "دیگر";
    if (!grouped.has(unit)) grouped.set(unit, []);
    grouped.get(unit)!.push(b);
  }

  const lines: string[] = [];

  // مرتب‌سازی واحدها (مثلاً IRT اول بیاد)
  const unitOrder = ["IRT", "USDT", "AED", "Yuan", "USD"];
  const visited = new Set<string>();

  for (const unit of unitOrder) {
    if (!grouped.has(unit)) continue;
    visited.add(unit);
    lines.push(`\n**${unitLabel(unit)}**`);

    const sorted = grouped.get(unit)!.sort((a, b) => {
      return parseNumber(b.remain) - parseNumber(a.remain);
    });
    let total = 0;
    sorted.forEach((b, i) => {
      total += parseNumber(b.remain);
      lines.push(
        `\`\`\`\n  ${i + 1}. ${b.name}: \`${formatNumber(b.remain)} ${b.unit}\` \n\`\`\``,
      );
    });
    lines.push(
      `\n **مجموع (${unit}): ${formatNumber(total)}**\n -----------------------------------`,
    );
  }

  // واحدهای دیگه که در لیست ترتیب نبودند
  for (const [unit, list] of grouped) {
    if (visited.has(unit)) continue;
    lines.push(`\n**${unitLabel(unit)}**`);
    const sorted = list.sort(
      (a, b) => parseNumber(b.remain) - parseNumber(a.remain),
    );
    sorted.forEach((b, i) => {
      lines.push(
        `  ${i + 1}. ${b.name}: \`${formatNumber(b.remain)} ${b.unit}\``,
      );
    });
  }

  return ["💼 *موجودی حساب‌ها*\n", ...lines].join("\n");
}

/** تبدیل عدد متنی با کاما به عدد واقعی */
function parseNumber(value: string | number): number {
  return Number(String(value).replace(/[,\s]/g, "")) || 0;
}

/** نمایش اعداد با جداکننده کاما، بدون `.0` اضافی */
function formatNumber(value: string | number): string {
  const n = parseNumber(value);
  return n % 1 === 0
    ? n.toLocaleString("en-US")
    : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** برچسب فارسی واحدها */
function unitLabel(unit: string): string {
  const labels: Record<string, string> = {
    IRT: "💰 ریال ایران (IRT)",
    USDT: "🪙 تتر (USDT)",
    AED: "درهم امارات (AED) 🇦🇪",
    Yuan: "یوان چین (Yuan) 🇨🇳",
    USD: "دلار آمریکا (USD) 🇺🇸",
  };
  return labels[unit] ?? `🔹 ${unit}`;
}

/** ساخت entry از ورودی کاربر و ذخیره در شیت ledger */
export async function recordTransaction(
  action: TxAction,
  amount: number,
  description?: string,
): Promise<void> {
  const entry: LedgerEntry = {
    date: new Date().toLocaleDateString("fa-IR"),
    description:
      description?.trim() || (action === txActions.DEPOSIT ? "واریز" : "برداشت"),
    type: action === txActions.DEPOSIT ? "deposit" : "withdraw",
    amount: action === txActions.DEPOSIT ? amount : -amount,
  };

  await sheetsService.appendLedger(entry);
}
