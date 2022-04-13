import * as degiro from '../../src/brokers/degiro';
import { validateAllSamples } from '../setup/brokers';
import Big from 'big.js';
import { transactionLog, depotOverview, allSamples } from './__mocks__/degiro';

describe('Broker: DEGIRO', () => {
  let consoleErrorSpy;

  validateAllSamples(degiro, allSamples, degiro);

  describe('Validate transactionLog', () => {
    test('Can the transactions be parsed from: buy_only_transactions', () => {
      const activities = degiro.parsePages(transactionLog[0]).activities;

      expect(activities.length).toEqual(7);
      expect(activities[0]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2020-03-30',
        datetime: '2020-03-30T14:09:00.000Z',
        isin: 'US64110L1061',
        company: 'NETFLIX INC. - COMMON',
        shares: 12,
        price: 332.7658333333333,
        amount: 3993.19,
        fee: 0.54,
        tax: 0,
        foreignCurrency: 'USD',
        fxRate: 1.1024,
        currency: 'EUR',
      });
      expect(activities[6]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2020-02-21',
        datetime: '2020-02-21T12:03:00.000Z',
        isin: 'KYG875721634',
        company: 'TENCENT HLDGS HD-,00002',
        shares: 416,
        price: 47.485,
        amount: 19753.76,
        fee: 25.28,
        tax: 0,
        currency: 'EUR',
      });
    });

    test('Can the transactions be parsed from: buy_sell_and_call_transactions', () => {
      const activities = degiro.parsePages(transactionLog[1]).activities;
      expect(activities.length).toEqual(28);
      expect(
        activities.filter(activity => activity !== undefined).length
      ).toEqual(28);
      expect(activities[5]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2019-05-31',
        datetime: '2019-05-31T07:00:00.000Z',
        isin: 'SE0011527845',
        company: 'QLINEA',
        shares: 100,
        price: 6.1153,
        amount: 611.53,
        fee: 4.36,
        tax: 0,
        fxRate: 10.6185,
        foreignCurrency: 'SEK',
        currency: 'EUR',
      });
      expect(activities[9]).toEqual({
        broker: 'degiro',
        type: 'Sell',
        date: '2019-05-14',
        datetime: '2019-05-14T18:12:00.000Z',
        isin: 'US9839191015',
        company: 'XILINX INC. - COMMON',
        shares: 8,
        price: 100.90625,
        amount: 807.25,
        fee: 0.52,
        tax: 0,
        fxRate: 1.1226,
        foreignCurrency: 'USD',
        currency: 'EUR',
      });
    });

    test('Can the transactions be parsed from: mixed_transaction_log_1', () => {
      const activities = degiro.parsePages(transactionLog[2]).activities;

      expect(activities.length).toEqual(16);
      expect(
        activities.filter(activity => activity !== undefined).length
      ).toEqual(16);
      expect(activities[0]).toEqual({
        broker: 'degiro',
        type: 'Sell',
        date: '2020-12-11',
        datetime: '2020-12-11T16:25:00.000Z',
        isin: 'US8969452015',
        company: 'TRIPADVISOR INC. - CO',
        shares: 47,
        price: 23.664468085106382,
        amount: 1112.23,
        fee: 0.66,
        tax: 0,
        fxRate: 1.2124,
        foreignCurrency: 'USD',
        currency: 'EUR',
      });
      expect(activities[15]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2020-12-08',
        datetime: '2020-12-08T15:55:00.000Z',
        isin: 'DE000KB9J0M8',
        company: 'CALL 16.12.21 NEXTERA 75',
        shares: 970,
        price: 0.62,
        amount: 601.4,
        fee: 2.66,
        tax: 0,
        currency: 'EUR',
      });
    });

    test('Can the transactions be parsed from: mixed_transaction_log_2', () => {
      const activities = degiro.parsePages(transactionLog[3]).activities;
      expect(activities.length).toEqual(237);
      expect(
        activities.filter(activity => activity !== undefined).length
      ).toEqual(237);
      expect(activities[0]).toEqual({
        broker: 'degiro',
        type: 'Sell',
        date: '2020-12-04',
        datetime: '2020-12-04T15:39:00.000Z',
        isin: 'US7615256093',
        company: 'REVLON INC. NEW COMMO',
        shares: 100,
        price: 11.7069,
        amount: 1170.69,
        fee: 0.83,
        tax: 0,
        fxRate: 1.216,
        foreignCurrency: 'USD',
        currency: 'EUR',
      });
      expect(activities[236]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2015-01-02',
        datetime: '2015-01-02T10:49:00.000Z',
        isin: 'DE000A1PHEL8',
        company: 'SNOWBIRD AG',
        shares: 196,
        price: 5.1,
        amount: 999.6,
        tax: 0,
        fee: 2.08,
        currency: 'EUR',
      });
    });

    test('Can parse 2021_transaction_log_1', () => {
      const activities = degiro.parsePages(transactionLog[4]).activities;
      expect(activities.length).toEqual(4);
      expect(
        activities.filter(activity => activity !== undefined).length
      ).toEqual(4);
      expect(activities[0]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2021-01-29',
        datetime: '2021-01-29T14:41:00.000Z',
        isin: 'US00165C1045',
        company: 'AMC ENTERTAINMENT HOLD',
        shares: 15,
        price: +Big(160.55).div(15),
        amount: 160.55,
        fee: 0.55,
        tax: 0,
        fxRate: 1.2134,
        foreignCurrency: 'USD',
        currency: 'EUR',
      });

      expect(activities[3]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2021-01-15',
        datetime: '2021-01-15T08:10:00.000Z',
        isin: 'CH0038863350',
        company: 'NESTLE SA',
        shares: 4,
        price: 92.81,
        amount: 371.24,
        fee: 4.19,
        tax: 0,
        fxRate: 1.0766,
        foreignCurrency: 'CHF',
        currency: 'EUR',
      });
    });

    test('Can parse 2021_transaction_log_2', () => {
      const activities = degiro.parsePages(transactionLog[5]).activities;
      expect(activities.length).toEqual(1);
      expect(
        activities.filter(activity => activity !== undefined).length
      ).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2021-01-26',
        datetime: '2021-01-26T13:54:00.000Z',
        isin: 'DE000TR6T1W3',
        company: 'CALL 15.12.21 NOKIA 8',
        shares: 207,
        price: 0.48,
        amount: 99.36,
        fee: 2.11,
        tax: 0,
        currency: 'EUR',
      });
    });

    test('Can parse all transactions of file: place_of_execution_empty.json', () => {
      const activities = degiro.parsePages(transactionLog[6]).activities;
      expect(activities.length).toEqual(35);
      expect(
        activities.filter(activity => activity !== undefined).length
      ).toEqual(35);
      expect(activities[0]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        company: 'CD PROJEKT RED SA',
        date: '2020-12-11',
        datetime: '2020-12-11T09:08:00.000Z',
        fee: 8.46,
        foreignCurrency: 'PLN',
        fxRate: 4.4388,
        isin: 'PLOPTTC00011',
        price: 72.02,
        shares: 30,
        amount: 2160.6,
        tax: 0,
        currency: 'EUR',
      });
    });

    test('Can parse a transactions that has no place of execution ', () => {
      const activities = degiro.parsePages(transactionLog[6]).activities;
      expect(activities.length).toEqual(35);
      expect(
        activities.filter(activity => activity.isin === 'AU000000APX3')[0]
      ).toEqual({
        broker: 'degiro',
        type: 'Buy',
        company: 'APPEN LTD',
        date: '2020-12-03',
        datetime: '2020-12-02T23:26:00.000Z',
        foreignCurrency: 'AUD',
        fxRate: 1.6319,
        isin: 'AU000000APX3',
        price: 18.745,
        shares: 50,
        amount: 937.25,
        fee: 10.56,
        tax: 0,
        currency: 'EUR',
      });
    });

    test('Can parse 2020_transaction_log_1', () => {
      const activities = degiro.parsePages(transactionLog[7]).activities;
      expect(activities.length).toEqual(24);
      expect(
        activities.filter(activity => activity !== undefined).length
      ).toEqual(24);
      expect(activities[0]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2020-11-23',
        datetime: '2020-11-23T11:13:00.000Z',
        isin: 'DE000KA5U0Z1',
        company: 'CALL 16.12.21 ASMLHOLD 340',
        shares: 307,
        price: 5.2,
        amount: 1596.4,
        fee: 3.76,
        tax: 0,
        currency: 'EUR',
      });

      expect(activities[23]).toEqual({
        broker: 'degiro',
        type: 'Sell',
        date: '2020-10-28',
        datetime: '2020-10-28T08:57:00.000Z',
        isin: 'DE000GF2AT89',
        company: 'TUBULL O.ENDMASTERC.303,301861',
        shares: 100,
        price: 0.001,
        amount: 0.1,
        fee: 0,
        tax: 0,
        currency: 'EUR',
      });
    });

    test('Can the transactions be parsed from: buy_only_transactions_it', () => {
      const activities = degiro.parsePages(transactionLog[8]).activities;

      expect(activities.length).toEqual(5);
      expect(activities[0]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2021-03-18',
        datetime: '2021-03-18T08:05:00.000Z',
        isin: 'IE00B4X9L533',
        company: 'HSBC MSCI WORLD',
        shares: 1,
        price: 23.73,
        amount: 23.73,
        fee: 23.73,
        tax: 0,
        currency: 'EUR',
      });
    });

    test('Can the transactions be parsed from: buy_only_transactions_it', () => {
      const activities = degiro.parsePages(transactionLog[9]).activities;

      expect(activities.length).toEqual(4);
      expect(activities[0]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2021-03-29',
        datetime: '2021-03-29T13:15:00.000Z',
        isin: 'US5951121038',
        company: 'MICRON TECHNOLOGY INC',
        shares: 9,
        price: 74.4,
        amount: 669.6,
        fee: 2.2,
        tax: 0,
        currency: 'EUR',
      });
    });

    test('Can parse document: 2022_degiro.ch.json', () => {
      const activities = degiro.parsePages(transactionLog[10]).activities;

      expect(activities.length).toEqual(10);
      expect(activities[0]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2022-02-07',
        datetime: '2022-02-07T08:26:00.000Z',
        isin: 'LU0908500753',
        company: 'LYXOR STOXX EUROPE 600 (DR) UCITS ETF',
        shares: 3,
        price: 210.56333333333333,
        amount: 631.69,
        fee: 2.65,
        tax: 0,
        currency: 'CHF',
        foreignCurrency: 'EUR',
        fxRate: 0.9452,
      });
      expect(activities[9]).toEqual({
        broker: 'degiro',
        type: 'Sell',
        date: '2022-01-18',
        datetime: '2022-01-18T08:06:00.000Z',
        isin: 'DE0002635307',
        company: 'ISHARES STOXX EUROPE 600 UCITS ETF (DE)',
        shares: 2,
        price: 49.62,
        amount: 99.24,
        fee: 0,
        tax: 0,
        currency: 'CHF',
        foreignCurrency: 'EUR',
        fxRate: 0.9588,
      });
    });

    test('Can parse document: 2022_degiro.de.json', () => {
      const activities = degiro.parsePages(transactionLog[11]).activities;

      expect(activities.length).toEqual(76);
      expect(activities[0]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2022-01-27',
        datetime: '2022-01-27T10:35:00.000Z',
        isin: 'IE00BM67HN09',
        company: 'XTRACKERS MSCI WORLD CONSUMER STAPLES UCITS ETF 1C',
        shares: 25,
        price: 41.2588,
        amount: 1031.47,
        fee: 2.6,
        tax: 0,
        currency: 'CHF',
        foreignCurrency: 'EUR',
        fxRate: 0.9628,
      });
      expect(activities[74]).toEqual({
        broker: 'degiro',
        type: 'Buy',
        date: '2021-04-09',
        datetime: '2021-04-09T07:09:00.000Z',
        isin: 'LU0340285161',
        company: 'UBS ETF MSCI WORLD UCITS ETF (USD) ADIS',
        shares: 1,
        price: 268.29,
        amount: 268.29,
        fee: 2.28,
        tax: 0,
        currency: 'CHF',
        foreignCurrency: 'EUR',
        fxRate: 0.9091,
      });
    });

    test('Can parse document: 2021_degiro.de_empty_values.json', () => {
      const activities = degiro.parsePages(transactionLog[12]).activities;

      expect(activities.length).toEqual(18);
      expect(activities[11]).toEqual({
        broker: 'degiro',
        type: 'Sell',
        date: '2021-09-15',
        datetime: '2021-09-15T18:27:00.000Z',
        isin: 'KYG851581069',
        company: 'STONECO LTD-A',
        shares: 1000,
        price: 34.53192,
        amount: 34531.92,
        fee: 3.89,
        tax: 0,
        currency: 'EUR',
        foreignCurrency: 'USD',
        fxRate: 1.1818,
      });
    });
  });

  describe('Validate Depot Overviews', () => {
    test('Can parse a Depot Overview from 2021', () => {
      const result = degiro.parsePages(depotOverview[0]);

      expect(result.status).toEqual(0);
      expect(result.activities.length).toEqual(6);
      expect(result.activities[0]).toEqual({
        broker: 'degiro',
        type: 'TransferIn',
        date: '2021-02-23',
        datetime: '2021-02-23T' + result.activities[0].datetime.substr(11),
        isin: 'GB00B18S7B29',
        company: 'AFC ENERGY PLC   LS -,001',
        shares: 17,
        price: 0.6711764705882353,
        amount: 11.41,
        fee: 0,
        tax: 0,
        currency: 'EUR',
      });
      expect(result.activities[5]).toEqual({
        broker: 'degiro',
        type: 'TransferIn',
        date: '2021-02-23',
        datetime: '2021-02-23T' + result.activities[0].datetime.substr(11),
        isin: 'DE000WACK012',
        company: 'WACKER NEUSON SE',
        shares: 2,
        price: 16.67,
        amount: 33.34,
        fee: 0,
        tax: 0,
        currency: 'EUR',
      });
    });

    test('Can parse a Depot Overview from 2021', () => {
      const result = degiro.parsePages(depotOverview[1]);

      expect(result.status).toEqual(0);
      expect(result.activities.length).toEqual(7);
      expect(result.activities[6]).toEqual({
        broker: 'degiro',
        type: 'TransferIn',
        date: '2021-03-22',
        datetime: '2021-03-22T' + result.activities[0].datetime.substr(11),
        isin: 'DE0007664039',
        company: 'VOLKSWAGEN AG',
        shares: 1,
        price: 221.45,
        amount: 221.45,
        fee: 0,
        tax: 0,
        currency: 'EUR',
      });
    });

    test('Can parse document: 2021_degiro.ch.json', () => {
      const result = degiro.parsePages(depotOverview[2]);

      expect(result.status).toEqual(0);
      expect(result.activities.length).toEqual(1);
      expect(result.activities[0]).toEqual({
        broker: 'degiro',
        type: 'TransferIn',
        date: '2021-04-19',
        datetime: '2021-04-19T' + result.activities[0].datetime.substr(11),
        isin: 'IE00B4L5Y983',
        company: 'ISHRC MSCI WLD',
        shares: 136,
        price: 74.28661764705882,
        amount: 10102.98,
        fee: 0,
        tax: 0,
        currency: 'CHF',
      });
    });

    test('Can parse document: 2022_degiro.de.json', () => {
      const result = degiro.parsePages(depotOverview[3]);

      expect(result.status).toEqual(0);
      expect(result.activities.length).toEqual(20);
      expect(result.activities[15]).toEqual({
        broker: 'degiro',
        type: 'TransferOut',
        date: '2022-01-31',
        datetime: '2022-01-31T' + result.activities[0].datetime.substr(11),
        isin: 'DE0007493991',
        company: 'STROEER SE & CO KGAA',
        shares: 15,
        price: 66,
        amount: 990,
        fee: 0,
        tax: 0,
        currency: 'EUR',
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
