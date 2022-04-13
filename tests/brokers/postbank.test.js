import * as postbank from '../../src/brokers/postbank';
import { validateAllSamples } from '../setup/brokers';
import { dividendSamples, buySamples, allSamples } from './__mocks__/postbank';

console.error = jest.fn();

describe('Broker: Postbank', () => {
  validateAllSamples(postbank, allSamples, 'postbank');

  describe('Buy', () => {
    test('should map pdf data of buy_savings_plan_vanguard_ftse_all_world_1.json correctly', () => {
      const activities = postbank.parsePages(buySamples[0]).activities;

      expect(activities).toEqual([
        {
          type: 'Buy',
          amount: 800,
          broker: 'postbank',
          company: 'VANGUARD FTSE ALL-WORLD U.ETF',
          date: '2020-10-05',
          datetime: '2020-10-05T' + activities[0].datetime.substring(11),
          isin: 'IE00B3RBWM25',
          price: 79.68,
          shares: 10.0402,
          tax: 0,
          fee: 0.9,
        },
      ]);
    });
  });

  describe('Dividend', () => {
    test('should map pdf data of dividend_vanguard_ftse_all_world_1.json correctly', () => {
      const activities = postbank.parsePages(dividendSamples[0]).activities;

      expect(activities).toEqual([
        {
          type: 'Dividend',
          amount: 50.8,
          broker: 'postbank',
          company: 'VANGUARD FTSE ALL-WORLD U.ETF',
          date: '2020-10-07',
          datetime: '2020-10-07T' + activities[0].datetime.substring(11),
          isin: 'IE00B3RBWM25',
          price: 0.38539358319683975,
          shares: 131.8133,
          tax: 0,
          fee: 0,
        },
      ]);
    });
  });
});
