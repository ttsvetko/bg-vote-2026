import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { DataLoaderService } from '../../core/services/data-loader.service';
import { loadReferenceData, loadReferenceDataFailure, loadReferenceDataSuccess } from './reference-data.actions';

@Injectable()
export class ReferenceDataEffects {
  private readonly actions$ = inject(Actions);
  private readonly dataLoader = inject(DataLoaderService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadReferenceData),
      switchMap(() =>
        this.dataLoader.loadAll().pipe(
          map((payload) => loadReferenceDataSuccess(payload)),
          catchError((error: unknown) =>
            of(
              loadReferenceDataFailure({
                error: error instanceof Error ? error.message : 'Неуспешно зареждане на reference данните.',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
