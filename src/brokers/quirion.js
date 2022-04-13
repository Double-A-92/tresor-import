// Info: quirion has a horrible parsed JSON format, mostly containing partials
// of text that has to be combined to make sense.

import Big from 'big.js';
import {
  createActivityDateTime,
  isinRegex,
  parseGermanNum,
  validateActivity,
} from '@/helper';

const BROKER_NAME = 'quirion';

// This is a sample Buy activity:
//  1.  "-984,92",
//  2.  "EUR",
//  3.  "19.07.2021",
//  4.  "15.07.2021",
//  5.   "Wertpapier Kauf",
//  6.   ", Ref",
//  7.   ".: 227865486",
//  8.   "Am",
//  9.   "undi Inde",
// 10.   "x Solu.-A.PRIME GL.",
// 11.   "Nam.-Ant.UCI.ETF DR USD Dis",
// 12.    ".oN",
// 13.   "LU1931974692, ST 37,722",
//
// To find it, we're looking for "Wertpapier Kauf" marked as "index".
// From there:
//   - price: index - 4
//   - valuta: index - 2
//   - booking date: index - 1
// We skip the next two (line 6 and 7) and walk forward until we find an ISIN (line 13).
// Until we find the ISIN, we concat all text inbetween to get the name.
// In line 13, we can find the ISIN and the amount bought.

const parseIsin = possibleIsin => {
  if (!possibleIsin) {
    return undefined;
  }

  const match = possibleIsin.match(isinRegex);

  if (!match) {
    return undefined;
  }

  return match[0];
};

const findIsinAndAmountInLine = line => {
  const [possibleIsin, ...potentialShares] = line.split(',');

  const isin = parseIsin(possibleIsin);

  if (!isin) {
    return undefined;
  }

  const sharesText = potentialShares.join(',').substr(' ST '.length);

  return {
    isin,
    shares: +Big(parseGermanNum(sharesText)),
  };
};

const findNextBuyOrSell = (flatContent, index) => {
  /** @type {Importer.ActivityTypeUnion} */
  let type;

  while (index < flatContent.length) {
    if (flatContent[index] === 'Wertpapier Kauf') {
      type = 'Buy';
      break;
    }

    if (
      index + 1 < flatContent.length &&
      flatContent[index] === 'Wertpapier' &&
      flatContent[index + 1] === 'Verkauf'
    ) {
      type = 'Sell';
      break;
    }

    index++;
  }

  if (index === flatContent.length) {
    return undefined;
  }

  /** @type {Partial<Importer.Activity>} */
  const activity = {
    broker: BROKER_NAME,
    type,
    // No information about fee and tax in the Kontoauszug
    fee: 0,
    tax: 0,
    // Price is negativ
    amount: +Big(parseGermanNum(flatContent[index - 4])).mul(
      type === 'Buy' ? -1 : 1
    ),
  };

  [activity.date, activity.datetime] = createActivityDateTime(
    flatContent[index - 1]
  );

  // Skip "Wertpapier Kauf", "Ref" and ".: <Number of Ref>"
  index += type === 'Buy' ? 3 : 4;

  const partialName = [];
  let isinAndShares;

  while (!(isinAndShares = findIsinAndAmountInLine(flatContent[index]))) {
    partialName.push(flatContent[index]);
    index++;
  }

  activity.company = partialName.join('');
  activity.isin = isinAndShares.isin;
  activity.shares = +Big(isinAndShares.shares).mul(type === 'Sell' ? -1 : 1);
  activity.price = +Big(activity.amount).div(activity.shares);

  return {
    activity: validateActivity(activity),
    index,
  };
};

const createActivitiesForBuyOrSell = flatContent => {
  const activities = [];

  let currentIndex = 0;

  while (currentIndex < flatContent.length) {
    const buy = findNextBuyOrSell(flatContent, currentIndex);

    if (buy === undefined) {
      break;
    }

    activities.push(buy.activity);
    currentIndex = buy.index + 1;
  }

  return activities;
};

const findTextByIndex = (
  content,
  textToFind,
  accessOffset,
  partial = false
) => {
  const index = content.findIndex(item =>
    partial ? item.includes(textToFind) : item === textToFind
  );

  if (index === -1) {
    return undefined;
  }

  return content[index + accessOffset];
};

const findPartialTextByIndex = (content, textToFind, accessOffset) =>
  findTextByIndex(content, textToFind, accessOffset, true);

const findDividendIsin = content => {
  // We're looking for:
  // "LU1109942653",
  // "ISIN",

  const possibleIsin = findTextByIndex(content, 'ISIN', -1);
  return parseIsin(possibleIsin);
};

const findDividendWkn = content => {
  // We're looking for:
  // "DBX0PR",
  // "WKN",

  return findTextByIndex(content, 'WKN', -1);
};

const findDividendShares = content => {
  // We're looking for:
  // "10,714 ST",
  // "Nominal/Stüc",

  const possibleShares = findTextByIndex(content, 'Nominal/Stüc', -1);

  if (!possibleShares) {
    return undefined;
  }

  return +Big(parseGermanNum(possibleShares.replace(' ST', '')));
};

const findDividendPrice = content => {
  // We're looking for:
  // "EUR 0,2688 pro Anteil"
  const priceLine = findPartialTextByIndex(content, 'pro Anteil', 0);

  if (!priceLine) {
    return undefined;
  }

  const splitLine = priceLine.split(' ');

  if (splitLine.length < 2) {
    return undefined;
  }

  return +Big(parseGermanNum(splitLine[1]));
};

const findDividendDate = content => {
  // We're looking for:
  // "30.09.2021",
  // "Zahlungstag",

  const possibleDate = findTextByIndex(content, 'Zahlungstag', -1);

  if (!possibleDate) {
    return undefined;
  }

  return createActivityDateTime(possibleDate);
};

const findDividendTax = content => {
  // We're looking for:
  // "-0,72",
  //  "EUR",
  //  "Kapitaler",
  //  "tragsteuer",
  //  "-0,03",
  //  "EUR",
  //  "Solidar",
  //  "itätszuschlag",
  //  "0,00",
  //  "EUR",
  //  "Kirchensteuer",

  const possibleKapitalertragssteuer = findTextByIndex(
    content,
    'Kapitaler',
    -2
  );
  const possibleSoli = findTextByIndex(content, 'Solidar', -2);
  const possibleKirchensteuer = findTextByIndex(content, 'Kirchensteuer', -2);

  if (!possibleKapitalertragssteuer) {
    return undefined;
  }

  if (!possibleSoli) {
    return undefined;
  }

  if (!possibleKirchensteuer) {
    return undefined;
  }

  // Taxes are negativ
  return +Big(parseGermanNum(possibleKapitalertragssteuer))
    .plus(parseGermanNum(possibleSoli))
    .plus(parseGermanNum(possibleKirchensteuer))
    .mul(-1);
};

const findDividendAmount = content => {
  // We're looking for:
  // "Zahlungstag",
  //  "2,88",
  // This INCLUDES the taxes.

  const possibleAmount = findTextByIndex(content, 'Zahlungstag', 1);

  if (!possibleAmount) {
    return undefined;
  }

  return +Big(parseGermanNum(possibleAmount));
};

const findDividendCompany = content => {
  // We're looking for:
  // "teilen wir nachstehende Abrechn",
  // "ung:",
  // "Xtr",
  // ".II EUR H.Yield Corp.Bond Inhaber",
  // "-Anteile 1D o.N.",
  // "Wertpapierbez",

  let index = content.findIndex(
    item => item === 'teilen wir nachstehende Abrechn'
  );

  if (index === -1) {
    return undefined;
  }

  // Skip "ung:"
  index += 2;

  const partialCompany = [];
  let currentLine;

  while ((currentLine = content[index]) !== 'Wertpapierbez') {
    partialCompany.push(currentLine);
    index++;
  }

  return partialCompany.join('');
};

const createActivitiesForDividend = flatContent => {
  /** @type {Importer.ActivityTypeUnion} */
  let type = 'Dividend';

  const activity = {
    broker: BROKER_NAME,
    type,
    // No information about fee in the Erträgnisabrechnung
    fee: 0,
    company: findDividendCompany(flatContent),
    tax: findDividendTax(flatContent),
    isin: findDividendIsin(flatContent),
    wkn: findDividendWkn(flatContent),
    shares: findDividendShares(flatContent),
    price: findDividendPrice(flatContent),
    amount: findDividendAmount(flatContent),
  };

  [activity.date, activity.datetime] = findDividendDate(flatContent);

  return [validateActivity(activity)];
};

const parseData = flatContent => {
  if (isDocumentBuyOrSell(flatContent)) {
    return createActivitiesForBuyOrSell(flatContent);
  }

  if (isDocumentDividend(flatContent)) {
    return createActivitiesForDividend(flatContent);
  }

  return [];
};

const combineText = (content, startIndex, length) => {
  let finalContent = '';
  for (let i = 0; i < length; i++) {
    finalContent += content[startIndex + i];
  }

  return finalContent;
};

const hasClutteredText = (content, startText, length, textToFind) => {
  const startIndex = content.findIndex(item => item === startText);

  if (startIndex === -1) {
    return false;
  }

  const combinedText = combineText(content, startIndex, length);

  return combinedText === textToFind;
};

const isDocumentBuyOrSell = content => {
  // We're looking for the following four consecutive entries
  // "Wertpapier",
  // "Verkauf",
  // or
  // "Wertpapier Kauf"
  return (
    content.includes('Wertpapier Kauf') ||
    hasClutteredText(content, 'Wertpapier', 2, 'Wertpapier Verkauf')
  );
};
const isDocumentDividend = content => {
  // We're looking for the following four consecutive entries
  // "Erträ",
  // "gnisabrec",
  // "hn",
  // "ung",
  return hasClutteredText(content, 'Erträ', 4, 'Erträgnisabrechnung');
};

export const canParseDocument = (pages, extension) => {
  const firstPageContent = pages[0];

  // We're looking for
  // "Quir",
  // "in Pr",
  // "ivatbank A",
  // "G",
  const isQuirinCompany = hasClutteredText(
    firstPageContent,
    'Quir',
    4,
    'Quirin Privatbank AG'
  );

  return (
    extension === 'pdf' &&
    isQuirinCompany &&
    (isDocumentBuyOrSell(firstPageContent) ||
      isDocumentDividend(firstPageContent))
  );
};

export const parsePages = contents => {
  const activities = parseData(contents.flat());

  if (!activities.length) {
    return {
      activities: [],
      status: 5,
    };
  }

  return {
    activities,
    status: 0,
  };
};

export const parsingIsTextBased = () => true;
