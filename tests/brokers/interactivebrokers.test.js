import * as ib from '../../src/brokers/interactivebrokers';
import Big from 'big.js';

const activityStatement = require('./__mocks__/interactivebrokers/account-statement-pdf.json');

describe('Broker: Interactive Brokers', () => {
  describe('canParseDocument', () => {
    test('should accept Buy, Sell, Div Lynx pdf only', () => {
      expect(ib.canParseDocument(activityStatement, 'pdf')).toEqual(true);
    });
  });

  describe('Buy', () => {
    test('should map pdf data of sample 1 correctly', () => {
      const result = ib.parsePages(activityStatement);

      expect(result.activities.length).toEqual(1);
      expect(result.activities[0]).toEqual({
        broker: 'Interactive Brokers',
        type: 'Buy',
        date: '2019-05-16',
        datetime: ['2019-05-16', '2019-05-16T04:00:00.000Z'],
        isin: 'US0378331005',
        company: 'APPLE INC.',
        shares: 4,
        price: 170,
        amount: 680,
        fee: +Big(5.8),
        tax: 0,
        foreignCurrency: "EUR",
        fxRate: "1"
      });
    });
  });
});
