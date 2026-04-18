import { ActionReducerMap } from '@ngrx/store';

import { CountSession, ElectionMeta, PartyDefinition, PreferenceListDefinition, UiState } from '../core/models';
import { currentSessionReducer, CurrentSessionState } from './current-session/current-session.reducer';
import { referenceDataReducer, ReferenceDataState } from './reference-data/reference-data.reducer';
import { sessionHistoryReducer, SessionHistoryState } from './session-history/session-history.reducer';
import { uiReducer } from './ui/ui.reducer';

export interface AppState {
  referenceData: ReferenceDataState;
  currentSession: CurrentSessionState;
  sessionHistory: SessionHistoryState;
  ui: UiState;
}

export interface ReferenceDataPayload {
  election: ElectionMeta;
  parties: PartyDefinition[];
  preferenceLists: PreferenceListDefinition[];
}

export interface SessionPersistencePayload {
  sessions: CountSession[];
}

export const appReducers: ActionReducerMap<AppState> = {
  referenceData: referenceDataReducer,
  currentSession: currentSessionReducer,
  sessionHistory: sessionHistoryReducer,
  ui: uiReducer,
};
