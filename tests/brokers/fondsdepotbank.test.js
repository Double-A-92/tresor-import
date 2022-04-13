import * as fondsdepotbank from '../../src/brokers/fondsdepotbank';
import { validateAllSamples } from '../setup/brokers';
import {
  buySamples,
  sellSamples,
  dividendSamples,
  allSamples,
} from './__mocks__/fondsdepotbank';

describe('Broker: fondsdepotbank', () => {
  let consoleErrorSpy;

  validateAllSamples(fondsdepotbank, allSamples, 'fondsdepotbank');

  describe('Validate buys', () => {
    test('Can the order parsed from single buy', () => {
      const activities = fondsdepotbank.parsePages(buySamples[0]).activities;

      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'fondsdepotbank',
        type: 'Buy',
        date: '2018-08-22',
        datetime: '2018-08-22T' + activities[0].datetime.substring(11),
        isin: 'DE1234512345',
        wkn: 'ABCDEF',
        company: 'Testfond',
        shares: 11.867,
        price: 200.63031937305132,
        amount: 2380.88,
        fee: 119.12,
        tax: 0,
      });
    });

    test('Can the order parsed from single buy by exchange', () => {
      const activities = fondsdepotbank.parsePages(buySamples[1]).activities;

      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'fondsdepotbank',
        type: 'Buy',
        date: '2020-05-12',
        datetime: '2020-05-12T' + activities[0].datetime.substring(11),
        isin: 'DE1234512345',
        wkn: 'ABCDEF',
        company: 'Testfond',
        shares: 103.7,
        price: 25.30009643201543,
        amount: 2623.62,
        fee: 0,
        tax: 0,
      });
    });

    test('Can the order parsed from multiple savings', () => {
      const activities = fondsdepotbank.parsePages(buySamples[2]).activities;

      expect(activities.length).toEqual(5);
      expect(activities[0]).toEqual({
        broker: 'fondsdepotbank',
        type: 'Buy',
        date: '2021-02-10',
        datetime: '2021-02-10T' + activities[0].datetime.substring(11),
        isin: 'DE1234512345',
        wkn: 'ABCDEF',
        company: 'Testfond',
        shares: 0.196,
        price: 218.1122448979592,
        amount: 42.75,
        fee: 2.25,
        tax: 0,
      });
    });

    test('Can the order parsed from multiple savings with reinvest', () => {
      const activities = fondsdepotbank.parsePages(buySamples[3]).activities;

      expect(activities.length).toEqual(4);
      expect(activities[2]).toEqual({
        broker: 'fondsdepotbank',
        type: 'Buy',
        date: '2019-09-03',
        datetime: '2019-09-03T' + activities[0].datetime.substring(11),
        isin: 'DE1234512345',
        wkn: 'ABCDEF',
        company: 'Testfond',
        shares: 0.217,
        price: 175.48387096774192,
        amount: 38.08,
        fee: 1.92,
        tax: 0,
      });
      expect(activities[3]).toEqual({
        broker: 'fondsdepotbank',
        type: 'Buy',
        date: '2019-09-20',
        datetime: '2019-09-20T' + activities[0].datetime.substring(11),
        isin: 'DE1234512345',
        wkn: 'ABCDEF',
        company: 'Testfond',
        shares: 0.529,
        price: 170.17013232514176,
        amount: 90.02,
        fee: 0,
        tax: 0,
      });
    });
  });

  describe('Validate sells', () => {
    test('Can the order parsed from single sell as exchange', () => {
      const activities = fondsdepotbank.parsePages(sellSamples[0]).activities;

      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'fondsdepotbank',
        type: 'Sell',
        date: '2020-05-11',
        datetime: '2020-05-11T' + activities[0].datetime.substring(11),
        isin: 'DE1234512345',
        wkn: 'ABCDEF',
        company: 'Testfond',
        shares: 22.496,
        price: 147.29018492176388,
        amount: 3313.44,
        fee: 0,
        tax: 0,
      });
    });

    test('Can the order parsed from single sell with taxes', () => {
      const activities = fondsdepotbank.parsePages(sellSamples[1]).activities;

      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'fondsdepotbank',
        type: 'Sell',
        date: '2020-06-30',
        datetime: '2020-06-30T' + activities[0].datetime.substring(11),
        isin: 'DE1234512345',
        wkn: 'ABCDEF',
        company: 'Testfond',
        shares: 180.379,
        price: 96.30999173961492,
        amount: 17372.3,
        fee: 0,
        tax: 139.57,
      });
    });
  });

  describe('Validate dividends', () => {
    test('Can the dividend in EUR parsed from the document', () => {
      const activities = fondsdepotbank.parsePages(dividendSamples[0])
        .activities;

      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'fondsdepotbank',
        type: 'Dividend',
        date: '2018-11-15',
        datetime: '2018-11-15T' + activities[0].datetime.substring(11),
        isin: 'DE1234512345',
        wkn: 'ABCDEF',
        company: 'Testfond',
        shares: 176.987,
        price: 1.0000169503974867,
        amount: 176.99,
        fee: 0,
        tax: 0,
      });
    });

    test('Can the dividend in EUR parsed from the document with taxes', () => {
      const activities = fondsdepotbank.parsePages(dividendSamples[1])
        .activities;

      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'fondsdepotbank',
        type: 'Dividend',
        date: '2018-11-15',
        datetime: '2018-11-15T' + activities[0].datetime.substring(11),
        isin: 'DE1234512345',
        wkn: 'ABCDEF',
        company: 'Testfond',
        shares: 176.987,
        price: 1.0000169503974867,
        amount: 176.99,
        fee: 0,
        tax: 8.55,
      });
    });
  });

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
});
