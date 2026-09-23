import { Balance } from "./googleSheets.js";

export interface PersonBalanceSummary {
  name: string;
  balances: { unit: string; amount: number }[];
}

/**
 * دریافت لیست تمام اشخاص و موجودی‌هایشان به تفکیک ارز
 */
export function aggregateBalancesByPerson(
  balances: Balance[],
): Map<string, Map<string, number>> {
  // ساختاری به صورت: Map<PersonName, Map<CurrencyUnit, TotalAmount>>
  const personMap = new Map<string, Map<string, number>>();

  for (const b of balances) {
    const name = b.name.trim();
    const amount = parseNumber(b.remain);
    const unit = b.unit.trim();

    if (!personMap.has(name)) {
      personMap.set(name, new Map());
    }

    const userUnits = personMap.get(name)!;
    const currentAmount = userUnits.get(unit) || 0;
    userUnits.set(unit, currentAmount + amount);
  }

  return personMap;
}

/**
 * فرمت‌دهی گزارش اختصاصی برای یک شخص خاص
 */
export function formatSinglePersonBalance(
  personName: string,
  balances: Balance[],
  titlePrefix: string = "DONEX",
): string {
  const aggregated = aggregateBalancesByPerson(balances);

  // جستجوی بدون حساسیت به حروف بزرگ/کوچک (Case-Insensitive)
  const targetKey = Array.from(aggregated.keys()).find(
    (k) => k.toLowerCase() === personName.toLowerCase(),
  );

  if (!targetKey) {
    return `❌ هیچ حسابی برای شخص **${personName}** یافت نشد.`;
  }

  const userBalances = aggregated.get(targetKey)!;

  // تاریخ و زمان جاری به شمسی
  const now = new Date();
  const persianDate = now.toLocaleDateString("fa-IR", {
    timeZone: "Asia/Tehran",
  });
  const persianTime = now.toLocaleTimeString("fa-IR", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines: string[] = [];
  lines.push(`👤 **موجودی ${titlePrefix}-${targetKey.toUpperCase()}**`);
  lines.push(`📅 تا تاریخ ${persianDate} ساعت ${persianTime}:\n`);

  let hasNonZero = false;

  for (const [unit, amount] of userBalances.entries()) {
    // نمایش تمام ارزها یا فقط ارزهای دارای موجودی
    const formattedAmount = formatNumber(amount);
    const label = unitLabel(unit);
    lines.push(`• \`${formattedAmount}\` ${label}`);
    if (amount !== 0) hasNonZero = true;
  }

  if (userBalances.size === 0) {
    lines.push("هیچ تراز مالی یافت نشد.");
  }
  lines.join("\n");
lines.push(
    "عرض ادب و احترام لطفا نسبت به تایید یا عدم تایید مانده حساب خود اقدام فرمایید.\n",
  );
  return ""
}

/** تبدیل عدد متنی به عدد پردازشی */
function parseNumber(value: string | number): number {
  return Number(String(value).replace(/[,\s]/g, "")) || 0;
}

/** فرمت‌دهی اعداد با جداکننده کاما */
function formatNumber(value: number): string {
  return value % 1 === 0
    ? value.toLocaleString("fa-IR")
    : value.toLocaleString("fa-IR", { maximumFractionDigits: 2 });
}

/** عنوان فارسی واحدهای ارزی */
function unitLabel(unit: string): string {
  const labels: Record<string, string> = {
    IRT: "تومان",
    USDT: "تتر",
    AED: "درهم امارات",
    Yuan: "یوان چین",
    USD: "دلار آمریکا",
  };
  return labels[unit] ?? unit;
}
