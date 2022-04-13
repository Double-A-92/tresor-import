import { Big } from 'big.js';
import {
  parseGermanNum,
  validateActivity,
  createActivityDateTime,
} from '@/helper';

const parseBuyOrSellDocument = (
  /** @type {Importer.Page} */ content,
  /** @type {Importer.ActivityTypeUnion} */ type
) => {
  content = content.slice(content.indexOf('ISIN'));

  const shares = findShares(content);
  const amount = findAmount(content);

  /** @type {Partial<Importer.Activity>} */
  let activity = {
    broker: 'sBroker',
    type,
    isin: findIsin(content),
    wkn: findWkn(content),
    company: findCompany(content),
    shares: shares,
    amount: +amount,
    price: +amount.div(shares),
    fee: findFee(content),
    tax: 0,
  };

  [activity.date, activity.datetime] = findDateTime(content);

  return validateActivity(activity);
};

const parseDividendDocument = (/** @type {Importer.Page} */ content) => {
  content = content.slice(content.indexOf('ISIN'));

  /** @type {Partial<Importer.Activity>} */
  let activity = {
    broker: 'sBroker',
    type: 'Dividend',
    isin: findIsin(content),
    wkn: findWkn(content),
    company: findCompany(content),
    shares: findShares(content),
    fee: findFee(content),
  };

  // @ts-ignore
  [activity.foreignCurrency, activity.fxRate] = findForeignInformation(content);
  [activity.date, activity.datetime] = findDateTime(content);

  let amount = findAmountPayoutGross(content);

  if (activity.fxRate && activity.foreignCurrency) {
    amount = amount.div(activity.fxRate);
  } else {
    delete activity.foreignCurrency;
    delete activity.fxRate;
  }

  activity.amount = +amount;
  activity.price = +amount.div(activity.shares);
  activity.tax = +amount.minus(findAmountPayoutNet(content));

  return validateActivity(activity);
};

const findShares = (/** @type {Importer.Page} */ content) => {
  return parseGermanNum(content[5]);
};

const findPositionOfIsin = (/** @type {Importer.Page} */ content) => {
  let position = content.indexOf('Handels-/Ausf');
  if (position > 0) {
    return position;
  }

  position = content.indexOf('Zahlbarkeitstag');
  if (position > 0) {
    return position;
  }
};

const findCompany = (/** @type {Importer.Page} */ content) => {
  return content.slice(6, findPositionOfIsin(content) - 2).join(' ');
};

const findIsin = (/** @type {Importer.Page} */ content) => {
  return content[findPositionOfIsin(content) - 2];
};

const findWkn = (/** @type {Importer.Page} */ content) => {
  return content[findPositionOfIsin(content) - 1].replace(/[{()}]/g, '');
};

const findFee = (/** @type {Importer.Page} */ content) => {
  let total = Big(0);

  const orderFeeLineNumber = content.indexOf('Provision');
  if (orderFeeLineNumber >= 0) {
    const offset = content.indexOf('% vom Kurswert') < 0 ? 0 : 2;
    total = total.add(parseGermanNum(content[orderFeeLineNumber + offset + 1]));
  }

  return +total;
};

const findAmount = (/** @type {Importer.Page} */ content) => {
  return Big(parseGermanNum(content[content.indexOf('Kurswert') + 1]));
};

const findAmountPayoutGross = (/** @type {Importer.Page} */ content) => {
  let lineNumber = content.indexOf('Dividendengutschrift');

  if (lineNumber < 0) {
    lineNumber = content.lastIndexOf('Aussch') + 2;
  }

  return Big(parseGermanNum(content[lineNumber + 1]));
};

const findAmountPayoutNet = (/** @type {Importer.Page} */ content) => {
  return Big(parseGermanNum(content[content.indexOf('Ausmachender') + 2]));
};

const findDateTime = (/** @type {Importer.Page} */ content) => {
  let dateValue, timeValue;
  let lineNumber = content.indexOf('Schlusstag/-Zeit');

  if (lineNumber > 0) {
    dateValue = content[lineNumber + 1];
    timeValue = content[lineNumber + 2];
  } else {
    lineNumber = content.indexOf('Schlusstag');

    if (lineNumber > 0) {
      dateValue = content[lineNumber + 1];
    } else {
      lineNumber = content.indexOf('Zahlbarkeitstag');

      if (lineNumber > 0) {
        dateValue = content[lineNumber + 1];
      }
    }
  }

  return createActivityDateTime(
    dateValue,
    timeValue,
    undefined,
    'dd.MM.yyyy HH:mm:ss'
  );
};

/**
 * @param {Importer.Page} content
 * @returns {(string | number)[]}
 */
const findForeignInformation = content => {
  const lineNumber = content.indexOf('Devisenkurs');
  if (lineNumber <= 0) {
    return [undefined, undefined];
  }

  return [
    content[lineNumber + 2].split(/\s/)[1],
    parseGermanNum(content[lineNumber + 3]),
  ];
};

const getDocumentType = (/** @type {Importer.Page} */ content) => {
  if (isBuy(content)) {
    return 'Buy';
  }

  if (isSell(content)) {
    return 'Sell';
  }

  if (isDividend(content)) {
    return 'Dividend';
  }
};

const isBuy = (/** @type {Importer.Page} */ content) => {
  const lineNumber = content.indexOf('Wertpapier');

  return (
    lineNumber > 0 &&
    lineNumber + 2 < content.length &&
    content[lineNumber + 1] === 'Abrechnung' &&
    (content[lineNumber + 2] === 'Kauf' ||
      content[lineNumber + 2] === 'Ausgabe')
  );
};

const isSell = (/** @type {Importer.Page} */ content) => {
  const lineNumber = content.indexOf('Wertpapier');

  return (
    lineNumber > 0 &&
    lineNumber + 2 < content.length &&
    content[lineNumber + 1] === 'Abrechnung' &&
    content[lineNumber + 2] === 'Verkauf'
  );
};

const isDividend = (/** @type {Importer.Page} */ content) => {
  if (content.indexOf('Dividendengutschrift') > 0) {
    return true;
  }

  const lineNumber = content.indexOf('Investmentfonds');

  return (
    lineNumber > 3 &&
    content.slice(lineNumber - 3, lineNumber).join('') === 'Ausschüttung'
  );
};

export const canParseDocument = (
  /** @type {Importer.Page[]} */ pages,
  /** @type {string} */ extension
) => {
  const firstPageContent = pages[0];

  return (
    extension === 'pdf' &&
    firstPageContent.some((/** @type {string | string[]} */ line) =>
      line.includes('S Broker')
    ) &&
    firstPageContent.slice(0, 10).indexOf('S Broker') >= 0 &&
    getDocumentType(firstPageContent) !== undefined
  );
};

export const parsePages = (/** @type {Importer.Page[]} */ pages) => {
  const flatContent = pages.flat();
  let activities = [];

  const type = getDocumentType(pages[0]);
  switch (type) {
    case 'Buy':
    case 'Sell':
      activities.push(parseBuyOrSellDocument(flatContent, type));
      break;

    case 'Dividend':
      activities.push(parseDividendDocument(flatContent));
      break;

    default:
      return {
        activities: undefined,
        status: 5,
      };
  }

  return {
    activities,
    status: 0,
  };
};

export const parsingIsTextBased = () => true;
