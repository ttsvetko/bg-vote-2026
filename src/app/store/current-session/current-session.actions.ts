import { createAction, props } from '@ngrx/store';

import { CountSession } from '../../core/models';

export const startBallotSession = createAction('[Session] Start Ballot Count');

export const startPreferenceSession = createAction('[Session] Start Preference Count');

export const initializeSession = createAction(
  '[Session] Initialize',
  props<{ session: CountSession }>(),
);

export const restoreDraftSession = createAction(
  '[Session] Restore Draft',
  props<{ session: CountSession | null }>(),
);

export const incrementCount = createAction('[Session] Increment', props<{ key: string }>());
export const decrementCount = createAction('[Session] Decrement', props<{ key: string }>());
export const undo = createAction('[Session] Undo');
export const redo = createAction('[Session] Redo');
export const saveDraft = createAction('[Session] Save Draft');
export const saveAndExitSession = createAction('[Session] Save And Exit');
export const completeSession = createAction('[Session] Complete');
export const cancelSession = createAction('[Session] Cancel');
export const clearCurrentSession = createAction('[Session] Clear');
