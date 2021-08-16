export const buySamples = [require('./buy/2021_LU0323578657.json')];

export const sellSamples = [require('./sell/2021_CH0108503795.json')];

export const dividendSamples = [
  require('./dividend/2021_US4781601046.json'),
  require('./dividend/2021_DE000A2NB650.json'),
  require('./dividend/2021_IE00B78JSG98.json'),
  require('./dividend/2021_US1912161007.json'),
];

export const allSamples = buySamples.concat(sellSamples, dividendSamples);
