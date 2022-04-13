import Big from 'big.js';
import {
  parseGermanNum,
  parseSwissNumber,
  validateActivity,
  createActivityDateTime,
  findFirstIsinIndexInArray,
} from '@/helper';
import { findFirstRegexIndexInArray } from '../helper';

const allowedDegiroCountries = {
  'www.degiro.de': parseGermanNum,
  'www.degiro.es': parseGermanNum,
  'www.degiro.ie': parseGermanNum,
  'www.degiro.gr': parseGermanNum,
  'www.degiro.it': parseGermanNum,
  'www.degiro.pt': parseGermanNum,
  'www.degiro.fr': parseGermanNum,
  'www.degiro.nl': parseGermanNum,
  'www.degiro.at': parseGermanNum,
  'www.degiro.fi': parseGermanNum,
  'www.degiro.ch': parseSwissNumber,
};

// This will return the number of decimal places of the givven float
const precisionOfNumber = number => {
  if (!isFinite(number)) {
    return 0;
  }

  if (number % 1 != 0) {
    return number.toString().split('.')[1].length;
  }

  return 0;
};

const parseTransaction = (content, index, numberParser) => {
  let foreignCurrencyIndex;
  const numberRegex = /^-{0,1}[\d.,']+((,|\.)\d+|)+$/;

  let isinIdx = findFirstIsinIndexInArray(content, index);
  const company = content.slice(index + 2, isinIdx).join(' ');
  const isin = content[isinIdx];

  const sharesIdx = findFirstRegexIndexInArray(content, numberRegex, isinIdx);
  const transactionEndIdx = findFirstRegexIndexInArray(
    content,
    /(DEGIRO B\.V\. )|\d{2}-\d{2}-\d{4}/,
    sharesIdx
  );

  // Sometimes the currency comes first; sometimes the value comes first
  const amountOffset = numberRegex.test(content[sharesIdx + 1]) ? 5 : 6;
  const shares = numberParser(content[sharesIdx]);

  /** @type {Partial<Importer.Activity>} */
  let activity = {
    broker: 'degiro',
    company,
    isin,
    shares: Math.abs(shares),
    // There is the case where the amount is 0, might be a transfer out or a knockout certificate
    amount: Math.abs(numberParser(content[sharesIdx + amountOffset])),
    tax: 0,
    fee: 0,
  };

  const beforeCurrencyOffset = /^[A-Z]{3}$/.test(content[sharesIdx + 1])
    ? 1
    : 0;

  const currency = content[sharesIdx + 2 + beforeCurrencyOffset];
  const baseCurrencyLineNumber = sharesIdx + 6 - beforeCurrencyOffset;
  const baseCurrency = content[baseCurrencyLineNumber];

  if (currency !== baseCurrency) {
    activity.foreignCurrency = currency;

    let fxCandidate = numberParser(content[baseCurrencyLineNumber + 1]);

    if (precisionOfNumber(fxCandidate) === 2) {
      // Thanks for nothing.
      // Sometimes the amount cames first and then the fx rate. We detect that the current value is the amount, because this will be rounded up to two decimals from degiro. The fx rate has more precision.
      fxCandidate = numberParser(content[baseCurrencyLineNumber + 2]);
    }

    activity.fxRate = fxCandidate;

    // For foreign currency we need to go one line ahead for the following fields.
    foreignCurrencyIndex = 1;
  } else {
    foreignCurrencyIndex = 0;
  }

  activity.type = shares > 0 ? 'Buy' : 'Sell';
  activity.currency = baseCurrency;
  activity.price = +Big(activity.amount).div(activity.shares).abs();

  // console.log(isin, 'content[sharesIdx + 8]', content[sharesIdx + 7])
  if (activity.type === 'Buy') {
    activity.fee = Math.abs(
      numberParser(
        content[sharesIdx + 7 + foreignCurrencyIndex + beforeCurrencyOffset]
      )
    );
  } else if (activity.type === 'Sell') {
    if (transactionEndIdx - sharesIdx >= 10) {
      activity.fee = Math.abs(
        numberParser(
          content[sharesIdx + 7 + foreignCurrencyIndex + beforeCurrencyOffset]
        )
      );
    }
  }

  [activity.date, activity.datetime] = createActivityDateTime(
    content[index],
    content[index + 1],
    'dd-MM-yyyy',
    'dd-MM-yyyy HH:mm'
  );

  return validateActivity(activity);
};

// Get the current number parser functions based on the Degiro Country.
const getNumberParserFunction = content => {
  const countries = Object.keys(allowedDegiroCountries);
  for (let countryIndex = 0; countryIndex < countries.length; countryIndex++) {
    const country = countries[countryIndex];
    if (!content.some(line => line.includes(country))) {
      continue;
    }

    return allowedDegiroCountries[country];
  }
};

const parseTransactionLog = pdfPages => {
  let activities = [];

  // Get the current number parser functions based on the Degiro Country.
  let numberParser = getNumberParserFunction(pdfPages[0]);

  for (let content of pdfPages) {
    let transactionIndex =
      content.findIndex(
        currentValue => currentValue === 'Gesamt' || currentValue === 'Totale'
      ) + 1;
    while (transactionIndex > 0 && content.length - transactionIndex > 15) {
      // Entries might have a longer length (by 1) if there is a currency rate
      // this checks that the entry is a date in the expected format
      if (!content[transactionIndex].match(/^[0-9]{2}-[0-9]{2}-[0-9]{4}$/)) {
        transactionIndex += 1;
        continue;
      }

      activities.push(
        parseTransaction(content, transactionIndex, numberParser)
      );

      // Always go forward, not only in case of success, to prevent an infinity loop
      // A normal activity w/o currency rates spans 16 lines from date to date, but some have missing
      // lines for fxRate and fee. So we need to check 14 lines ahead (and more) for the next activity.
      transactionIndex += 14;
    }
  }
  return activities;
};

const parseDepotStatement = pdfPages => {
  const flattendPages = pdfPages.flat();
  let numberParser = getNumberParserFunction(pdfPages);

  const dateline =
    flattendPages[
      flattendPages.findIndex(
        line =>
          line.startsWith('Portfolioübersicht per ') ||
          line.startsWith('Panoramica Portafoglio al ')
      )
    ];

  const dateLineSplitted = dateline.split(/\s+/);
  const [date, datetime] = createActivityDateTime(
    dateLineSplitted[dateLineSplitted.length - 1],
    undefined,
    'dd-MM-yyyy'
  );

  const currencyLineElements =
    flattendPages[
      flattendPages.findIndex(
        line => line.startsWith('Wert in ') || line.startsWith('Valore in ')
      )
    ].split(' ');

  let activities = [];
  let isinIdx = findFirstIsinIndexInArray(flattendPages);
  while (isinIdx >= 0) {
    const shares = numberParser(flattendPages[isinIdx + 1]);

    /** @type {Partial<Importer.Activity>} */
    const activity = {
      broker: 'degiro',
      isin: flattendPages[isinIdx],
      company: flattendPages[isinIdx - 1],
      date,
      datetime,
      shares: Math.abs(shares),
      amount: Math.abs(numberParser(flattendPages[isinIdx + 4])),
      tax: 0,
      fee: 0,
      currency: currencyLineElements[2],
    };

    activity.type = shares > 0 ? 'TransferIn' : 'TransferOut';
    activity.price = +Big(activity.amount).div(activity.shares);

    if (validateActivity(activity)) {
      activities.push(activity);
    } else {
      return undefined;
    }

    isinIdx = findFirstIsinIndexInArray(flattendPages, isinIdx + 1);
  }
  return activities;
};

const getDocumentType = pdfPages => {
  if (
    pdfPages[0].some(
      line =>
        line.startsWith('Kontoauszug von') ||
        line.startsWith('Account statement') ||
        line.startsWith('Estratto conto da')
    )
  ) {
    return 'AccountStatement';
  } else if (
    pdfPages[0].some(
      line =>
        line.startsWith('Transaktionsübersicht von') ||
        line.startsWith('Operazioni da')
    )
  ) {
    return 'TransactionLog';
  } else if (
    pdfPages[0].some(
      line =>
        line.startsWith('Portfolioübersicht') ||
        line.startsWith('Panoramica Portafoglio')
    )
  ) {
    return 'DepotOverview';
  }
};

export const canParseDocument = (pdfPages, extension) => {
  const countries = Object.keys(allowedDegiroCountries);
  return (
    extension === 'pdf' &&
    pdfPages[0].some(line => countries.includes(line)) &&
    getDocumentType(pdfPages) !== undefined
  );
};

export const parsePages = pdfPages => {
  const documentType = getDocumentType(pdfPages);
  let activities;
  switch (documentType) {
    // This type of file contains Dividends and other information. Only dividends are processed. This is not implemented
    // yet as the dividends lack the information how many shares are in the account
    case 'AccountStatement':
      return {
        activities: [],
        status: 5,
      };

    // This type of file contains Buy and Sell operations
    case 'TransactionLog': {
      activities = parseTransactionLog(pdfPages);
      break;
    }

    case 'DepotOverview': {
      activities = parseDepotStatement(pdfPages);
      break;
    }
  }

  return {
    activities,
    status: activities === undefined ? 1 : 0,
  };
};

export const parsingIsTextBased = () => true;
