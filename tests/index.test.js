import {
  allImplementations,
  findImplementation,
  parseActivitiesFromPages,
  parseFile,
} from '../src';
import * as onvista from '../src/brokers/onvista';
import { ParqetDocumentError } from '../src/errors';

describe('PDF handler', () => {
  describe('parseFile', () => {
    test('should throw ParqetDocumentError with status 4 if file type is not supported', async () => {
      const file = new File([new ArrayBuffer(1)], 'testfile.jpg');
      let err;

      try {
        await parseFile(file);
      } catch (e) {
        err = e;
      }

      expect(err instanceof ParqetDocumentError).toBe(true);
      expect(err.data).toBeDefined();
      expect(err.data.status).toBe(4);
    });
  });

  describe('allImplementations', () => {
    test('All implementations must export (only) the functions canParseDocument and parsePages', () => {
      allImplementations.forEach(implementation => {
        if (implementation !== onvista) {
          // The smartbroker implementation is extending onvista. So it's valid, that onvista exports more than two functions. No check required.
          expect(Object.keys(implementation).length).toEqual(3);
        }

        expect(typeof implementation.canParseDocument).toEqual('function');
        expect(typeof implementation.parsePages).toEqual('function');
        expect(typeof implementation.parsingIsTextBased).toEqual('function');
      });
    });
  });

  describe('findImplementation', () => {
    test('should return the matching parser implementation', () => {
      const implementation = findImplementation(
        [['BIC BYLADEM1001', 'Dividendengutschrift']],
        'dividendengutschrift.pdf',
        'pdf'
      );

      expect(implementation).toBeDefined();
    });

    test('should throw ParqetDocumentError with status 1 if no implementation could be found for document', () => {
      const pages = [['42']];
      const fileName = 'no_implementation.pdf';
      const extension = 'pdf';

      let err;

      try {
        findImplementation(pages, fileName, extension);
      } catch (e) {
        err = e;
      }

      expect(err instanceof ParqetDocumentError).toBe(true);
      expect(err.data).toBeDefined();
      expect(err.data.status).toBe(1);
    });

    test('should throw ParqetDocumentError with status 2 if multiple implementations were found for document', () => {
      const pages = [
        ['BIC BYLADEM1001', 'Dividendengutschrift', 'comdirect bank'],
      ];
      const fileName = 'multiple_implementations.pdf';
      const extension = 'pdf';

      let err;

      try {
        findImplementation(pages, fileName, extension);
      } catch (e) {
        err = e;
      }

      expect(err instanceof ParqetDocumentError).toBe(true);
      expect(err.data).toBeDefined();
      expect(err.data.status).toBe(2);
    });
  });

  describe('parseActivitiesFromPages', () => {
    test('should throw ParqetDocumentError with status 1 if document is empty', () => {
      const pages = [];
      const fileName = 'empty_document.pdf';
      const extension = 'pdf';

      let err;

      try {
        parseActivitiesFromPages(pages, fileName, extension);
      } catch (e) {
        err = e;
      }

      expect(err instanceof ParqetDocumentError).toBe(true);
      expect(err.data).toBeDefined();
      expect(err.data.status).toBe(1);
    });
  });
});
