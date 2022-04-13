import * as ib from '../../src/brokers/interactivebrokers';
import Big from 'big.js';
import fs from 'fs';

const accountStatementPDF = require('./__mocks__/interactivebrokers/account-statement-pdf.json');

const content = fs.readFileSync(`${__dirname}/__mocks__/interactivebrokers/account-statement.csv`, 'utf8');
const accountStatementCSV = [content.trim().split('\n')];

describe('Broker: Interactive Brokers', () => {
  describe('canParseDocument', () => {
    test('[PDF] should accept Buy, Sell, Div', () => {
      expect(ib.canParseDocument(accountStatementPDF, 'pdf')).toEqual(true);
    });

    test('[CSV] should accept Buy, Sell, Div', () => {
      expect(ib.canParseDocument(accountStatementCSV, 'csv')).toEqual(true);
    });
  });

  describe('Buy', () => {
    test('should map pdf data of sample 1 correctly', () => {
      const result = ib.parsePages(accountStatementPDF);

      expect(result.activities.length).toEqual(1);
      expect(result.activities[0]).toEqual({
        broker: 'Interactive Brokers',
        type: 'Buy',
        date: '2019-05-16',
        datetime: '2019-05-16T04:00:00.000Z',
        isin: 'US0378331005',
        company: 'APPLE INC.',
        shares: 4,
        price: 170,
        amount: 680,
        fee: +Big(5.8),
        tax: 0,
        foreignCurrency: 'EUR',
        fxRate: '1'
      });
    });

    test('should map csv data of sample 1 correctly', () => {
      const result = ib.parsePages(accountStatementCSV);

      expect(result.activities.length).toEqual(1);
      expect(result.activities[0]).toEqual({
        broker: 'Interactive Brokers',
        type: 'Buy',
        date: '2019-05-16',
        datetime: '2019-05-16T04:00:00.000Z',
        isin: 'US0378331005',
        company: 'APPLE INC.',
        shares: 4,
        price: 170,
        amount: 680,
        fee: +Big(5.8),
        tax: 0,
        foreignCurrency: 'EUR',
        fxRate: '1',
      });
    });
  });
});
