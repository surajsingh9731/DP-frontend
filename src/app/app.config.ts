import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding lets ComingSoonComponent's `flow` input be
    // set straight from each route's `data`, instead of each route needing
    // its own wrapper component.
    provideRouter(routes, withComponentInputBinding()),
  ],
};
