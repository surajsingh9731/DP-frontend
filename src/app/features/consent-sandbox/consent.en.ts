export const CONSENT_EN = {
  title: 'Synthetic consent lab',
  intro:
    'Local test only. No real identity, age, guardian authority or contact ownership is verified. Do not enter real personal data.',
  back: 'Workspace',
  refresh: 'Refresh catalogs and history',
  loading: 'Loading…',
  failed:
    'Could not save or load. Your choices remain here. Retry or sign in again if your workspace session expired.',
  conflict:
    'The notice, catalog or receipt version changed. Refresh, then start a new sample participant if needed.',
  expired:
    'This synthetic session is unavailable or expired. Start another sample participant; earlier receipts remain in history.',
  configure: 'Owner: create a purpose catalog',
  notice: 'Sample-published notice',
  choose: 'Choose a notice',
  purposeEn: 'Purpose in English',
  purposeHi: 'Purpose in Hindi',
  add: 'Add purpose',
  remove: 'Remove purpose',
  catalogAck:
    'I acknowledge these are owner-declared synthetic options; their legal coverage is unreviewed.',
  create: 'Save immutable sample catalog',
  catalogs: 'Saved sample catalogs',
  empty: 'No sample catalogs yet. An owner must prepare and sample-publish a current notice first.',
  version: 'Version',
  registerVersion: 'Saved register version',
  catalogVersion: 'Purpose catalog version',
  interfaceLanguage: 'Interface language at recording',
  adultAck:
    'I am simulating a generated adult participant. This is not real consent or proof of adulthood.',
  start: 'Start sample participant',
  participant: 'Synthetic participant',
  expires: 'Session expires',
  noticeLanguage: 'Saved notice language',
  languageNote:
    'Changing interface language does not translate the saved notice. This exact notice is bound to the receipt.',
  optionsNote: 'Choose allow or decline for each optional purpose. Nothing is selected by default.',
  allow: 'Allow',
  decline: 'Decline',
  choiceAck: 'Record these choices only as synthetic test data.',
  save: 'Record selected choices',
  declineAll: 'Decline all and record sample receipt',
  invalid: 'Complete every required choice and acknowledgement.',
  saved: 'Sample receipt recorded.',
  end: 'End sample session',
  receipt: 'Immutable sample receipt',
  history: 'Branch sample history (latest 50 events)',
  noHistory: 'No sample receipts yet.',
  recorded: 'Choices recorded',
  withdrawn: 'Choices withdrawn',
  withdraw: 'Withdraw this allowed purpose',
  withdrawAll: 'Withdraw all allowed purposes',
  deletion:
    'This sample does not delete vendor, paper, backup or other data. Downstream deletion tasks remain pending.',
  hash: 'Receipt hash',
  previous: 'Previous receipt hash',
  assurance: 'Unverified synthetic adult · legal review unreviewed · contact unverified',
  busy: 'Saving…',
  readOnly:
    'Read-only role: sample catalogs and receipts are visible; participant actions are unavailable.',
  catalogNote:
    'Catalogs and notices are immutable. Only the latest catalog for a notice and current source versions can begin or submit a new sample.',
} as const;
export type ConsentTextKey = keyof typeof CONSENT_EN;
