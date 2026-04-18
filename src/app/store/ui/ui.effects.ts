import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap, withLatestFrom } from 'rxjs';

import { StorageService } from '../../core/services/storage.service';
import { selectDefaultTotalBallots, selectDensityMode } from './ui.selectors';
import { navigateToCountRoute, setDefaultTotalBallots, setDensityMode, toggleDensityMode } from './ui.actions';

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

  persistDefaultTotalBallots$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(setDefaultTotalBallots),
        withLatestFrom(this.store.select(selectDefaultTotalBallots)),
        tap(([, value]) => this.storage.saveDefaultTotalBallots(value)),
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
