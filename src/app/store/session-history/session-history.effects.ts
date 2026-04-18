import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, tap, withLatestFrom } from 'rxjs';

import { StorageService } from '../../core/services/storage.service';
import {
  addSession,
  deleteSession,
  loadSessionsFromStorage,
  loadSessionsFromStorageSuccess,
  updateSession,
} from './session-history.actions';
import { selectSessions } from './session-history.selectors';

@Injectable()
export class SessionHistoryEffects {
  private readonly actions$ = inject(Actions);
  private readonly storage = inject(StorageService);
  private readonly store = inject(Store);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSessionsFromStorage),
      map(() => loadSessionsFromStorageSuccess({ sessions: this.storage.loadSessions() })),
    ),
  );

  persist$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addSession, updateSession, deleteSession),
        withLatestFrom(this.store.select(selectSessions)),
        tap(([, sessions]) => this.storage.saveSessions(sessions)),
      ),
    { dispatch: false },
  );
}
