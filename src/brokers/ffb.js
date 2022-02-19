import Big from 'big.js';
import {
  parseGermanNum,
  validateActivity,
  createActivityDateTime,
  getGermanDate,
} from '@/helper';

const findDateBuySell = (textArr, startLine) => {
  //startLine+5 states the fund currency;
  //So if the fund currency is EURO, the buy/sell date is stated in startLine +11
  if (textArr[startLine + 3] === textArr[startLine + 5]) {
    return getGermanDate(textArr[startLine + 11]);
  }
  //if the fund currency is NOT in EURO
  //then two additional lines for fxrate are added,
  //so the buy/sell date is stated in line +13
  else {
    return getGermanDate(textArr[startLine + 13]);
  }
};

const findFee = (textArr, startLine) => {
  let fee = 0;
  //Every transaction/dividend statement has a maximum span of 45 lines
  for (let line = 0; line < 45; line++) {
    //Fee is below the line titled "Trasaktionskosten", otherwise zero.
    if (textArr[startLine + line].startsWith('Transaktionskosten')) {
      fee = parseGermanNum(textArr[startLine + line + 1]);
      break;
    }
  }
  return +Big(fee);
};

const findTax = (textArr, startLine) => {
  let kest = 0,
    soli = 0,
    kist = 0;
  for (let line = 0; line < 45; line++) {
    //Every transaction is searched for the three types of taxes
    //The value is definied in the line below
    if (textArr[startLine + line].endsWith('Kapitalertragsteuer')) {
      kest = parseGermanNum(textArr[startLine + line + 1]);
    }
    if (textArr[startLine + line].endsWith('Solidaritätszuschlag')) {
      soli = parseGermanNum(textArr[startLine + line + 1]);
    }
    if (textArr[startLine + line].endsWith('Kirchensteuer')) {
      kist = parseGermanNum(textArr[startLine + line + 1]);
    }
  }
  return +Big(kest).plus(Big(soli)).plus(Big(kist));
};

const findFxRateForeignCurrency = (textArr, startLine) => {
  let fxRate = undefined;
  let foreignCurrency = undefined;
  //fxRate is only stated when fund currency (startLine+5) isn't EUR (startLine+3)
  if (textArr[startLine + 3] !== textArr[startLine + 5]) {
    fxRate = parseGermanNum(textArr[startLine + 11]);
    foreignCurrency = textArr[startLine + 12];
  }
  return [fxRate, foreignCurrency];
};

const getDocumentType = content => {
  //Buy, Sell, Wiederanlage, Entgeltbelastung are processed as type Transaction
  //only dividend statement has to be processed differently
  for (let lineNumber = 0; lineNumber < content.length; lineNumber++) {
    if (
      content[lineNumber].startsWith('Kauf') ||
      content[lineNumber].startsWith('Verkauf') ||
      content[lineNumber] === 'Entgeltbelastung' ||
      //Wiederanlage is an automtatic reinvest of dividends (=buy order)
      //If "Wiederanlage" is followed by the line "zur Verfügung stehend",
      //then this is not a buy order, instead it's part of the dividend statement.
      (content[lineNumber] === 'Wiederanlage' &&
        content[lineNumber + 1] !== 'zur Verfügung stehend')
    ) {
      return 'Transaction';
    } else if (content.includes('Ausschüttungsanzeige')) {
      //check for foreign currency in dividend statement; this is currently not supported
      let referenceLine = content.findIndex(content =>
        content.includes('Ausschüttung vor Teilfreistellung')
      );
      if (
        content[referenceLine + 2] !== 'EUR' ||
        content[referenceLine + 4] !== 'EUR'
      ) {
        return 'Unsupported';
      } else {
        return 'Dividend';
      }
    }
  }
  return undefined;
};

export const canParseDocument = (pages, extension) => {
  //older documents don't contain the identification string "FFB", so "FIL" is also needed
  const firstPageContent = pages[0];
  return (
    extension === 'pdf' &&
    firstPageContent.some(
      line => line.includes('FFB') || line.includes('FIL')
    ) &&
    getDocumentType(firstPageContent) !== undefined
  );
};

const parseData = (textArr, type, startLine, sellForFee) => {
  let activity = {
    broker: 'ffb',
    type,
    fee: 0,
    tax: 0,
  };
  let date, fxRate, foreignCurrency;

  switch (activity.type) {
    case 'Buy': {
      date = findDateBuySell(textArr, startLine);
      [fxRate, foreignCurrency] = findFxRateForeignCurrency(textArr, startLine);
      [activity.isin, activity.wkn] = [
        textArr[startLine + 10],
        textArr[startLine + 8],
      ];
      activity.company = textArr[startLine + 1].trim();
      activity.amount = +Big(parseGermanNum(textArr[startLine + 2]));
      activity.shares = parseGermanNum(textArr[startLine + 6]);
      activity.price = +Big(activity.amount).div(activity.shares);
      activity.fee = findFee(textArr, startLine);
      break;
    }
    case 'Sell': {
      [activity.isin, activity.wkn] = [
        textArr[startLine + 10],
        textArr[startLine + 8],
      ];
      activity.company = textArr[startLine + 1].trim();
      date = findDateBuySell(textArr, startLine);
      [fxRate, foreignCurrency] = findFxRateForeignCurrency(textArr, startLine);
      activity.shares = -parseGermanNum(textArr[startLine + 6]);
      activity.amount = +Big(parseGermanNum(textArr[startLine + 2]));
      activity.price = +Big(activity.amount).div(activity.shares);
      activity.tax = findTax(textArr, startLine);
      //if type = "Entgeltbelastung", the payout is used for fee coverage, so payout is zero.
      if (sellForFee) {
        activity.fee = +Big(activity.amount).minus(Big(activity.tax));
      } else {
        activity.fee = findFee(textArr, startLine);
      }
      break;
    }
    case 'Dividend': {
      let referenceLine = textArr.findIndex(line =>
        line.includes('Ausschüttung vor Teilfreistellung')
      );
      activity.isin = textArr[referenceLine - 12];
      activity.wkn = textArr[referenceLine - 14];
      activity.company = textArr[referenceLine - 18];
      date = textArr[referenceLine - 16];
      activity.shares = parseGermanNum(textArr[referenceLine - 4]);
      activity.amount = +Big(parseGermanNum(textArr[referenceLine + 3]));
      activity.price = +Big(activity.amount).div(activity.shares);
      activity.tax = findFee(textArr, referenceLine);
      activity.fee = 0;
      break;
    }
  }
  //no time in document, manually set to 12:00
  [activity.date, activity.datetime] = createActivityDateTime(date, '12:00');
  if (fxRate !== undefined) {
    activity.fxRate = fxRate;
    activity.foreignCurrency = foreignCurrency;
  }
  return validateActivity(activity);
};

export const parsePages = contents => {
  const allPagesFlat = contents.flat();
  const type = getDocumentType(allPagesFlat);
  let activities = [];
  if (type === 'Unsupported') {
    //dividends with foreign currency not supported yet.
    return {
      activities,
      status: 6,
    };
  } else if (type === 'Transaction') {
    for (let lineNumber = 0; lineNumber < allPagesFlat.length; lineNumber++) {
      if (
        allPagesFlat[lineNumber].startsWith('Kauf') ||
        (allPagesFlat[lineNumber] === 'Wiederanlage' &&
          allPagesFlat[lineNumber + 1] !== 'zur Verfügung stehend')
      ) {
        activities.push(parseData(allPagesFlat, 'Buy', lineNumber, false));
      } else if (allPagesFlat[lineNumber].startsWith('Verkauf')) {
        activities.push(parseData(allPagesFlat, 'Sell', lineNumber, false));
      } else if (allPagesFlat[lineNumber] === 'Entgeltbelastung') {
        activities.push(parseData(allPagesFlat, 'Sell', lineNumber, true));
      } else {
        continue;
      }
    }
  } else if (type === 'Dividend') {
    activities.push(parseData(allPagesFlat, 'Dividend', 0, false));
  }
  return {
    activities,
    status: 0,
  };
};

export const parsingIsTextBased = () => true;
