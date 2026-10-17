export const UI_BUTTON_CLASSES = {
  primary: 'ux4g-btn-primary',
  secondary: 'ux4g-btn-outline-neutral',
  quiet: 'ux4g-btn-text-primary',
  danger: 'ux4g-btn-danger',
} as const;
export type UiButtonVariant = keyof typeof UI_BUTTON_CLASSES;
export const UI_TAG_CLASSES = {
  neutral: 'ux4g-tag-tonal-neutral',
  success: 'ux4g-tag-tonal-success',
  warning: 'ux4g-tag-tonal-warning',
} as const;
export type UiTagVariant = keyof typeof UI_TAG_CLASSES;
