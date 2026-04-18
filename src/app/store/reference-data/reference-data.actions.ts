import { createAction, props } from '@ngrx/store';

import { ElectionMeta, PartyDefinition, PreferenceListDefinition } from '../../core/models';

export const loadReferenceData = createAction('[ReferenceData] Load');

export const loadReferenceDataSuccess = createAction(
  '[ReferenceData] Load Success',
  props<{ election: ElectionMeta; parties: PartyDefinition[]; preferenceLists: PreferenceListDefinition[] }>(),
);

export const loadReferenceDataFailure = createAction(
  '[ReferenceData] Load Failure',
  props<{ error: string }>(),
);
