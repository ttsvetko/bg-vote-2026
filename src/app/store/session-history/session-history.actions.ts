import { createAction, props } from '@ngrx/store';

import { CountSession } from '../../core/models';

export const loadSessionsFromStorage = createAction('[History] Load From Storage');

export const loadSessionsFromStorageSuccess = createAction(
  '[History] Load From Storage Success',
  props<{ sessions: CountSession[] }>(),
);

export const addSession = createAction('[History] Add', props<{ session: CountSession }>());
export const updateSession = createAction('[History] Update', props<{ session: CountSession }>());
export const deleteSession = createAction('[History] Delete', props<{ id: string }>());
