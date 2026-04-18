import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';

import { routes } from './app.routes';
import { CurrentSessionEffects } from './store/current-session/current-session.effects';
import { ReferenceDataEffects } from './store/reference-data/reference-data.effects';
import { SessionHistoryEffects } from './store/session-history/session-history.effects';
import { appReducers } from './store/app.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideStore(appReducers),
    provideEffects(ReferenceDataEffects, CurrentSessionEffects, SessionHistoryEffects),
  ],
};
