import * as sbroker from '../../src/brokers/sbroker27';
import {
  allSamples,
  buySamples,
  sellSamples,
  dividendSamples,
} from './__mocks__/sbroker27';
import { validateAllSamples } from '../setup/brokers';

describe('Broker: sBroker27', () => {
  validateAllSamples(sbroker, allSamples, 'sBroker27');

  describe('Buy', () => {
    test('Can parse document: 2021_GB0002875804', () => {
      const result = sbroker.parsePages(buySamples[0]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Buy',
          date: '2021-11-30',
          datetime: '2021-11-30T09:27:32.000Z',
          isin: 'GB0002875804',
          wkn: '916018',
          company: 'BRITISH AMERICAN TOBACCO PLC REGISTERED SHARES LS -,25',
          shares: 33,
          price: 29.9,
          amount: 986.7,
          fee: 9.97,
          tax: 0,
        },
      ]);
    });

    test('Can parse document: 2021_LU0322253906', () => {
      const result = sbroker.parsePages(buySamples[1]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Buy',
          date: '2021-11-22',
          datetime: '2021-11-22T' + result.activities[0].datetime.substring(11),
          isin: 'LU0322253906',
          wkn: 'DBX1AU',
          company: 'XTR.MSCI EUROPE SMALL CAP INHABER-ANTEILE 1C O.N.',
          shares: 3.9327,
          price: 63.56955781015587,
          amount: 250,
          fee: 0,
          tax: 0,
        },
      ]);
    });

    test('Can parse document: 2021_IE00BFY0GT14', () => {
      const result = sbroker.parsePages(buySamples[2]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Buy',
          date: '2021-11-22',
          datetime: '2021-11-22T' + result.activities[0].datetime.substring(11),
          isin: 'IE00BFY0GT14',
          wkn: 'A2N6CW',
          company: 'SPDR MSCI WORLD UCITS ETF REG.SHARES USD UNHGD ACC. O.N.',
          shares: 5.2279,
          price: 28.692209108819984,
          amount: 150,
          fee: 3.75,
          tax: 0,
        },
      ]);
    });

    test('Can parse document: 2022_LU0292096186', () => {
      const result = sbroker.parsePages(buySamples[3]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Buy',
          date: '2022-02-07',
          datetime: '2022-02-07T' + result.activities[0].datetime.substring(11),
          isin: 'LU0292096186',
          wkn: 'DBX1DG',
          company: 'XTR.STOXX GBL SEL.DIV.100 SWAP INHABER-ANTEILE 1D O.N.',
          shares: 1.5936,
          price: 31.37550200803213,
          amount: 50,
          fee: 0,
          tax: 0,
        },
      ]);
    });
  });

  describe('Sell', () => {
    test('Can parse document: 2022_IE00B652H904', () => {
      const result = sbroker.parsePages(sellSamples[0]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Sell',
          date: '2022-03-01',
          datetime: '2022-03-01T' + result.activities[0].datetime.substring(11),
          isin: 'IE00B652H904',
          wkn: 'A1JNZ9',
          company: 'ISHSV-EM DIVIDEND UCITS ETF REGISTERED SHARES USD O.N.',
          shares: 56,
          price: 17.243214285714284,
          amount: 965.62,
          fee: 9.97,
          tax: 0,
        },
      ]);
    });
  });

  describe('Dividend', () => {
    test('Can parse document: 2021_US88579Y1010', () => {
      const result = sbroker.parsePages(dividendSamples[0]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Dividend',
          date: '2021-12-13',
          datetime: '2021-12-13T' + result.activities[0].datetime.substring(11),
          isin: 'US88579Y1010',
          wkn: '851745',
          company: '3M CO. REGISTERED SHARES DL -,01',
          shares: 20,
          price: 1.305575158786168,
          amount: 26.11150317572336,
          fee: 0,
          tax: 6.671503175723359,
          fxRate: 1.1336,
          foreignCurrency: 'USD',
        },
      ]);
    });

    test('Can parse document: 2021_NO0003054108', () => {
      const result = sbroker.parsePages(dividendSamples[1]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Dividend',
          date: '2021-11-29',
          datetime: '2021-11-29T' + result.activities[0].datetime.substring(11),
          isin: 'NO0003054108',
          wkn: '924848',
          company: 'MOWI ASA NAVNE-AKSJER NK 7,50',
          shares: 50,
          price: 0.13571940981445219,
          amount: 6.785970490722609,
          fee: 0,
          tax: 1.695970490722609,
          fxRate: 10.3154,
          foreignCurrency: 'NOK',
        },
      ]);
    });

    test('Can parse document: 2021_US1713401024', () => {
      const result = sbroker.parsePages(dividendSamples[2]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Dividend',
          date: '2021-12-01',
          datetime: '2021-12-01T' + result.activities[0].datetime.substring(11),
          isin: 'US1713401024',
          wkn: '864371',
          company: 'CHURCH & DWIGHT CO. INC. REGISTERED SHARES DL 1',
          shares: 10,
          price: 0.22255453905700212,
          amount: 2.225545390570021,
          fee: 0,
          tax: 0.32554539057002113,
          fxRate: 1.1368,
          foreignCurrency: 'USD',
        },
      ]);
    });

    test('Can parse document: 2021_US3765361080', () => {
      const result = sbroker.parsePages(dividendSamples[3]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Dividend',
          date: '2021-11-30',
          datetime: '2021-11-30T' + result.activities[0].datetime.substring(11),
          isin: 'US3765361080',
          wkn: '260884',
          company: 'GLADSTONE COMMERCIAL CORP. REGISTERED SHARES DL -,01',
          shares: 60,
          price: 0.11019283746556474,
          amount: 6.6115702479338845,
          fee: 0,
          tax: 1.6815702479338843,
          fxRate: 1.1374,
          foreignCurrency: 'USD',
        },
      ]);
    });

    test('Can parse document: 2021_DE000ETFL508', () => {
      const result = sbroker.parsePages(dividendSamples[4]);

      expect(result.status).toEqual(0);
      expect(result.activities).toEqual([
        {
          broker: 'sBroker',
          type: 'Dividend',
          date: '2021-12-10',
          datetime: '2021-12-10T' + result.activities[0].datetime.substring(11),
          isin: 'DE000ETFL508',
          wkn: 'ETFL50',
          company: 'DEKA MSCI WORLD UCITS ETF INHABER-ANTEILE',
          shares: 46.4177,
          price: 0.07001639460809131,
          amount: 3.25,
          fee: 0,
          tax: 0.6,
        },
      ]);
    });
  });
});
