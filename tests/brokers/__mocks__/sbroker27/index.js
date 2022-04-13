export const buySamples = [
  require('./buy/2021_GB0002875804.json'),
  require('./buy/2021_LU0322253906.json'),
  require('./buy/2021_IE00BFY0GT14.json'),
  require('./buy/2022_LU0292096186.json'),
];

export const sellSamples = [require('./sell/2022_IE00B652H904.json')];

export const dividendSamples = [
  require('./dividend/2021_US88579Y1010.json'),
  require('./dividend/2021_NO0003054108.json'),
  require('./dividend/2021_US1713401024.json'),
  require('./dividend/2021_US3765361080.json'),
  require('./dividend/2021_DE000ETFL508.json'),
];

export const allSamples = buySamples.concat(sellSamples, dividendSamples);
