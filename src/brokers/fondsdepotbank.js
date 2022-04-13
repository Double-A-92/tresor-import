import Big from 'big.js';
import {
  parseGermanNum,
  validateActivity,
  createActivityDateTime,
  getGermanDate,
} from '@/helper';

/**
 *
 * @param {string[]} content
 * @returns {string[]}
 */
const findISINAndWKN = content => {
  return content[content.indexOf('ISIN/WKN:') + 1].split(/\//);
};

/**
 *
 * @param {string[]} content
 * @returns {string}
 */
const findCompany = content => {
  return content[content.indexOf('Fondsbezeichnung:') + 1];
};

/**
 *
 * @param {string[]} content
 * @param {Importer.ActivityTypeUnion} type
 * @returns {number}
 */
const findAmount = (content, type) => {
  if (type === 'Buy' || type === 'Sell') {
    return parseGermanNum(content[1]);
  } else if (type === 'Dividend') {
    return parseGermanNum(content[content.indexOf('Ausschüttungsbetrag') + 2]);
  }
};

/**
 *
 * @param {string[]} content
 * @param {Importer.ActivityTypeUnion} type
 * @returns {string}
 */
const findDate = (content, type) => {
  let dateLine;
  if (type === 'Buy') {
    dateLine = content[4];
  } else if (type === 'Sell') {
    dateLine = content[2];
  } else if (type === 'Dividend') {
    dateLine =
      content[content.findIndex(t => t.includes('Ausschüttung per '))].split(
        /\s+/
      )[2];
  }
  return getGermanDate(dateLine);
};

/* We do not need this as the price will be calculated from the amount and shares
const findPrice = (content, type) => {
  if (type === 'Buy') {
    return parseGermanNum(content[5]);
  } else if (type === 'Sell') {
    return parseGermanNum(content[3]);
  } else if (type === 'Dividend') {
    return parseGermanNum(content[content.indexOf('Ausschüttungsbetrag') + 1]);
  }
  return 0;
};
*/

/**
 *
 * @param {string[]} content
 * @param {Importer.ActivityTypeUnion} type
 * @returns {number}
 */
const findFee = (content, type) => {
  if (type === 'Buy') {
    return parseGermanNum(content[6]);
  }
  return 0;
};

/**
 *
 * @param {string[]} content
 * @param {Importer.ActivityTypeUnion} type
 * @returns {number}
 */
const findShares = (content, type) => {
  if (type === 'Buy') {
    return Math.abs(parseGermanNum(content[7]));
  } else if (type === 'Sell') {
    return Math.abs(parseGermanNum(content[4]));
  } else if (type === 'Dividend') {
    return parseGermanNum(
      content[content.findIndex(t => t.includes('Anteile '))].split(/\s+/)[1]
    );
  }
  return 0;
};

/**
 *
 * @param {string[]} content
 * @param {Importer.ActivityTypeUnion} type
 * @returns {number}
 */
const findTaxes = (content, type) => {
  if (type === 'Sell' || type === 'Dividend') {
    const gainsTax = parseGermanNum(
      content[content.indexOf('Kapitalertragsteuer') + 1]
    );
    const solidarySur = parseGermanNum(
      content[content.indexOf('Solidaritätszuschlag') + 1]
    );
    let churchTax = 0;
    const churchIdx = content.findIndex(t => t.includes('Kirchensteuer '));
    if (churchIdx !== -1) {
      churchTax = parseGermanNum(content[churchIdx + 1]);
    }
    return +Big(gainsTax).plus(solidarySur).plus(churchTax).abs();
  }
  return 0;
};

/**
 *
 * @param {string[]} content
 * @returns {Importer.ActivityTypeUnion | 'Ignored'}
 */
const getDocumentType = content => {
  if (content.includes('Anlagebetrag')) {
    return 'Buy';
  } else if (content.includes('Abrechnungsbetrag')) {
    return 'Sell';
  } else if (content.includes('Ausschüttungsbetrag')) {
    return 'Dividend';
  } else if (content.some(line => line.includes('Kosteninformation'))) {
    return 'Ignored';
  }
  return undefined;
};

/**
 *
 * @param {Importer.Page[]} pages
 * @param {string} extension
 * @returns {boolean}
 */
export const canParseDocument = (pages, extension) => {
  const firstPageContent = pages[0];
  return (
    extension === 'pdf' &&
    firstPageContent.some(line => line.includes('Fondsdepot Bank GmbH')) &&
    firstPageContent.some(line => line.includes('Depotabrechnung')) &&
    getDocumentType(firstPageContent) !== undefined
  );
};

/**
 *
 * @param {string[]} fondInfo
 * @param {string[]} transactionInfo
 * @param {Importer.ActivityTypeUnion} type
 * @returns {Importer.Activity}
 */
const parseData = (fondInfo, transactionInfo, type) => {
  /** @type {Partial<Importer.Activity>} */
  let activity = {
    broker: 'fondsdepotbank',
    type,
  };

  activity.company = findCompany(fondInfo);
  [activity.isin, activity.wkn] = findISINAndWKN(fondInfo);
  [activity.date, activity.datetime] = createActivityDateTime(
    findDate(transactionInfo, type)
  );
  activity.shares = findShares(transactionInfo, type);
  activity.fee = findFee(transactionInfo, type);
  activity.amount = +Big(findAmount(transactionInfo, type)).minus(activity.fee);
  activity.price = +Big(activity.amount).div(activity.shares);
  // activity.price = findPrice(transactionInfo, type);
  activity.tax = findTaxes(transactionInfo, type);

  return validateActivity(activity);
};

/**
 *
 * @param {Importer.Page[]} contents
 * @returns {Importer.ParserResult}
 */
export const parsePages = contents => {
  const activities = [];
  const type = getDocumentType(contents[0]);

  if (type === 'Ignored') {
    // We know this type and we don't want to support it.
    return {
      activities: [],
      status: 7,
    };
  }

  /*
   * To unify the parsing of several document types we will remove some entries
   * that do not add additional context but only change the order of the relevant structures.
   * Those can appear on e.g. reinvestments or when exchanging positions.
   */
  const blockList = [
    '1)',
    '2)',
    'Rabatt',
    '100 %',
    'gesamt',
    'für Tausch',
    'aus Tausch',
    'Ertrag',
  ];

  /*
   * To retrieve all activities we need to iterate over all pages.
   * As every page again starts with the same meta information part,
   * we parse every page separately.
   * We slice the array of contents to only look at the relevant parts of each transaction type.
   */
  for (const pageContent of contents) {
    // This part should only contain meta information about the traded fond
    const fondInfo = pageContent.slice(
      pageContent.indexOf('Depotabrechnung'),
      pageContent.indexOf('Transaktion') ||
        pageContent.findIndex(c => c.includes('Ausschüttung per '))
    );

    // This part should only contain information about the specific transaction related to the fond
    let transactionInfo;
    if (type === 'Buy') {
      // There can also be mixed transactions as buys and reinvestments,
      // which we unify through replacements (Wiederanlage -> Kauf).
      transactionInfo = pageContent.map(c => c.replace('Wiederanlage', 'Kauf'));
      transactionInfo = transactionInfo.slice(
        transactionInfo.indexOf('Kauf'),
        transactionInfo.indexOf('Konto-')
      );
    } else if (type === 'Sell') {
      transactionInfo = pageContent.slice(
        pageContent.indexOf('Verkauf'),
        pageContent.indexOf('Konto-')
      );
    } else if (type === 'Dividend') {
      transactionInfo = pageContent.slice(
        pageContent.findIndex(c => c.includes('Ausschüttung per ')),
        pageContent.indexOf('Konto-')
      );
    }

    if (transactionInfo.length) {
      transactionInfo = transactionInfo.filter(c => !blockList.includes(c));
      if (type === 'Buy') {
        // As there can be multiple buy transactions on every page,
        // we iterate over all appearances and add them to the activities list.
        let idx = transactionInfo.indexOf('Kauf');
        const first = idx;
        while (idx !== -1) {
          activities.push(
            parseData(
              fondInfo,
              [
                ...transactionInfo.slice(0, first),
                ...transactionInfo.slice(idx, idx + 10),
              ],
              type
            )
          );
          idx = transactionInfo.indexOf('Kauf', idx + 1);
        }
      } else {
        activities.push(parseData(fondInfo, transactionInfo, type));
      }
    }
  }

  return {
    activities: activities,
    status: 0,
  };
};

export const parsingIsTextBased = () => true;
