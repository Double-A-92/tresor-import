export enum ActivityType {
  BUY = 'Buy',
  SELL = 'Sell',
  DIVIDEND = 'Dividend',
  TRANSFER_IN = 'TransferIn',
  TRANSFER_OUT = 'TransferOut',
  PAYBACK = 'Payback',
  TAX_DIVIDEND = 'TaxDividend',
}

export type ActivityTypeUnion =
  | 'Buy'
  | 'Sell'
  | 'Dividend'
  | 'TransferIn'
  | 'TransferOut'
  | 'Payback'
  | 'TaxDividend';

export enum ParserStatus {
  SUCCESS = 0,
  UNKNOWN_IMPLEMENTATION = 1,
  AMBIGUOUS_IMPLEMENTATION = 2,
  FATAL_ERROR = 3,
  UNSUPPORTED_FILETYPE = 4,
  NO_ACTIVITIES = 5,
  MISSING_IMPLEMENTATION = 6,
  INVALID_DOCUMENT = 7,
}

export interface Activity {
  broker: string;
  type: ActivityTypeUnion;
  /** @deprecated */
  date: Date | string;
  datetime: Date | string;
  isin?: string;
  wkn?: string;
  company: string;
  shares?: number;
  price?: number;
  amount: number;
  fee: number = 0;
  tax: number = 0;
  foreignCurrency?: string;
  fxRate?: number;
  currency?: string;
}

export interface Implementation {
  canParseDocument(pages: Page[], extension: string): boolean;
  parsePages(contents): ParserResult;
  parsingIsTextBased(): boolean;
}

export interface ParserResult {
  activities?: Activity[];
  status: ParserStatus;
}

export type Page = string[];

export interface ParsedFile {
  pages: Page[];
  extension: string;
}

export as namespace Importer;
