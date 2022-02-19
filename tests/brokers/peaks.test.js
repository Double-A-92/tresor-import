import * as peaks from '../../src/brokers/peaks';
import { validateAllSamples } from '../setup/brokers';
import {
  overviewSamples,
  buySamples,
  dividendSamples,
  feesSamples,
  unknownSamples,
  numberFormatSamples,
  allSamples,
} from './__mocks__/peaks';

describe('Broker: peaks', () => {
  let consoleErrorSpy;

  validateAllSamples(peaks, allSamples, 'peaks');

  describe('Validate buys', () => {
    test('Can all orders be parsed from overview', () => {
      const activities = peaks.parsePages(overviewSamples[0]).activities;

      expect(activities.length).toEqual(114);
      expect(activities[0]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T10:10:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.0094678,
        price: 158.43,
        amount: 1.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[1]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T10:02:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.87719298,
        price: 5.7,
        amount: 5.0,
        fee: 0,
        tax: 0,
      });
      expect(activities[2]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T10:16:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.20238318,
        price: 121.06,
        amount: 24.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[3]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T09:47:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.02602672,
        price: 134.48,
        amount: 3.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[4]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T10:27:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.09015188,
        price: 61.01,
        amount: 5.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[5]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T09:55:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.21454623,
        price: 46.61,
        amount: 10.0,
        fee: 0,
        tax: 0,
      });
      expect(activities[6]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T10:49:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.0073617,
        price: 47.0,
        amount: 0.35,
        fee: 0,
        tax: 0,
      });
      expect(activities[7]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:42:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.00699883,
        price: 121.12,
        amount: 0.85,
        fee: 0,
        tax: 0,
      });
      expect(activities[8]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T10:07:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.00090124,
        price: 134.37,
        amount: 0.12,
        fee: 0,
        tax: 0,
      });
      expect(activities[9]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:05:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.03072824,
        price: 5.63,
        amount: 0.17,
        fee: 0,
        tax: 0,
      });
      expect(activities[10]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:43:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.00306441,
        price: 62.1,
        amount: 0.19,
        fee: 0,
        tax: 0,
      });
      expect(activities[11]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:29:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.00032825,
        price: 158.11,
        amount: 0.05,
        fee: 0,
        tax: 0,
      });
      expect(activities[12]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-22',
        datetime: '2020-09-22T10:15:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.06770925,
        price: 5.63,
        amount: 0.38,
        fee: 0,
        tax: 0,
      });
      expect(activities[13]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-22',
        datetime: '2020-09-22T10:11:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.01645077,
        price: 46.32,
        amount: 0.76,
        fee: 0,
        tax: 0,
      });
      expect(activities[14]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-22',
        datetime: '2020-09-22T10:21:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.00072273,
        price: 158.15,
        amount: 0.11,
        fee: 0,
        tax: 0,
      });
      expect(activities[15]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-22',
        datetime: '2020-09-22T10:39:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.00691749,
        price: 60.59,
        amount: 0.42,
        fee: 0,
        tax: 0,
      });
      expect(activities[16]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-22',
        datetime: '2020-09-22T10:04:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.00199029,
        price: 134.0,
        amount: 0.27,
        fee: 0,
        tax: 0,
      });
      expect(activities[17]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-22',
        datetime: '2020-09-22T10:30:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.01565631,
        price: 119.24,
        amount: 1.87,
        fee: 0,
        tax: 0,
      });
      expect(activities[18]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-15',
        datetime: '2020-09-15T10:50:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.01147677,
        price: 47.75,
        amount: 0.55,
        fee: 0,
        tax: 0,
      });
      expect(activities[19]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-15',
        datetime: '2020-09-15T11:01:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.01098758,
        price: 122.19,
        amount: 1.34,
        fee: 0,
        tax: 0,
      });
      expect(activities[20]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-15',
        datetime: '2020-09-15T10:41:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.00143842,
        price: 133.34,
        amount: 0.19,
        fee: 0,
        tax: 0,
      });
      expect(activities[21]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-15',
        datetime: '2020-09-15T10:57:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.0005192,
        price: 158.32,
        amount: 0.08,
        fee: 0,
        tax: 0,
      });
      expect(activities[22]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-15',
        datetime: '2020-09-15T11:04:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.00494108,
        price: 61.0,
        amount: 0.3,
        fee: 0,
        tax: 0,
      });

      expect(activities[23]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-15',
        datetime: '2020-09-15T10:54:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.04730325,
        price: 5.79,
        amount: 0.27,
        fee: 0,
        tax: 0,
      });
      expect(activities[24]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-09',
        datetime: '2020-09-09T10:50:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.0114977,
        price: 47.31,
        amount: 0.54,
        fee: 0,
        tax: 0,
      });
      expect(activities[25]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-09',
        datetime: '2020-09-09T10:55:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.04775785,
        price: 5.7,
        amount: 0.27,
        fee: 0,
        tax: 0,
      });
      expect(activities[26]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-09',
        datetime: '2020-09-09T11:00:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.00051581,
        price: 158.2,
        amount: 0.08,
        fee: 0,
        tax: 0,
      });
      expect(activities[27]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-09',
        datetime: '2020-09-09T11:06:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.00496885,
        price: 60.22,
        amount: 0.3,
        fee: 0,
        tax: 0,
      });
      expect(activities[28]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-09',
        datetime: '2020-09-09T10:44:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.00143041,
        price: 133.11,
        amount: 0.19,
        fee: 0,
        tax: 0,
      });
      expect(activities[29]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-09',
        datetime: '2020-09-09T11:03:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.01116611,
        price: 119.36,
        amount: 1.33,
        fee: 0,
        tax: 0,
      });

      //Page with sells in this gap. 6 in total.

      expect(activities[36]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T11:01:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.00947364,
        price: 158.33,
        amount: 1.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[37]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T10:48:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.2096543,
        price: 47.7,
        amount: 10.0,
        fee: 0,
        tax: 0,
      });
      expect(activities[38]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T10:54:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.84814568,
        price: 5.9,
        amount: 5.0,
        fee: 0,
        tax: 0,
      });
      expect(activities[39]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T10:40:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.02630589,
        price: 133.05,
        amount: 3.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[40]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T11:13:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.08960018,
        price: 61.38,
        amount: 5.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[41]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T11:08:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.19469165,
        price: 125.84,
        amount: 24.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[42]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T11:13:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.00797441,
        price: 61.38,
        amount: 0.49,
        fee: 0,
        tax: 0,
      });
      expect(activities[43]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T11:01:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.00084315,
        price: 158.33,
        amount: 0.13,
        fee: 0,
        tax: 0,
      });
      expect(activities[44]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T11:08:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.01732755,
        price: 125.84,
        amount: 2.18,
        fee: 0,
        tax: 0,
      });
      expect(activities[45]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T10:54:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.07548497,
        price: 5.9,
        amount: 0.44,
        fee: 0,
        tax: 0,
      });
      expect(activities[46]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T10:48:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.01865923,
        price: 47.7,
        amount: 0.89,
        fee: 0,
        tax: 0,
      });
      expect(activities[47]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-02',
        datetime: '2020-09-02T10:40:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.00234122,
        price: 133.05,
        amount: 0.31,
        fee: 0,
        tax: 0,
      });
      expect(activities[48]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-08-25',
        datetime: '2020-08-25T10:47:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.12322922,
        price: 5.86,
        amount: 0.72,
        fee: 0,
        tax: 0,
      });
      expect(activities[113]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-07-08',
        datetime: '2020-07-08T10:00:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.010564,
        price: 132.53,
        amount: 1.4,
        fee: 0,
        tax: 0,
      });
    });

    test('Can a monthly purchase be parsed from buy_monthly', () => {
      const activities = peaks.parsePages(buySamples[0]).activities;

      expect(activities.length).toEqual(12);

      expect(activities[0]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T10:10:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.0094678,
        price: 158.43,
        amount: 1.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[1]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T10:02:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.87719298,
        price: 5.7,
        amount: 5.0,
        fee: 0,
        tax: 0,
      });
      expect(activities[2]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T10:16:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.20238318,
        price: 121.06,
        amount: 24.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[3]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T09:47:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.02602672,
        price: 134.48,
        amount: 3.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[4]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T10:27:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.09015188,
        price: 61.01,
        amount: 5.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[5]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-10-02',
        datetime: '2020-10-02T09:55:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.21454623,
        price: 46.61,
        amount: 10.0,
        fee: 0,
        tax: 0,
      });
      expect(activities[6]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T10:49:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.0073617,
        price: 47.0,
        amount: 0.35,
        fee: 0,
        tax: 0,
      });
      expect(activities[7]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:42:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.00699883,
        price: 121.12,
        amount: 0.85,
        fee: 0,
        tax: 0,
      });
      expect(activities[8]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T10:07:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.00090124,
        price: 134.37,
        amount: 0.12,
        fee: 0,
        tax: 0,
      });
      expect(activities[9]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:05:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.03072824,
        price: 5.63,
        amount: 0.17,
        fee: 0,
        tax: 0,
      });
      expect(activities[10]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:43:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.00306441,
        price: 62.1,
        amount: 0.19,
        fee: 0,
        tax: 0,
      });
      expect(activities[11]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:29:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.00032825,
        price: 158.11,
        amount: 0.05,
        fee: 0,
        tax: 0,
      });
    });

    test('Can parse odd money buy from buy_odd_money', () => {
      const result = peaks.parsePages(buySamples[1]);

      expect(result.activities.length).toEqual(12);
      expect(result.activities[6]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T10:49:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.0073617,
        price: 47.0,
        amount: 0.35,
        fee: 0,
        tax: 0,
      });
      expect(result.activities[7]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:42:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.00699883,
        price: 121.12,
        amount: 0.85,
        fee: 0,
        tax: 0,
      });
      expect(result.activities[8]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T10:07:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.00090124,
        price: 134.37,
        amount: 0.12,
        fee: 0,
        tax: 0,
      });
      expect(result.activities[9]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:05:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.03072824,
        price: 5.63,
        amount: 0.17,
        fee: 0,
        tax: 0,
      });
      expect(result.activities[10]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:43:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.00306441,
        price: 62.1,
        amount: 0.19,
        fee: 0,
        tax: 0,
      });
      expect(result.activities[11]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-09-29',
        datetime: '2020-09-29T11:29:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.00032825,
        price: 158.11,
        amount: 0.05,
        fee: 0,
        tax: 0,
      });
    });

    test('Can parse dividend buy from buy_dividends', () => {
      const result = peaks.parsePages(buySamples[2]);

      expect(result.activities.length).toEqual(6);
      expect(result.activities[0]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-08-10',
        datetime: '2020-08-10T10:07:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.00182368,
        price: 59.78,
        amount: 0.11,
        fee: 0,
        tax: 0,
      });
      expect(result.activities[2]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-08-10',
        datetime: '2020-08-10T10:04:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.00231294,
        price: 118.42,
        amount: 0.27,
        fee: 0,
        tax: 0,
      });
      expect(result.activities[4]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2021-05-12',
        datetime: '2021-05-12T10:19:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.00194695,
        price: 157.27,
        amount: 0.31,
        fee: 0,
        tax: 0,
      });
    });
  });

  describe('Validate dividends', () => {
    test('Can dividend be parsed from dividend', () => {
      const activities = peaks.parsePages(dividendSamples[0]).activities;

      expect(activities.length).toEqual(6);
      // the buy would be index 0 / 2, but we are looking for the dividend activity,
      // which is index + 1, because it is a copy of the buy activity
      expect(activities[3]).toEqual({
        broker: 'peaks',
        type: 'Dividend',
        date: '2020-08-10',
        datetime: '2020-08-10T10:04:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.00231294,
        price: 118.42,
        amount: 0.27,
        fee: 0,
        tax: 0,
      });
      expect(activities[1]).toEqual({
        broker: 'peaks',
        type: 'Dividend',
        date: '2020-08-10',
        datetime: '2020-08-10T10:07:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.00182368,
        price: 59.78,
        amount: 0.11,
        fee: 0,
        tax: 0,
      });
      expect(activities[5]).toEqual({
        broker: 'peaks',
        type: 'Dividend',
        date: '2021-05-12',
        datetime: '2021-05-12T10:19:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.00194695,
        price: 157.27,
        amount: 0.31,
        fee: 0,
        tax: 0,
      });
    });
  });

  describe('Validate fees', () => {
    test('Can sell be parsed from fees sell', () => {
      const activities = peaks.parsePages(feesSamples[0]).activities;

      expect(activities.length).toEqual(36);
      expect(activities[6]).toEqual({
        broker: 'peaks',
        type: 'Sell',
        date: '2020-09-01',
        datetime: '2020-09-01T10:36:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.00402491,
        price: 123.2,
        amount: 0.5,
        fee: 0.5,
        tax: 0,
      });
      expect(activities[7]).toEqual({
        broker: 'peaks',
        type: 'Sell',
        date: '2020-09-01',
        datetime: '2020-09-01T10:49:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.00180024,
        price: 60.15,
        amount: 0.11,
        fee: 0.11,
        tax: 0,
      });
      expect(activities[8]).toEqual({
        broker: 'peaks',
        type: 'Sell',
        date: '2020-09-01',
        datetime: '2020-09-01T10:10:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.00052816,
        price: 132.23,
        amount: 0.07,
        fee: 0.07,
        tax: 0,
      });
      expect(activities[9]).toEqual({
        broker: 'peaks',
        type: 'Sell',
        date: '2020-09-01',
        datetime: '2020-09-01T10:19:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.01692626,
        price: 5.8,
        amount: 0.1,
        fee: 0.1,
        tax: 0,
      });
      expect(activities[10]).toEqual({
        broker: 'peaks',
        type: 'Sell',
        date: '2020-09-01',
        datetime: '2020-09-01T10:21:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.00421649,
        price: 46.94,
        amount: 0.2,
        fee: 0.2,
        tax: 0,
      });
      expect(activities[11]).toEqual({
        broker: 'peaks',
        type: 'Sell',
        date: '2020-09-01',
        datetime: '2020-09-01T10:38:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.00018957,
        price: 157.75,
        amount: 0.03,
        fee: 0.03,
        tax: 0,
      });
      expect(activities[18]).toEqual({
        broker: 'peaks',
        type: 'Sell',
        date: '2021-06-01',
        datetime: '2021-06-01T10:21:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.00355332,
        price: 57.72,
        amount: 0.21,
        fee: 0.21,
        tax: 0,
      });
      expect(activities[24]).toEqual({
        broker: 'peaks',
        type: 'Sell',
        date: '2021-06-01',
        datetime: '2021-06-01T10:57:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 0.00566229,
        price: 7.45,
        amount: 0.04,
        fee: 0.04,
        tax: 0,
      });
    });
  });
  //
  describe('Validate unknown', () => {
    test('Can "unknown" entries be parsed as buy and sell', () => {
      // unknown entries are a switch of portfolios
      const activities = peaks.parsePages(unknownSamples[0]).activities;

      expect(activities.length).toEqual(12);
      expect(activities[6]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-08-26',
        datetime: '2020-08-26T09:39:00.000Z',
        isin: 'IE00B52VJ196',
        company: 'iShares MSCI Europe SRI UCITS ETF EUR (Acc)',
        shares: 0.48347549,
        price: 47.5,
        amount: 22.97,
        fee: 0,
        tax: 0,
      });
      expect(activities[7]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-08-26',
        datetime: '2020-08-26T09:34:00.000Z',
        isin: 'LU0629460089',
        company: 'UBS ETF-MSCI USA Socially Responsible',
        shares: 0.44857923,
        price: 122.26,
        amount: 54.84,
        fee: 0,
        tax: 0,
      });
      expect(activities[8]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-08-26',
        datetime: '2020-08-26T09:36:00.000Z',
        isin: 'LU0629460832',
        company: 'UBS ETF-MSCI Pac Socially Responsible',
        shares: 0.21945726,
        price: 61.22,
        amount: 13.44,
        fee: 0,
        tax: 0,
      });
      expect(activities[9]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-08-26',
        datetime: '2020-08-26T09:27:00.000Z',
        isin: 'IE00BYVJRP78',
        company: 'iShares Sustainable MSCI Em Mkt',
        shares: 1.57696059,
        price: 5.91,
        amount: 9.32,
        fee: 0,
        tax: 0,
      });
      expect(activities[10]).toEqual({
        broker: 'peaks',
        type: 'Sell',
        date: '2020-08-26',
        datetime: '2020-08-26T09:23:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.52972954,
        price: 132.51,
        amount: 70.2,
        fee: 0,
        tax: 0,
      });
      expect(activities[11]).toEqual({
        broker: 'peaks',
        type: 'Sell',
        date: '2020-08-26',
        datetime: '2020-08-26T09:31:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.19276853,
        price: 157.51,
        amount: 30.36,
        fee: 0,
        tax: 0,
      });
    });
  });

  describe('Validate number format', () => {
    test('Can English formatted numbers be parsed correctly', () => {
      const activities = peaks.parsePages(numberFormatSamples[0]).activities;

      expect(activities.length).toEqual(12);
      expect(activities[0]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-07-02',
        datetime: '2020-07-02T10:10:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.0796132,
        price: 131.89,
        amount: 10.5,
        fee: 0,
        tax: 0,
      });
      expect(activities[11]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-07-01',
        datetime: '2020-07-01T11:06:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.01191687,
        price: 155.58,
        amount: 1.85,
        fee: 0,
        tax: 0,
      });
    });
    test('Can German formatted numbers be parsed correctly', () => {
      const activities = peaks.parsePages(numberFormatSamples[1]).activities;

      expect(activities.length).toEqual(12);
      expect(activities[0]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-08-04',
        datetime: '2020-08-04T10:30:00.000Z',
        isin: 'LU0484968812',
        company: 'Xtrackers II ESG EUR Corp Bond UCITS ETF',
        shares: 0.00560401,
        price: 157.92,
        amount: 0.88,
        fee: 0,
        tax: 0,
      });
      expect(activities[11]).toEqual({
        broker: 'peaks',
        type: 'Buy',
        date: '2020-08-04',
        datetime: '2020-08-04T10:12:00.000Z',
        isin: 'IE00B4WXJJ64',
        company: 'iShares Core Govt Bond UCITS ETF EUR (Dist)',
        shares: 0.0785399,
        price: 133.69,
        amount: 10.5,
        fee: 0,
        tax: 0,
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
