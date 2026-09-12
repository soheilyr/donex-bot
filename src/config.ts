import "dotenv/config";

export const config = {
  botToken: process.env.BOT_TOKEN!,
  spreadsheetId: process.env.SPREADSHEET_ID!,
  balancesSheetId:process.env.BALANCES_SHEET_ID!,
  googleClientEmail: process.env.GOOGLE_SA_EMAIL!,
  googlePrivateKey: (process.env.GOOGLE_SA_PRIVATE_KEY ?? "").replace(
    /\\n/g,
    "\n",
  ),
} as const;

export const SHEETS = {
  LEDGER: "ledger",
  BALANCES: "balances",
} as const;

/** ستون‌های شیت ledger: date | description | type | amount | balance_after */
export const LEDGER_COLUMNS = 5;
