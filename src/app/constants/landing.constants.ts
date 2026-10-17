export const LANDING_STEPS = ['map', 'notice', 'choice', 'review'] as const;
export const LANDING_SECTORS = [
  'education',
  'health',
  'employer',
  'property',
  'retail',
  'hospitality',
  'events',
  'housing',
] as const;
export const LANDING_MOTION_KEY = 'sahmati-landing-reduced-motion';
export type LandingStep = (typeof LANDING_STEPS)[number];
export type LandingSector = (typeof LANDING_SECTORS)[number];
