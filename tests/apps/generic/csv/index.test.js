import * as genericCSV from '../../../../src/apps/generic/csv';
import fs from 'fs';
import glob from 'glob';
import { csvLinesToJSON } from '@/helper';
import { ParqetActivityValidationError } from '../../../../src/errors';

// TODO copied from portfolio performance tests, move to general utils and import
const readTestFile = (file, parseAsJson) => {
  const content = fs.readFileSync(file, 'utf8');
  return parseAsJson
    ? JSON.parse(csvLinesToJSON(content, parseAsJson))
    : content.trim().split('\n');
};

describe('Generic CSV', function () {
  const allMockFiles = glob.sync(`${__dirname}/__mocks__/**/*.csv`);
  const emptyMockFiles = glob.sync(`${__dirname}/__mocks__/empty/**/*.csv`);
  const mixedMockFiles = glob.sync(`${__dirname}/__mocks__/mixed/**/*.csv`);
  const requiredColumnsHolding = [
    'datetime',
    'price',
    'shares',
    'tax',
    'fee',
    'type',
    'holding',
  ];

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('canParseDocument', () => {
    test.each(allMockFiles)('should return true for file: %s', sample => {
      const result = genericCSV.canParseDocument(
        readTestFile(sample, false),
        'csv'
      );
      expect(result).toEqual(true);
    });

    test('should return false if extension is unequal csv', () => {
      expect(
        genericCSV.canParseDocument([requiredColumnsHolding.join(';')], 'vsc')
      ).toEqual(false);
    });

    test('should return false if any one required column is missing', () => {
      // currently only testing for datetime and holding
      // --> could test all combinations, probably overkill
      for (let i = 0; i < requiredColumnsHolding.length; i++) {
        const missingOneColumn = [...requiredColumnsHolding];
        missingOneColumn.splice(i, 1);

        expect(
          genericCSV.canParseDocument([missingOneColumn.join(';')], 'csv')
        ).toEqual(false);
      }
    });
  });

  describe('parsePages', () => {
    test.each(emptyMockFiles)(
      'should throw ParqetActivityValidationError with status 5 for: %s',
      sample => {
        let err;
        try {
          genericCSV.parsePages(readTestFile(sample, false));
        } catch (e) {
          err = e;
        }

        expect(() =>
          genericCSV.parsePages(readTestFile(sample, false))
        ).toThrowError(ParqetActivityValidationError);
        expect(err.data.status).toEqual(5);
      }
    );

    test.each(mixedMockFiles)(
      'should return expected activities: %s',
      sample => {
        const activityFile = sample.replace(/\.csv$/, '.json');
        const expectedActivities = JSON.parse(
          fs.readFileSync(activityFile, 'utf8')
        );

        const result = genericCSV.parsePages(readTestFile(sample, false));

        expect(result.activities).toMatchObject(expectedActivities);
      }
    );
  });
});
