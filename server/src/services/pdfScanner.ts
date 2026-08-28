/**
 * Magic-Byte & Structural AST PDF Malware & Polyglot Scanner
 * 1. Checks first 5 bytes for canonical %PDF- (0x25 0x50 0x44 0x46 0x2D).
 * 2. Scans for active exploit objects (/Launch, /JS, /JavaScript, /OpenAction, /EmbeddedFiles).
 */

export interface ScanResult {
  valid: boolean;
  fileSize: number;
  magicHeader?: string;
  threatsDetected: string[];
  error?: string;
}

const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-

// Dangerous active executable PDF dictionaries & actions
const MALICIOUS_AST_TOKENS = [
  { token: '/Launch', threat: 'Arbitrary host executable launch (/Launch)' },
  { token: '/JS', threat: 'Embedded JavaScript object (/JS)' },
  { token: '/JavaScript', threat: 'Embedded JavaScript dictionary (/JavaScript)' },
  { token: '/OpenAction', threat: 'Auto-executing document open trigger (/OpenAction)' },
  { token: '/AA', threat: 'Additional Actions macro (/AA)' },
  { token: '/EmbeddedFiles', threat: 'Hidden embedded executable stream (/EmbeddedFiles)' },
  { token: '<script', threat: 'Polyglot HTML/SVG script tag injection' },
];

export class PdfSecurityScanner {
  /**
   * Scans a binary buffer for magic-byte validity and malicious AST structures
   */
  public scanBuffer(buffer: Buffer): ScanResult {
    if (!buffer || buffer.length < 5) {
      return {
        valid: false,
        fileSize: buffer ? buffer.length : 0,
        threatsDetected: ['Corrupt or empty file buffer (< 5 bytes)'],
        error: 'File buffer is too small to contain a valid PDF header.',
      };
    }

    // ── 1. Magic-Byte Header Verification ──
    const headerSlice = buffer.subarray(0, 5);
    const hasValidMagicHeader = headerSlice.equals(PDF_MAGIC_BYTES);

    if (!hasValidMagicHeader) {
      const detectedHeader = headerSlice.toString('ascii').replace(/[^\x20-\x7E]/g, '.');
      return {
        valid: false,
        fileSize: buffer.length,
        magicHeader: detectedHeader,
        threatsDetected: [`Invalid Magic Bytes: Expected '%PDF-', found '${detectedHeader}'`],
        error: 'Security Violation: Uploaded file does not contain a valid PDF signature.',
      };
    }

    const headerString = buffer.subarray(0, 1024).toString('ascii');
    const threats: string[] = [];

    // ── 2. Structural AST Token & Polyglot Scan ──
    const rawContent = buffer.toString('binary');

    for (const rule of MALICIOUS_AST_TOKENS) {
      if (rawContent.includes(rule.token)) {
        threats.push(rule.threat);
      }
    }

    const isValid = threats.length === 0;

    return {
      valid: isValid,
      fileSize: buffer.length,
      magicHeader: headerString.split('\n')[0] || '%PDF-',
      threatsDetected: threats,
      error: isValid ? undefined : `Security Alert: ${threats.join('; ')}`,
    };
  }

  /**
   * Validates a base64 or hex encoded slice of upload bytes
   */
  public scanBase64Slice(base64Data: string): ScanResult {
    const buffer = Buffer.from(base64Data, 'base64');
    return this.scanBuffer(buffer);
  }
}

export const pdfScanner = new PdfSecurityScanner();
