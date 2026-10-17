export const NOTICES_EN = {
  choosePreparation: 'Choose a reviewed internal version',
  preparationHint:
    'Only internally reviewed local drafts can be selected. Template language/source pack must match the register. Legal review stays unreviewed and contact ownership stays unverified. Existing snapshots never change automatically.',
  openPreparation: 'Open template and contact readiness',
  usePreparation: 'Explicitly attach reviewed internal template/contact versions',
  loadPreparation: 'Load current internal readiness records',
  templateChoice: 'Template version',
  contactChoice: 'Contact version',
  pinnedPreparation: 'Pinned internal preparation',
  preparationInvalid:
    'Choose current internally reviewed template and contact versions that match this notice language and source pack.',

  exports: 'Owner sample exports',
  downloadPdf: 'Download sample PDF',
  downloadQr: 'Download local link QR',
  exportHint:
    'These owner-only files are internal samples. The QR opens this saved snapshot on this computer at 127.0.0.1 and requires sign-in and organisation membership. It is not a public consent link. Downloads do not grant access or change the unreviewed status.',
  title: 'Internal notice review',
  intro: 'Submit an immutable snapshot of a saved register version for your team to review.',
  back: 'Back to workspace',
  disclaimer:
    'Local samples only. All notice text and sector rules remain unreviewed. Sample publication is an internal test state, not legal approval or a live privacy notice. No email is sent and no public route is created.',
  localSample: 'Local sample · legally unreviewed',
  submitTitle: 'Submit a saved snapshot',
  entry: 'Register draft and saved version',
  choose: 'Choose a saved register draft',
  previousSelection: 'Previous selection · refresh the chosen version before retrying',
  language: 'Snapshot language',
  en: 'English',
  hi: 'Hindi',
  submitHint:
    'The submitted text is generated from this saved version, not unsaved register edits. Its content and language cannot be edited after submission.',
  submit: 'Submit for internal review',
  submitting: 'Saving…',
  emptyRegister:
    'No register drafts available. Prepare and save an activity in the data register first.',
  register: 'Open data register',
  list: 'Notice snapshots',
  empty: 'No notice snapshots submitted yet.',
  select: 'Open snapshot',
  refresh: 'Refresh saved records',
  selected: 'Selected immutable snapshot',
  selectHint: 'Choose a snapshot to read its saved text and decision history.',
  sourceVersion: 'Source register version',
  reviewVersion: 'Review version',
  pack: 'Source pack',
  noPack: 'No sector pack attached · text remains unreviewed',
  unreviewed: 'Unreviewed',
  submittedAt: 'Submitted',
  in_review: 'In internal review',
  changes_requested: 'Changes requested',
  sample_published: 'Sample published · internal only',
  decisionTitle: 'Owner review action',
  decisionHint:
    'Request changes with a comment, or mark this exact snapshot published as a local sample. The source register must still match before sample publication.',
  comment: 'Review comment',
  commentHint:
    'Required when requesting changes. Describe the correction without personal records.',
  limit: 'Maximum characters',
  changes: 'Request changes',
  publish: 'Publish local sample',
  acknowledge:
    'I understand this is an unreviewed local sample only. This action does not publish a live notice or certify legal compliance.',
  acknowledgementRequired:
    'Acknowledge the sample-only condition before publishing this local sample.',
  commentRequired: 'Enter a comment for the requested changes and respect the character limit.',
  invalid: 'Choose a saved register draft and snapshot language.',
  failed: 'The action could not be completed. Your choices and comment are preserved. Try again.',
  conflict:
    'The saved version changed. Your choices and comment are preserved; saved records are being refreshed. Review the current version before trying again.',
  unavailable:
    'Notice review unavailable. You may not have access, or your session may have ended.',
  loading: 'Loading saved records…',
  loadingSnapshot: 'Loading snapshot…',
  submitted: 'Snapshot submitted for internal review.',
  decisionSaved: 'Internal review action recorded. The sample remains legally unreviewed.',
  history: 'Internal decision history',
  noDecisions: 'No owner review actions recorded yet.',
  request_changes: 'Changes requested',
  publish_sample: 'Published as local sample',
  noComment: 'No comment provided.',
  viewer:
    'Read-only access. Staff or owners can submit saved snapshots; only owners can record review actions.',
  ownerOnly: 'Only an owner can record review actions.',
  closedReview:
    'This review action is complete. Prepare a new register version and submit a new snapshot if changes are needed.',
} as const;
export type NoticesTextKey = keyof typeof NOTICES_EN;
