import { createActivityDateTime, validateActivity } from '@/helper';

/*** PDF ****/
const financialInstruments = [];

function loadPDF(content) {
  const activities = [];

  loadFinancialInstrumentTable(content);

  let startOfTrades = content.indexOf('Trades');
  if (startOfTrades > 0) {
    const trades = {
      start: startOfTrades + 1,
      pointer: startOfTrades + 1,
      content,
      activities
    };
    while (
      trades.pointer !== -1 &&
      trades.pointer < trades.content.length
      ) {
      parseOneTrade(trades);
    }
  }

  return {
    activities: activities,
    status: 0
  };
}

function parseOneTrade(trades) {
  let i = trades.pointer;

  if (trades.content[i] === 'Symbol') {
    const stockSection = trades.content.indexOf('Stocks', i);
    const cfdSection = trades.content.indexOf('CFDs', i);
    if (
      stockSection !== -1 &&
      (stockSection < cfdSection || cfdSection === -1)
    ) {
      trades.start = stockSection + 1;
      trades.pointer = i = trades.start + 1;
    } else if (cfdSection !== -1) {
      trades.start = cfdSection + 1;
      trades.pointer = i = trades.start + 1;
    }
  }

  if (i + 11 > trades.content.length) {
    trades.pointer = i + 11;
    console.warn(
      'Not enough data to read',
      i,
      trades.pointer,
      trades.content.length
    );
    return;
  }
  const currency = trades.content[trades.start]; // eslint-disable-line no-unused-vars
  const symbol = trades.content[i++];
  const date = trades.content[i].substr(0, trades.content[i++].length - 1);
  const time = trades.content[i++];
  const quantity = trades.content[i++].replace(',', '');
  const tprice = trades.content[i++].replace(',', '');
  const cprice = trades.content[i++].replace(',', ''); // eslint-disable-line no-unused-vars
  const proceeds = trades.content[i++].replace(',', '');
  const fee = trades.content[i++].replace(',', '');
  const basis = trades.content[i++].replace(',', ''); // eslint-disable-line no-unused-vars
  const realized = trades.content[i++].replace(',', ''); // eslint-disable-line no-unused-vars
  const marketToMarketPL = trades.content[i++]; // eslint-disable-line no-unused-vars
  const code = trades.content[i++];

  if (trades.content[i] === `Total ${symbol}`) {
    i += 7; // skip symbol summary
  }
  if (trades.content[i] === 'Total') {
    i += 6; // skip section summary
  }
  if (trades.content[i].startsWith('Total in ')) {
    i += 6;
  }
  if (trades.content[i] === 'Transfers') {
    i = trades.content.length; // end of trades section
  }

  trades.pointer = i;

  const instrumentInfo = financialInstruments.find(
    item => item.symbol === symbol
  );

  if (instrumentInfo == null) {
    console.warn(
      `Unable to lookup ISIN for symbol '${symbol}'. Is it a CFD? Lynx unfortunately doesn't expose the CFD's underlying ISIN.`
    );
  }
  let [parsedDate, parsedDateTime] = createActivityDateTime(
    date,
    time,
    'yyyy-MM-dd',
    'yyyy-MM-dd HH:mm:ss'
  )
  const activity = {
    broker: 'Interactive Brokers',
    type: code && code.toLowerCase() === 'o' ? 'Buy' : 'Sell',
    date: parsedDate,
    datetime: parsedDateTime,
    isin: instrumentInfo && instrumentInfo.isin,
    company: (instrumentInfo && instrumentInfo.description) || symbol,
    shares: Math.abs(parseFloat(quantity)),
    price: parseFloat(tprice),
    amount: Math.abs(parseFloat(proceeds)),
    fee: Math.abs(parseFloat(fee)),
    tax: 0,
    fxRate: '1', // Unknown
    foreignCurrency: currency
  };

  if (validateActivity(activity) !== undefined) {
    trades.activities.push(activity);
  }
}

/**
 * @param {string[]} content
 */
function loadFinancialInstrumentTable(content) {
  let startOfInstruments = content.findIndex((line) => line.startsWith('Financial Instrument Information'));
  if (startOfInstruments === -1) {
    console.warn('No Financial Instrument Info Table found');
    return;
  }
  let i = content.indexOf('Stocks', startOfInstruments) + 1;

  while (
    content[i] !== 'Symbol' &&
    content[i] !== 'Codes' &&
    i < content.length
    ) {
    const symbol = content[i++];
    let description = '';
    while (!/^\d+$/.test(content[i])) {
      description += content[i++];
    }
    const conId = content[i++]; // eslint-disable-line no-unused-vars
    const isin = content[i++];

    financialInstruments.push({
      symbol,
      description,
      isin
    });
    i += 3; // skip rest of the line
  }
}

/**** CSV ****/

const parseActivityStatement = content => {
  let info = parseFinancialInstrumentInformation(content);

  return parseTrades(content, info);
};

/**
 *
 * @param {string[]} content
 * @param {Map<string, {name: string, isin: string}>} info
 * @returns {*}
 */
const parseTrades = (content, info) => {
  let tradeSectionHeader = content.filter(t =>
    t.startsWith('Transaktionen,Header,DataDiscriminator,') ||
    t.startsWith('Trades,Header,DataDiscriminator,')
  );
  let isMultiAccount =
    tradeSectionHeader.length > 0 && tradeSectionHeader[0].includes('Account');

  let tradeSection = content.filter(t => t.startsWith('Transaktionen,Data,') || t.startsWith('Trades,Data,'));
  let trades = tradeSection.map(trade =>
    parseTrade(trade, info, isMultiAccount)
  );
  return trades.filter(x => !!x); // Remove null and other invalid values
};

/**
 *
 * @param {string} trade
 * @param {Map<string, {name: string, isin: string}>} info
 * @param {boolean} isMultiAccount
 * @returns {*|null}
 */
const parseTrade = (trade, info, isMultiAccount) => {
  let activity = {
    broker: 'Interactive Brokers',
    tax: 0
  };

  // Split at comma, but not inside quoted strings
  const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/gm;
  let tradeValues = trade.split(regex);
  let offset = isMultiAccount ? 1 : 0; // Offset for extra 5th column ('Account') in multi-account report

  // Security Information
  if (!info.has(tradeValues[5 + offset])) return null; // Skip trades which don't have an ISIN
  activity.company = info.get(tradeValues[5 + offset]).name;
  activity.isin = info.get(tradeValues[5 + offset]).isin;

  // Number of shares
  let shares = parseFloat(tradeValues[7 + offset].replace('"', '').replace(',', '')); // remove quotes and 1000s separator
  activity.type = shares > 0 ? 'Buy' : 'Sell';
  activity.shares = Math.abs(shares);

  // Price and Costs
  activity.price = parseFloat(tradeValues[8 + offset]);
  activity.amount = Math.abs(Number.parseFloat(tradeValues[10 + offset]));
  activity.fee = Number.parseFloat(tradeValues[11 + offset])

  // Date / Time
  let timeValues = tradeValues[6 + offset].slice(1, -1).split(', ');
  let [parsedDate, parsedDateTime] = createActivityDateTime(
    timeValues[0],
    timeValues[1],
    'yyyy-MM-dd',
    'yyyy-MM-dd HH:mm:ss'
  );
  activity.date = parsedDate;
  activity.datetime = parsedDateTime;

  // Currency
  activity.foreignCurrency = tradeValues[4];
  // TODO this is not known, because the information is not present in the document
  //      could be fixed later: https://github.com/tresorone/tresor-import/pull/2958#issuecomment-954181438
  activity.fxRate = '1';

  return validateActivity(activity);
};

/**
 *
 * @param {string[]} content
 * @returns {Map<string, {name: string, isin: string}>}
 */
const parseFinancialInstrumentInformation = content => {
  let infoContent = content.filter(t =>
    t.startsWith('Informationen zum Finanzinstrument,Data,') ||
    t.startsWith('Financial Instrument Information,Data,')
  );

  let info = new Map();
  infoContent.forEach(line => {
    let lineValues = line.split(',');
    info.set(lineValues[3], { name: lineValues[4], isin: lineValues[6] });
  });

  return info;
};

/*** Common ****/

const DocumentType = {
  CSVActivityStatement: 'CSVActivityStatement',
  Unsupported: 'Unsupported',
  PDF: 'PDF'
};

/**
 *
 * @param {string[]} content
 * @returns {string}
 */
const getDocumentType = content => {
  if (content.includes('Statement,Data,Title,Umsatzübersicht') || content.includes('Statement,Data,Title,Activity Statement')) {
    return DocumentType.CSVActivityStatement;
  } else if (couldBePDF(content.flat())) {
    return DocumentType.PDF;
  }

  return DocumentType.Unsupported;
};


function couldBePDF(content) {
  return (
    content.some(line => line.includes('Broker Client')) &&
    content.some(line => line.includes('Activity Statement')) &&
    content.some(line => line.includes('Trades')) &&
    content.some(line => line.includes('Financial Instrument Information'))
  );
}

/**
 *
 * @param {string[][]} pages
 * @param {string} extension
 * @returns {*|false|boolean}
 */
export const canParseDocument = (pages, extension) => {
  const content = pages.flat();
  const firstPageContent = pages[0];
  return (
    (extension === 'pdf' && couldBePDF(content)) ||
    (extension === 'csv' &&
      firstPageContent.includes(
        'Statement,Data,Title,Activity Statement'
      ) &&
      getDocumentType(firstPageContent) !== DocumentType.Unsupported)
  );
};

export const parsePages = contents => {
  const content = contents.flat();

  const typeOfDocument = getDocumentType(content);

  switch (typeOfDocument) {
    case DocumentType.PDF:
      return loadPDF(content);
    case DocumentType.Unsupported:
      // We know this type and we don't want to support it.
      return {
        activities: [],
        status: 7
      };
    case DocumentType.CSVActivityStatement:
      return {
        activities: parseActivityStatement(content),
        status: 0
      };
  }
};
export const parsingIsTextBased = () => true;
