import { google } from "googleapis";
import { config, SHEETS, LEDGER_COLUMNS } from "../config";

export interface LedgerEntry {
  date: string; // ISO یا شمسی — فرمت دلخواه
  description: string;
  type: "deposit" | "withdraw";
  amount: number;
}

export interface Balance {
  name: string;
  unit: string;
  remain: string;
}

class GoogleSheetsService {
  private sheets = google.sheets({ version: "v4", auth: this.auth() });

  private auth() {
    const jwt = new google.auth.JWT({
      email: config.googleClientEmail,
      key: config.googlePrivateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return jwt;
  }

  /** اضافه کردن ردیف جدید به شیت ledger */
  async appendLedger(entry: LedgerEntry): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEETS.LEDGER}!A:E`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            entry.date,
            entry.description,
            entry.type,
            entry.amount,
            new Date().toISOString(),
          ],
        ],
      },
    });
  }

  /** خواندن موجودی‌ها از شیت balances (ستون A: نام، ستون B: موجودی) */
  async getBalances(): Promise<Balance[]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.balancesSheetId,
      range: `${SHEETS.BALANCES}!A2:E`,
    });
    return (res.data.values ?? [])
      .filter(
        ([name, unit, In, Out, remain]) => name && unit && remain !== undefined,
      )
      .map(([name, unit, In, Out, remain]) => ({
        name: String(name).trim(),
        unit: String(unit),
        remain: String(remain) || "0",
      }));
  }

  async getDonexBalances(): Promise<Balance[]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.balancesSheetId,
      range: `${SHEETS.BALANCES}!M2:Q`,
    });
    return (res.data.values ?? [])
      .filter(
        ([name, unit, In, Out, remain]) => name && unit && remain !== undefined,
      )
      .map(([name, unit, In, Out, remain]) => ({
        name: String(name).trim(),
        unit: String(unit),
        remain: String(remain) || "0",
      }));
  }

  async getDonexSourceBalances(): Promise<Balance[]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.balancesSheetId,
      range: `${SHEETS.BALANCES}!G2:K`,
    });
    return (res.data.values ?? [])
      .filter(
        ([name, unit, In, Out, remain]) => name && unit && remain !== undefined,
      )
      .map(([name, unit, In, Out, remain]) => ({
        name: String(name).trim(),
        unit: String(unit),
        remain: String(remain) || "0",
      }));
  }
}

export const sheetsService = new GoogleSheetsService();
