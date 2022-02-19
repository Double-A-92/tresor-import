import Big from 'big.js';
import { validateActivity } from '@/helper';
import { FIELD_MAP } from './utils';
import { ParqetParserError, ParqetActivityValidationError } from '@/errors';
import { DateTime } from 'luxon';

/**
 * Checks if document can be parsed by generic csv parser
 *
 * @param {Importer.Page[]} doc - file to be parsed
 * @param {string} extension - extension of file to be parsed
 * @returns {boolean} - true if can be parsed, false otherwise
 */
export const canParseDocument = (doc, extension) =>
  extension === 'csv' &&
  doc.flat().some(line => {
    const l = line.toLowerCase();
    // check if all required fields are present
    return (
      (l.includes('datetime') || l.includes('date')) &&
      l.includes('tax') &&
      l.includes('fee') &&
      l.includes('type') &&
      (l.includes('holding') || l.includes('isin') || l.includes('wkn')) &&
      // Check the fields for security activity ot cash acitivty
      ((l.includes('price') && l.includes('shares')) ||
        (l.includes('amount') && l.includes('holding')))
    );
  });

/**
 * Parses document content
 *
 * @param content
 * @returns {{activities: object[], status: number}}
 */
export const parsePages = content => {
  let activities = [];
  let headers = [];

  try {
    headers = content.splice(0, 1)[0].split(';');
  } catch (error) {
    throw new ParqetParserError(
      'Invalid CSV. Failed to extract headers from CSV file.',
      content
    );
  }

  if (content.length === 0) {
    throw new ParqetActivityValidationError(
      'Invalid CSV. Failed to find activities in CSV file.',
      content,
      5
    );
  }

  const lowerCaseHeaders = headers.map(header => header.toLowerCase().trim());

  // parse every content row
  for (let i = 0; i < content.length; i++) {
    const activity = parseRow(lowerCaseHeaders, content[i]);
    if (activity) activities.push(activity);
  }

  return {
    activities,
    status: 0,
  };
};

/**
 *
 * @param {string[]} lowerCaseHeaders
 * @param {string} row
 * @returns {Importer.Activity | undefined}
 */
const parseRow = (lowerCaseHeaders, row) => {
  const values = row.split(';');

  // skip empty rows
  if (!values) return;
  if (values.length) {
    const v = values[0].replace(/(\r\n|\n|\r)/gm, '');
    if (!v) return;
  }

  const activity = {};

  // add default values to activity regardless if it is present in CSV
  FIELD_MAP.forEach(o => {
    const { fieldName, defaultValue } = o;
    if (defaultValue) activity[fieldName] = defaultValue;
  });

  // for every column, check if column is in list of accepted fields (FIELD_MAP)
  // if field is not present --> ignore
  // else grab activity fieldName and parserFunc from mapper
  // assign parsed value accordingly
  for (let i = 0; i < lowerCaseHeaders.length; i++) {
    const key = lowerCaseHeaders[i];
    if (FIELD_MAP.has(key)) {
      const { fieldName, parserFunc, defaultValue } = FIELD_MAP.get(key);
      let params = [values[i]];
      if (defaultValue) params = [...params, defaultValue];
      const parsedValue = parserFunc(...params);
      // only assign defined values --> ignore undefined values
      if (parsedValue !== undefined) activity[fieldName] = parsedValue;
    }
  }

  if (!activity.datetime && !activity.date) {
    throw new ParqetActivityValidationError(
      `Invalid activity. One of datetime, or date must be supplied.`,
      activity,
      6
    );
  }

  if (!activity.datetime && activity.date && activity.time) {
    activity.datetime = DateTime.fromFormat(
      `${activity.date} ${activity.time}`,
      'yyyy-MM-dd HH:mm:ss'
    )
      .toUTC()
      .toISO();
  }

  if (!activity.date && activity.datetime) {
    activity.date = new Date(activity.datetime).toISOString().split('T')[0];
  }

  if (!activity.holding && !activity.isin && !activity.wkn) {
    throw new ParqetActivityValidationError(
      `Invalid activity. One of holding, isin, or wkn must be supplied.`,
      activity,
      6
    );
  }

  if (!!activity.price && !!activity.shares) {
    // It's a secuirty activity. Lets calculate the amount based on shares and price
    const p = new Big(activity.price);
    const s = new Big(activity.shares);
    activity.amount = +p.times(s);
  } else if (!!activity.amount && !!activity.holding) {
    // It's a cash activity. The input don't require columns for price and shares. Lets add them here.
    activity.price = 1;
    activity.shares = activity.amount;
  }

  return validateActivity(activity);
};

export const parsingIsTextBased = () => true;
