import { csvLinesToJSON } from '@/helper';
import pdfjs from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import * as brokers from './brokers';
import * as apps from './apps';
import { isBrowser, isNode } from 'browser-or-node';
import {
  ParqetDocumentError,
  ParqetActivityValidationError,
  ParqetParserError,
  ParqetError,
} from '@/errors';

export const acceptedFileTypes = ['pdf', 'csv'];

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/** @type { Importer.Implementation[] } */
export const allImplementations = [
  ...Object.values(brokers),
  ...Object.values(apps),
];

/**
 * @param {Importer.Page[]} pages
 * @param {string} fileName
 * @param {string} extension
 * @returns {Importer.Implementation}
 */
export function findImplementation(pages, fileName, extension) {
  // The broker or app will be selected by the content of the first page
  const implementations = allImplementations.filter(impl =>
    impl.canParseDocument(pages, extension)
  );

  if (implementations === undefined || !implementations.length)
    throw new ParqetDocumentError(
      `Invalid document. Failed to find parser implementation for document.`,
      fileName,
      1
    );

  if (implementations.length > 1)
    throw new ParqetDocumentError(
      `Invalid document. Found multiple parser implementations for document.`,
      fileName,
      2
    );

  return implementations[0];
}

/**
 * @param {Importer.Page[]} pages
 * @param {string} fileName
 * @param {string} extension
 * @returns {Importer.Activity[]}
 */
export function parseActivitiesFromPages(pages, fileName, extension) {
  if (!pages.length)
    throw new ParqetDocumentError(
      `Invalid document. Document is empty.`,
      fileName,
      1
    );

  const impl = findImplementation(pages, fileName, extension);

  /** @type { Importer.ParserResult } */
  let parsePagesResult;

  if (extension === 'pdf') {
    parsePagesResult = impl.parsePages(pages);
  } else if (extension === 'csv') {
    let content = pages[0];

    if (!impl.parsingIsTextBased()) {
      content = JSON.parse(csvLinesToJSON(content));
    }

    parsePagesResult = impl.parsePages(content);
  }

  if (!parsePagesResult.activities.length)
    throw new ParqetActivityValidationError(
      `Empty document. No activities found in parsable document.`,
      {},
      5
    );

  return parsePagesResult.activities;
}

/** @type { (file: File) => Promise<Importer.ParsedFile> } */
export const parseFile = file => {
  return new Promise(resolve => {
    const extension = file.name.split('.').pop().toLowerCase();

    if (!acceptedFileTypes.includes(extension))
      throw new ParqetDocumentError(
        `Invalid document. Unsupported file type '${extension}'. Extension must be one of [${acceptedFileTypes.join(
          ','
        )}].`,
        file.name,
        4
      );

    const reader = new FileReader();

    reader.onload = async e => {
      if (!isBrowser || isNode) {
        resolve({
          pages: [],
          extension,
        });
      }

      let fileContent, pdfDocument;
      /** @type {Importer.Page[]} */
      let pages = [];

      if (extension === 'pdf') {
        if (typeof e.target.result === 'string') {
          throw new ParqetParserError(
            `Invalid file content. Expected 'pdf' file content to be of type 'ArrayBuffer' but received 'string'.`,
            file.name,
            3
          );
        }

        fileContent = new Uint8Array(e.target.result);
        /** @type {pdfjs.PDFDocumentProxy} */
        pdfDocument = await pdfjs.getDocument(fileContent).promise;

        const loopHelper = Array.from(Array(pdfDocument.numPages)).entries();
        for (const [pageIndex] of loopHelper) {
          const parsedContent = await parsePageToContent(
            await pdfDocument.getPage(pageIndex + 1)
          );
          pages.push(parsedContent);
        }
      } else {
        if (typeof e.target.result !== 'string') {
          throw new ParqetParserError(
            `Invalid file content. Expected file content to be of type 'string' for non 'pdf' file types.`,
            file.name,
            3
          );
        }

        pages.push(e.target.result.trim().split('\n'));
      }

      resolve({
        pages,
        extension,
      });
    };

    if (extension === 'pdf') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
};

export default file => {
  return new Promise(resolve => {
    parseFile(file)
      .then(parsedFile => {
        const activities = parseActivitiesFromPages(
          parsedFile.pages,
          file.name,
          parsedFile.extension
        );

        resolve({
          file: file.name,
          activities,
          status: 0,
          successful: !!activities.length,
        });
      })
      .catch(err => {
        console.error(err); // optional to output the error on the console
        let status = 3;
        if (err instanceof ParqetError) status = err.data.status;
        // This should be a 'reject' --> would break Parqet if not dealt with in calling function
        // currently we are not handing over the arrow
        resolve({
          file: file.name,
          activities: [],
          status,
          successful: false,
        });
      });
  });
};

/**
 * @param {pdfjs.PDFPageProxy} page
 * @returns {Promise<string[]>}
 */
async function parsePageToContent(page) {
  const parsedContent = [];
  const content = await page.getTextContent();

  for (const currentContent of content.items) {
    parsedContent.push(currentContent.str.trim());
  }

  return parsedContent.filter(item => item.length > 0);
}
