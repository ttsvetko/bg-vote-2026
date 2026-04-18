import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map, take } from 'rxjs';

import { loadReferenceData } from '../../store/reference-data/reference-data.actions';
import { selectReferenceDataError, selectReferenceDataLoaded } from '../../store/reference-data/reference-data.selectors';

export const dataLoadedGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  const loaded = store.selectSignal(selectReferenceDataLoaded)();

  if (!loaded) {
    store.dispatch(loadReferenceData());

    return combineLatest([store.select(selectReferenceDataLoaded), store.select(selectReferenceDataError)]).pipe(
      filter(([isLoaded, error]) => isLoaded || Boolean(error)),
      map(([isLoaded]) => (isLoaded ? true : router.createUrlTree(['/']))),
      take(1),
    );
  }

  return true;
};
