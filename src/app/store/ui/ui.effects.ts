import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap, withLatestFrom } from 'rxjs';

import { StorageService } from '../../core/services/storage.service';
import { selectDensityMode } from './ui.selectors';
import { setDensityMode, toggleDensityMode } from './ui.actions';

@Injectable()
export class UiEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly storage = inject(StorageService);

  persistDensityMode$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(toggleDensityMode, setDensityMode),
        withLatestFrom(this.store.select(selectDensityMode)),
        tap(([, mode]) => this.storage.saveDensityMode(mode)),
      ),
    { dispatch: false },
  );
}
