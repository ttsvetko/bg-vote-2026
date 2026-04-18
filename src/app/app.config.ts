import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
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
    provideStore(appReducers),
    provideEffects(ReferenceDataEffects, CurrentSessionEffects, SessionHistoryEffects),
  ],
};
