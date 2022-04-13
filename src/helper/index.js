import { DateTime } from 'luxon';
import { ParqetActivityValidationError } from '@/errors';

// Regex to match an ISIN-only string. The first two chars represent the country and the last one is the check digit.
export const isinRegex = /^[A-Z]{2}[0-9A-Z]{9}[0-9]$/;

export const timeRegex = withSeconds => {
  return withSeconds ? /[0-2][0-9]:[0-9]{2}:[0-9]{2}/ : /[0-2][0-9]:[0-9]{2}/;
};

/**
 *
 * @param {string} content
 * @returns {string}
 */
export const getGermanDate = content => {
  return content.match(/[0-9]{2}.[0-9]{2}.[1-2][0-9]{3}/)[0];
};

/**
 *
 * @param {Importer.Page | string} content
 * @param {boolean} [trimAndSplit=false]
 * @returns {string}
 */
export function csvLinesToJSON(content, trimAndSplit = false) {
  let result = [];

  let lines = content;
  //TODO: the trimAndSplit could be removed and typeof content used to decide weather we need to enter this branch
  if (trimAndSplit) {
    if (typeof content !== 'string') {
      throw new Error(
        'trimAndSplit should only be true if a string is provided'
      );
    }

    lines = content.trim().split('\n');
  }

  // NOTE: If your columns contain commas in their values, you'll need
  // to deal with those before doing the next step
  // (you might convert them to &&& or something, then covert them back later)
  // jsfiddle showing the issue https://jsfiddle.net/
  let headers = lines[0].split(';');

  for (let i = 1; i < lines.length; i++) {
    let obj = {};
    const currentline = lines[i].split(';');

    for (let j = 0; j < headers.length; j++) {
      // Some .csv files contains leading/trailing " and spaces. We need to replace the double quote at the beginning an
      // the end to get the real value. E.g.: Value for a Starbucks WKN was in a .csv file "884437 ". T1 was unable to
      // found the Holding by WKN because of the double quote. Also we need to trim spaces.

      if (currentline[j] === undefined) {
        obj[headers[j]] = undefined;
        continue;
      }

      obj[headers[j]] = currentline[j].replace(/^"(.+)"$/, '$1').trim();
    }

    result.push(obj);
  }

  return JSON.stringify(result);
}

/** @type { (n: string) => number } */
export function parseGermanNum(n) {
  if (!n) {
    return 0;
  }
  return parseFloat(n.replace(/\./g, '').replace(',', '.'));
}

/** @type { (n: string) => number } */
export function parseSwissNumber(n) {
  if (!n) {
    return 0;
  }

  return parseFloat(n.replace(/[^-0-9.]+/g, ''));
}

/**
 * Gives the index for the first match of a regex within a 2D Array. Search is started at an optional offset
 *
 * @param {string[]} array
 * @param {RegExp} regex
 * @param {number} [offset=0]
 * @returns {number}
 */
export function findNextLineIndexByRegex(array, regex, offset = 0) {
  const nextIdx = array.slice(offset).findIndex(entry => regex.test(entry));
  return nextIdx >= 0 ? nextIdx + offset : -1;
}

/**
 *
 * @param {string[]} arr
 * @param {number} idx
 * @param {RegExp} regex
 * @returns {number}
 */
export function findPreviousRegexMatchIdx(arr, idx, regex) {
  let bckwrdIdx = 1;
  while (idx - bckwrdIdx >= 0) {
    if (regex.test(arr[idx - bckwrdIdx])) {
      return idx - bckwrdIdx;
    }
    bckwrdIdx += 1;
  }
  return -1;
}

function validateCommons(activity) {
  // All fields must have a value unequal undefined
  if (!Object.values(activity).every(a => !!a || a === 0)) {
    throw new ParqetActivityValidationError(
      'Invalid fields. Activity must not contain fields with undefined, or empty values.',
      activity,
      6
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const oldestDate = new Date(1990, 1, 1);
  oldestDate.setUTCHours(0, 0, 0, 0);

  if (activity.date === undefined) {
    throw new ParqetActivityValidationError(
      `Invalid 'date'. Activity 'date' field value must not be 'undefined'.`,
      activity,
      6
    );
  }

  if (activity.datetime === undefined) {
    throw new ParqetActivityValidationError(
      `Invalid 'datetime'. Activity 'datetime' field value must not be 'undefined'.`,
      activity,
      6
    );
  }

  if (activity.date > tomorrow) {
    throw new ParqetActivityValidationError(
      `Invalid 'date'. Activity 'date' field value must be in the past.`,
      activity,
      6
    );
  }

  if (activity.date < oldestDate) {
    throw new ParqetActivityValidationError(
      `Invalid 'date'. Activity 'date' field value must be after 1990-01-01.`,
      activity,
      6
    );
  }

  if (activity.datetime > tomorrow) {
    throw new ParqetActivityValidationError(
      `Invalid 'datetime'. Activity 'datetime' field value must be in the past.`,
      activity,
      6
    );
  }

  if (activity.datetime < oldestDate) {
    throw new ParqetActivityValidationError(
      `Invalid 'datetime'. Activity 'datetime' field value must be after 1990-01-01.`,
      activity,
      6
    );
  }

  if (Number(activity.shares) !== activity.shares || activity.shares <= 0) {
    throw new ParqetActivityValidationError(
      `Invalid 'shares'. Activity 'shares' field must be of type 'number' and greater than 0.`,
      activity,
      6
    );
  }

  if (Number(activity.price) !== activity.price || activity.price < 0) {
    throw new ParqetActivityValidationError(
      `Invalid 'price'. Activity 'price' field must be of type 'number' greater than or equal to 0.`,
      activity,
      6
    );
  }

  if (Number(activity.amount) !== activity.amount || activity.amount < 0) {
    throw new ParqetActivityValidationError(
      `Invalid 'amount'. Activity 'amount' field must be a number greater than or equal to 0.`,
      activity,
      6
    );
  }

  if (Number(activity.fee) !== activity.fee) {
    throw new ParqetActivityValidationError(
      `Invalid 'fee'. Activity 'fee' field must be of type 'number'.`,
      activity,
      6
    );
  }

  if (Number(activity.tax) !== activity.tax) {
    throw new ParqetActivityValidationError(
      `Invalid 'tax'. Activity 'tax' field must be of type 'number'.`,
      activity,
      6
    );
  }

  return activity;
}

export function validateActivity(activity, findSecurityAlsoByCompany = false) {
  if (validateCommons(activity) === undefined) return undefined;

  // Tresor One will search the security for PDF Documents with ISIN or WKN. For Imports of .csv File from Portfolio Performance
  // T1 can search the security also by the Company.
  if (
    ((findSecurityAlsoByCompany && activity.company === undefined) ||
      !findSecurityAlsoByCompany) &&
    activity.isin === undefined &&
    activity.wkn === undefined &&
    activity.holding === undefined
  ) {
    throw new ParqetActivityValidationError(
      `Invalid fields. Activity must contain one of 'isin', 'wkn', 'company' or 'holding'.`,
      activity,
      6
    );
  }

  if (!!activity.isin && !isinRegex.test(activity.isin)) {
    throw new ParqetActivityValidationError(
      `Invalid 'isin'. Invalid scheme for 'isin' field value.`,
      activity,
      6
    );
  }

  if (!!activity.wkn && !/^([A-Z0-9]{6})$/.test(activity.wkn)) {
    throw new ParqetActivityValidationError(
      `Invalid 'wkn'. Invalid scheme for 'wkn' field value.`,
      activity,
      6
    );
  }

  // Object.keys(ActivityType).map((t) => ActivityType[t]) <-- would use this for list, but it includes more types
  // than the list below
  const at = ['Buy', 'Sell', 'Dividend', 'TransferIn', 'TransferOut'];
  if (!at.includes(activity.type)) {
    throw new ParqetActivityValidationError(
      `Invalid 'type'. Activity 'type' field value must be one of [${at.join(
        ', '
      )}].`,
      activity,
      6
    );
  }

  if (!!activity.currency && !/^([A-Z]{3})$/.test(activity.currency)) {
    throw new ParqetActivityValidationError(
      `Invalid 'currency'. Invalid scheme for 'currency' field value.`,
      activity,
      6
    );
  }

  return /** @type {Importer.Activity} */ (activity);
}

export function validateCashActivity(activity) {
  return validateCommons(activity);
}

// Finds next regex match starting at the given offset
export function findFirstRegexIndexInArray(array, regex, offset = 0) {
  const idx = array.slice(offset).findIndex(element => regex.test(element));
  return idx === -1 ? undefined : idx + offset;
}

export function findFirstIsinIndexInArray(array, offset = 0) {
  return findFirstRegexIndexInArray(array, isinRegex, offset);
}

// This function will convert a date (reuqired) and a time (can be undefined) to a formatted date and datetime.
// When no time is present, the current time will be used to ensure the right order of activities after an import
// was processed.
export function createActivityDateTime(
  date,
  time = undefined,
  dateFormat = 'dd.MM.yyyy',
  dateTimeFormat = 'dd.MM.yyyy HH:mm',
  zone = 'Europe/Berlin'
) {
  date = date.trim();
  if (time !== undefined) {
    time = time.trim();
  }
  zone = zone.trim();

  let dateTime;
  if (time === undefined || !/[0-2][0-9]:[0-9]{2}(:[0-9]{2}|)/.test(time)) {
    // Append the current local time when to the date that was given from the implementation. The date must match the
    // format in `dateFormat`.
    const currentTime = DateTime.fromObject({ zone: zone });
    time =
      String(currentTime.hour).padStart(2, '0') +
      ':' +
      String(currentTime.minute).padStart(2, '0');
    dateTime = DateTime.fromFormat(date + ' ' + time, dateFormat + ' HH:mm', {
      zone: zone,
    });
  } else {
    // Convert the date and time from the implementation to a datetime value. The values of date and time must match
    // the given format in `dateTimeFormat` concat with an space between.
    dateTime = DateTime.fromFormat(date + ' ' + time, dateTimeFormat, {
      zone: zone,
    });
  }

  return [dateTime.toFormat('yyyy-MM-dd'), dateTime.toUTC().toISO()];
}

// Takes array of strings <transactionTypes> and returns the next occurrence of one of these strings in array <content>
export const findFirstSearchtermIndexInArray = (
  array,
  searchterms,
  offset = 0
) => {
  /** @type{number[]} */
  let idxArray = [];
  searchterms.forEach(type => {
    idxArray.push(array.slice(offset).indexOf(type));
  });
  const nextIdx = Math.min(...idxArray.filter(lineNumber => lineNumber >= 0));
  return nextIdx !== Infinity ? nextIdx + offset : -1;
};
