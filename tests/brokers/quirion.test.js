import * as quirion from '../../src/brokers/quirion';
import { validateAllSamples } from '../setup/brokers';
import {
  allSamples,
  statementsSamples,
  dividendSamples,
} from './__mocks__/quirion';

describe('Broker: quirion', () => {
  validateAllSamples(quirion, allSamples, 'quirion');

  describe('Validate account statements', () => {
    test('Can parse document: 20201102', () => {
      const activities = quirion.parsePages(statementsSamples[1]).activities;

      expect(activities.length).toEqual(32);

      expect(activities[0]).toEqual({
        broker: 'quirion',
        type: 'Sell',
        date: '2020-10-05',
        datetime: '2020-10-05T' + activities[0].datetime.substring(11),
        isin: 'IE00B42THM37',
        company: 'Dimensional Fds-Emerg.MktsVa. Registered Shares EUR Dis.o.N.',
        shares: 9.977,
        price: 8.209882730279643,
        amount: 81.91,
        fee: 0,
        tax: 0,
      });

      expect(activities[31]).toEqual({
        broker: 'quirion',
        type: 'Buy',
        date: '2020-10-28',
        datetime: '2020-10-28T' + activities[31].datetime.substring(11),
        isin: 'LU1931974692',
        company: 'Amundi Index Solu.-A.PRIME GL.Nam.-Ant.UCI.ETF DR USD Dis.oN',
        shares: 0.184,
        price: 20,
        amount: 3.68,
        fee: 0,
        tax: 0,
      });
    });

    test('Can parse document: 20210731', () => {
      const activities = quirion.parsePages(statementsSamples[0]).activities;

      expect(activities.length).toEqual(24);

      expect(activities[0]).toEqual({
        broker: 'quirion',
        type: 'Buy',
        date: '2021-07-15',
        datetime: '2021-07-15T' + activities[0].datetime.substring(11),
        isin: 'LU1931974692',
        company: 'Amundi Index Solu.-A.PRIME GL.Nam.-Ant.UCI.ETF DR USD Dis.oN',
        shares: 37.722,
        price: 26.10996235618472,
        amount: 984.92,
        fee: 0,
        tax: 0,
      });

      expect(activities[23]).toEqual({
        broker: 'quirion',
        type: 'Buy',
        date: '2021-07-16',
        datetime: '2021-07-16T' + activities[23].datetime.substring(11),
        isin: 'IE00BKM4GZ66',
        company: 'iShs Core MSCI EM IMI U.ETF Registered Shares o.N.',
        shares: 0.08,
        price: 32.25,
        amount: 2.58,
        fee: 0,
        tax: 0,
      });
    });
  });

  describe('Validate dividends', () => {
    test('Can the dividend in EUR parsed from the document', () => {
      const activities = quirion.parsePages(dividendSamples[0]).activities;

      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'quirion',
        type: 'Dividend',
        date: '2021-09-30',
        datetime: '2021-09-30T' + activities[0].datetime.substring(11),
        isin: 'LU1109942653',
        wkn: 'DBX0PR',
        company: 'Xtr.II EUR H.Yield Corp.Bond Inhaber-Anteile 1D o.N.',
        shares: 10.714,
        price: 0.2688,
        amount: 2.88, // includes taxes
        fee: 0,
        tax: 0.75,
      });
    });
  });
});
