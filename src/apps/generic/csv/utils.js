import Big from 'big.js';
import { DateTime } from 'luxon';
import { ParqetParserError } from '@/errors';

// TODO once typescript is ready for usage in unit tests as well, replace jsDoc types with typescript signatures

/**
 *
 * @param {string} value
 * @param {string} [defaultValue] - valid ISO 8601 datetime string
 * @returns {string | undefined}
 */
const parseDateTimeString = (value, defaultValue) => {
  if (!value) return defaultValue ? defaultValue : undefined;
  const trimmedValue = value.trim();

  if (!DateTime.fromISO(trimmedValue).isValid) {
    throw new ParqetParserError(
      `Invalid datetime. Datetime value must be of ISO 8601 format`,
      value
    );
  }

  return trimmedValue;
};

/**
 *
 * @param {string} value
 * @param {string} [defaultValue] - string of dd.MM.yyyy or yyyy-MM-dd
 * @returns {string | undefined} - normalized date value with format yyyy-MM-dd
 */
const parseDateString = (value, defaultValue) => {
  if (!value) return defaultValue ? defaultValue : undefined;
  const trimmedValue = value.trim();
  const ger = DateTime.fromFormat(trimmedValue, 'dd.MM.yyyy');
  const sql = DateTime.fromFormat(trimmedValue, 'yyyy-MM-dd');

  // Accepts 'dd.MM.yyyy' oder 'yyyy-MM-dd' formats
  if (!ger.isValid && !sql.isValid) {
    throw new ParqetParserError(
      `Invalid date. Date value must be either of format dd.MM.yyyy or yyyy-MM-dd`,
      value
    );
  }

  return ger.isValid ? ger.toFormat('yyyy-MM-dd') : trimmedValue;
};

/**
 *
 * @param {string} value
 * @param {string} [defaultValue] - HH:mm:ss string e.g. '00:00:00'
 * @returns {string | undefined}
 */
const parseTimeString = (value, defaultValue) => {
  if (!value) return defaultValue ? defaultValue : undefined;
  const trimmedValue = value.trim();

  // Accepts 'HH:mm:ss' format
  if (!/^(?:[01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(trimmedValue)) {
    throw new ParqetParserError(
      `Invalid time. Time value must be of format HH:mm:ss`,
      value
    );
  }

  return trimmedValue;
};

/**
 *
 * @param {string} value
 * @param {string} [defaultValue] - string of capitalized 3 letters e.g. 'EUR'
 * @returns {string | undefined}
 */
const parseCurrency = (value, defaultValue) => {
  if (!value) return defaultValue ? defaultValue : undefined;
  const trimmedValue = value.trim();

  // Accepts three letter capitalized word, e.g. 'EUR', 'USD'...
  if (!/(\b[A-Z]{3}\b)/.test(trimmedValue)) {
    throw new ParqetParserError(
      `Invalid currency. Currency value must be a string of exactly three capitalized letters`,
      value
    );
  }

  return trimmedValue;
};

/**
 *
 * @param {string} value
 * @param {string} [defaultValue]
 * @returns {string | undefined}
 */
const parseSimpleString = (value, defaultValue) => {
  if (!value) return defaultValue ? defaultValue : undefined;

  return value.trim();
};

/**
 *
 * @param {string} value
 * @param {number} [defaultValue]
 * @returns {number | undefined}
 */
const parseDecimal = (value, defaultValue) => {
  if (!value) return defaultValue ? defaultValue : undefined;
  const trimmedValue = value.trim();

  // normalize german number format
  const normalized = trimmedValue.replace(',', '.');

  // Accepts only numbers and a maximum of one floating point
  if (!/^(\d+|\d+\.\d+)$/.test(normalized)) {
    throw new ParqetParserError(
      `Invalid decimal. Decimal value must only contain numbers and maximum of one floating point`,
      trimmedValue
    );
  }
  return +Big(normalized);
};

/**
 * CSV column/field map
 * @type {Map<string, object>}
 */
export const FIELD_MAP = new Map([
  ['datetime', { fieldName: 'datetime', parserFunc: parseDateTimeString }],
  ['date', { fieldName: 'date', parserFunc: parseDateString }],
  [
    'time',
    {
      fieldName: 'time',
      parserFunc: parseTimeString,
      defaultValue: '00:00:00',
    },
  ],
  ['price', { fieldName: 'price', parserFunc: parseDecimal }],
  ['shares', { fieldName: 'shares', parserFunc: parseDecimal }],
  ['amount', { fieldName: 'amount', parserFunc: parseDecimal }],
  ['tax', { fieldName: 'tax', parserFunc: parseDecimal, defaultValue: 0 }],
  ['fee', { fieldName: 'fee', parserFunc: parseDecimal, defaultValue: 0 }],
  ['type', { fieldName: 'type', parserFunc: parseSimpleString }],
  ['broker', { fieldName: 'broker', parserFunc: parseSimpleString }],
  ['holding', { fieldName: 'holding', parserFunc: parseSimpleString }],
  ['isin', { fieldName: 'isin', parserFunc: parseSimpleString }],
  ['wkn', { fieldName: 'wkn', parserFunc: parseSimpleString }],
  [
    'currency',
    { fieldName: 'currency', parserFunc: parseCurrency, defaultValue: 'EUR' },
  ],
  ['fxrate', { fieldName: 'fxRate', parserFunc: parseDecimal }],
  [
    'originalcurrency',
    { fieldName: 'originalCurrency', parserFunc: parseCurrency },
  ],
]);
