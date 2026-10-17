export const NOTICE_COMMENT_LIMIT = 1000;
export const NOTICE_IDEMPOTENCY_PREFIX = 'sahmati.notice-action';
export const NOTICE_LANGUAGES = ['en', 'hi'] as const;

export const NOTICE_EXPORT_PATHS = { pdf: 'export.pdf', qr: 'qr.png' } as const;
export const NOTICE_EXPORT_FILENAMES = {
  pdf: 'sahmati-local-sample.pdf',
  qr: 'sahmati-local-sample-qr.png',
} as const;
