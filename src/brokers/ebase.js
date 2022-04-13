import Big from 'big.js';
import {
  parseGermanNum,
  validateActivity,
  createActivityDateTime,
} from '@/helper';

const parseShare = shareString => {
  try {
    return +Big(parseGermanNum(shareString)).abs();
  } catch (e) {
    if (e.message === '[big.js] Invalid number') {
      return undefined;
    } else {
      throw e; // re-throw the error unchanged
    }
  }
};

//Takes a string that starts with a number that uses a comma instead of a .
//for decimal place division and followed by a single space and extracts that
//number as a float. e. G.: "388,29 EUR [...]" -> 388.29
const parseNumberBeforeSpace = input => {
  try {
    return +Big(parseGermanNum(input.split(' ')[0])).abs();
  } catch (e) {
    if (e.message === '[big.js] Invalid number') {
      return undefined;
    } else {
      throw e; // re-throw the error unchanged
    }
  }
};

const isBuy = txString => {
  if (txString === undefined) {
    return false;
  }
  return (
    txString === 'Ansparplan' ||
    txString === 'Kauf' ||
    txString.includes('Fondsumschichtung (Zugang)') ||
    txString === 'Neuabrechnung Kauf'
  );
};

const isSell = txString => {
  if (txString === undefined) {
    return false;
  }
  return (
    txString === 'Entgelt Verkauf' ||
    txString === 'Verkauf' ||
    txString.includes('Fondsumschichtung (Abgang)')
  );
};

const isReinvestment = line => {
  if (!line) {
    return;
  }

  return line === 'Wiederanlage Fondsertrag';
};

function parseBaseAction(pdfArray, pdfOffset, actionType) {
  let foreignCurrencyOffset = 0;
  // In this case there is a foreign currency involved and the amount will be
  // at another offset
  const [parsedDate, parsedDateTime] = createActivityDateTime(
    pdfArray[pdfOffset + 6],
    undefined
  );

  /** @type {Partial<Importer.Activity>} */
  const activity = {
    broker: 'ebase',
    type: actionType,
    date: parsedDate,
    datetime: parsedDateTime,
    isin: pdfArray[pdfOffset + 2],
    company: pdfArray[pdfOffset + 1],
    shares: parseShare(pdfArray[pdfOffset + 4]),
    tax: 0,
    fee: 0,
    currency: 'EUR',
  };

  if (
    pdfArray[pdfOffset] === 'Wiederanlage Fondsertrag' &&
    !pdfArray[pdfOffset + 5].endsWith(' EUR') &&
    !pdfArray[pdfOffset + 7].endsWith(' EUR')
  ) {
    activity.currency = pdfArray[pdfOffset + 7].split(' ')[1];
  }

  activity.price = parseNumberBeforeSpace(pdfArray[pdfOffset + 5]);

  if (pdfArray[pdfOffset + 8].includes('/')) {
    foreignCurrencyOffset = 2;
    activity.fxRate = parseGermanNum(pdfArray[pdfOffset + 7]);
    activity.foreignCurrency = pdfArray[pdfOffset + 8].split('/')[1];
    activity.price = +Big(activity.price).div(activity.fxRate);
  }

  activity.amount = parseNumberBeforeSpace(
    pdfArray[pdfOffset + 7 + foreignCurrencyOffset]
  );

  return validateActivity(activity);
}

const parseTransactionLog = pdfPages => {
  // Action can be: Fondsertrag (Ausschüttung), Ansparplan, Wiederanlage Fondsertrag, Entgelt Verkauf
  let actions = [];
  for (const pdfPage of pdfPages) {
    let i = 0;

    while (i <= pdfPage.length) {
      if (isBuy(pdfPage[i])) {
        const action = parseBaseAction(pdfPage, i, 'Buy');
        if (action !== undefined) {
          actions.push(action);
        }

        // Any buy transaction entry occupies at least 7 array entries.
        i += 6;
      } else if (pdfPage[i] === 'Fondsertrag (Ausschüttung)') {
        // This was always blank in the example files I had -> So no parsing could be done.
        i += 3;
      } else if (isSell(pdfPage[i])) {
        const action = parseBaseAction(pdfPage, i, 'Sell');
        if (action !== undefined) {
          actions.push(action);
        }

        // An Sell operations occupy 9 array entries.
        i += 8;
      } else if (isReinvestment(pdfPage[i])) {
        const action = parseBaseAction(pdfPage, i, 'Buy');
        if (action !== undefined) {
          // Push first the activity as a dividend
          actions.push({ ...action, type: 'Dividend' });
          actions.push(action);
        }

        // Any buy transaction entry occupies at least 7 array entries.
        i += 6;
      } else if (pdfPage[i] === 'Vorabpauschale') {
        // This was always blank in the example files I had -> So no parsing could be done.
        i += 3;
      }

      i++;
    }
  }
  return actions;
};

const isTransactionLog = pdfPages => {
  return (
    pdfPages[0].some(
      line =>
        line.startsWith('ebase Depot') ||
        line.includes('finvesto Depot') ||
        line.includes('VL-FondsDepot')
    ) && pdfPages[0].some(line => line.includes('Fondsertrag / Vorabpauschale'))
  );
};

const isIgnoredDocument = pdfPages => {
  return (
    pdfPages[0].includes('European Bank for Financial') &&
    pdfPages[0].includes('Umsatzabrechnung')
  );
};

export const canParseDocument = (pdfPages, extension) => {
  return (
    extension === 'pdf' &&
    (isTransactionLog(pdfPages) || isIgnoredDocument(pdfPages))
  );
};

export const parsePages = pdfPages => {
  if (isTransactionLog(pdfPages)) {
    const activities = parseTransactionLog(pdfPages);
    const status = activities !== undefined ? 0 : 6;
    return {
      activities,
      status,
    };
  } else if (isIgnoredDocument(pdfPages)) {
    return {
      activities: [],
      status: 7,
    };
  }
};

export const parsingIsTextBased = () => true;
