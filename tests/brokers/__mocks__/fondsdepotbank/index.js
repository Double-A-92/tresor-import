export const buySamples = [
  require('./buy/singleBuy.json'),
  require('./buy/singleBuyExchange.json'),
  require('./buy/multipleBuysMultiplePages.json'),
  require('./buy/multipleBuysWithReinvest.json'),
];

export const sellSamples = [
  require('./sell/singleSellExchange.json'),
  require('./sell/singleSellWithTaxes.json'),
];

export const dividendSamples = [
  require('./dividend/singleDividendNoTax.json'),
  require('./dividend/singleDividendWithTax.json'),
];

export const allSamples = buySamples.concat(dividendSamples, sellSamples);
