import { createReducer, on } from '@ngrx/store';

import { ElectionMeta, PartyDefinition, PreferenceListDefinition } from '../../core/models';
import { loadReferenceData, loadReferenceDataFailure, loadReferenceDataSuccess } from './reference-data.actions';

export interface ReferenceDataState {
  election: ElectionMeta | null;
  parties: PartyDefinition[];
  preferenceLists: PreferenceListDefinition[];
  loaded: boolean;
  error: string | null;
}

export const initialReferenceDataState: ReferenceDataState = {
  election: null,
  parties: [],
  preferenceLists: [],
  loaded: false,
  error: null,
};

export const referenceDataReducer = createReducer(
  initialReferenceDataState,
  on(loadReferenceData, (state) => ({ ...state, error: null })),
  on(loadReferenceDataSuccess, (state, payload) => ({
    ...state,
    ...payload,
    loaded: true,
    error: null,
  })),
  on(loadReferenceDataFailure, (state, { error }) => ({
    ...state,
    loaded: false,
    error,
  })),
);
