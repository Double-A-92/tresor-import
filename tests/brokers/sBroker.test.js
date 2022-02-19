import * as sbroker from '../../src/brokers/sbroker';
import { validateAllSamples } from '../setup/brokers';
import {
  buySamples,
  dividendSamples,
  allSamples,
  sellSamples,
} from './__mocks__/sbroker';

describe('Broker: sBroker', () => {
  validateAllSamples(sbroker, allSamples, 'sBroker');

  describe('Buy', () => {
    test('Can parse document: 2021_LU0323578657', () => {
      const result = sbroker.parsePages(buySamples[0]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Buy',
          date: '2021-05-21',
          datetime: '2021-05-21T' + result.activities[0].datetime.substring(11),
          isin: 'LU0323578657',
          company: 'Flossb.v.Storch-Mult.Opport. Inhaber-Anteile R o.N.',
          shares: 1.025,
          price: 294.94,
          amount: 302.31,
          fee: 0,
          tax: 0,
        },
      ]);
    });

    test('Can parse document: 2021_GB00B24CGK77', () => {
      const result = sbroker.parsePages(buySamples[1]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Buy',
          date: '2021-08-03',
          datetime: '2021-08-03T07:04:00.000Z',
          isin: 'GB00B24CGK77',
          company: 'Reckitt Benckiser Group Registered Shares LS -,10',
          shares: 15,
          price: 66.5,
          amount: 997.5,
          fee: 9.97,
          tax: 0,
        },
      ]);
    });

    test('Can parse document: 2021_LU0292096186', () => {
      const result = sbroker.parsePages(buySamples[2]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Buy',
          date: '2021-08-05',
          datetime: '2021-08-05T07:04:00.000Z',
          isin: 'LU0292096186',
          company: 'Xtr.Stoxx Gbl Sel.Div.100 Swap Inhaber-Anteile 1D o.N.',
          shares: 2.042,
          price: 29.355,
          amount: 59.94,
          fee: 0,
          tax: 0,
        },
      ]);
    });
  });

  describe('Sell', () => {
    test('Can parse document: 2021_CH0108503795', () => {
      const result = sbroker.parsePages(sellSamples[0]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Sell',
          date: '2021-06-15',
          datetime: '2021-06-15T08:33:00.000Z',
          isin: 'CH0108503795',
          company: 'Meyer Burger Technology AG Nam.-Aktien SF -,05',
          shares: 5000,
          price: 0.404,
          amount: 2020.0,
          fee: 11.02,
          tax: 0,
        },
      ]);
    });
  });

  describe('Dividend', () => {
    test('Can parse document: 2021_US4781601046', () => {
      const result = sbroker.parsePages(dividendSamples[0]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Dividend',
          date: '2021-06-08',
          datetime: '2021-06-08T' + result.activities[0].datetime.substring(11),
          isin: 'US4781601046',
          company: 'Johnson & Johnson Registered Shares DL 1',
          shares: 8,
          price: 0.8734416071325571,
          amount: 6.987532857060457,
          fee: 0,
          tax: 1.046481925526743,
          fxRate: 1.21359,
          foreignCurrency: 'USD',
        },
      ]);
    });

    test('Can parse document: 2021_DE000A2NB650', () => {
      const result = sbroker.parsePages(dividendSamples[1]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Dividend',
          date: '2021-05-26',
          datetime: '2021-05-26T' + result.activities[0].datetime.substring(11),
          isin: 'DE000A2NB650',
          company: 'Mutares SE & Co. KGaA Namens-Aktien o.N.',
          shares: 40,
          price: 1.5,
          amount: 60,
          fee: 0,
          tax: 0,
        },
      ]);
    });

    test('Can parse document: 2021_IE00B78JSG98', () => {
      const result = sbroker.parsePages(dividendSamples[2]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Dividend',
          date: '2021-08-05',
          datetime: '2021-08-05T' + result.activities[0].datetime.substring(11),
          isin: 'IE00B78JSG98',
          company: 'UBS(I)ETF-MSCI USA VALUE U.E. Reg. Shares A Dis. USD o.N.',
          shares: 4,
          price: 0.6889051254272589,
          amount: 2.7556205017090356,
          fee: 0,
          tax: 0,
          fxRate: 1.19073,
          foreignCurrency: 'USD',
        },
      ]);
    });

    test('Can parse document: 2021_US1912161007', () => {
      const result = sbroker.parsePages(dividendSamples[3]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Dividend',
          date: '2021-07-01',
          datetime: '2021-07-01T' + result.activities[0].datetime.substring(11),
          isin: 'US1912161007',
          company: 'Coca-Cola Co., The Registered Shares XX -,00',
          shares: 1,
          price: 0.35200348651072355,
          amount: 0.35200348651072355,
          fee: 0,
          tax: 0.38381035393112465,
          fxRate: 1.19317,
          foreignCurrency: 'USD',
        },
      ]);
    });

    test('Can parse document: 2021_LU0292096186', () => {
      const result = sbroker.parsePages(dividendSamples[4]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Dividend',
          date: '2021-05-28',
          datetime: '2021-05-28T' + result.activities[0].datetime.substring(11),
          isin: 'LU0292096186',
          company: 'Xtr.Stoxx Gbl Sel.Div.100 Swap Inhaber-Anteile 1D o.N.',
          shares: 52.349,
          price: 1.4288,
          amount: 74.7962512,
          fee: 0,
          tax: 0,
        },
      ]);
    });

    test('Can parse document: 2021_US3765361080', () => {
      const result = sbroker.parsePages(dividendSamples[5]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Dividend',
          date: '2021-07-30',
          datetime: '2021-07-30T' + result.activities[0].datetime.substring(11),
          isin: 'US3765361080',
          company: 'Gladstone Commercial Corp. Registered Shares DL -,01',
          shares: 60,
          price: 0.10579841238978452,
          amount: 6.347904743387071,
          fee: 0,
          tax: 0.955271322416752,
          fxRate: 1.18291,
          foreignCurrency: 'USD',
        },
      ]);
    });
  });
});
