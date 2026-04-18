import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap, withLatestFrom } from 'rxjs';

import { StorageService } from '../../core/services/storage.service';
import { selectDensityMode } from './ui.selectors';
import { navigateToCountRoute, setDensityMode, toggleDensityMode } from './ui.actions';

@Injectable()
export class UiEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  persistDensityMode$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(toggleDensityMode, setDensityMode),
        withLatestFrom(this.store.select(selectDensityMode)),
        tap(([, mode]) => this.storage.saveDensityMode(mode)),
      ),
    { dispatch: false },
  );

  navigateToCountRoute$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(navigateToCountRoute),
        tap(({ mode }) => {
          void this.router.navigateByUrl(mode === 'ballots' ? '/ballot-count' : '/preference-count');
        }),
      ),
    { dispatch: false },
  );
}
