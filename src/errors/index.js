/**
 * Custom error base class
 */
export class ParqetError extends Error {
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.data = { status };
  }
}

/**
 * Covers status codes 1, 2, 4 and 7 (errors when deciding if document can be parsed)
 *  - Implementation errors (e.g. multiple implementations for parser found)
 *  - Unknown documents (e.g. cost/split document)
 *  - Unknown extensions (e.g. .xlsx)
 *  - Ignored documents (e.g. depot summary csv -> known, but decided not to support)
 */
export class ParqetDocumentError extends ParqetError {
  /**
   * @param {string} message - error message
   * @param {string} fileName - file name incl. extension causing the document error
   * @param {(1|2|4|7)} status - Parqet error code
   */
  constructor(message, fileName, status) {
    super(`${message}\nFile: ${fileName}`, status);
  }
}

/**
 * Covers status code 3 (errors during parsing values)
 *  - Actual value differs from expected value (e.g. expected ISO Datetime, got Unix Timestamp)
 *  - Any unforeseen errors during parsing (e.g. invalid JSON, etc.)
 */
export class ParqetParserError extends ParqetError {
  /**
   * @param {string} message - error message
   * @param {string} input - value causing the parsing error
   * @param {3} [status=3] - Parqet error code
   */
  constructor(message, input, status = 3) {
    super(`${message}\nInput: ${input}`, status);
  }
}

/**
 * Covers status code 5 and 6 (after successful parsing)
 *  - Document without activities
 *  - Missing values, undefined values, etc.
 */
export class ParqetActivityValidationError extends ParqetError {
  /**
   * @param {string} message - error message
   * @param {Importer.Activity | Partial<Importer.Activity>} activity - activity causing the validation error
   * @param {(5|6)} status - Parqet error code
   */
  constructor(message, activity, status) {
    super(
      `${message}\nActivity: ${JSON.stringify(
        activity,
        (k, v) => (v === undefined ? 'undefined <<<<<<<<<<<<<<<<<<<<<<<<<' : v),
        2
      )}`,
      status
    );
  }
}
