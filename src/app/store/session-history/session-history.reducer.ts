import { createReducer, on } from '@ngrx/store';

import { CountSession } from '../../core/models';
import { addSession, deleteSession, loadSessionsFromStorageSuccess, updateSession } from './session-history.actions';

export interface SessionHistoryState {
  sessions: CountSession[];
}

export const initialSessionHistoryState: SessionHistoryState = {
  sessions: [],
};

const upsertSession = (sessions: CountSession[], session: CountSession): CountSession[] => {
  const existingIndex = sessions.findIndex((entry) => entry.id === session.id);

  if (existingIndex === -1) {
    return [session, ...sessions];
  }

  return sessions.map((entry) => (entry.id === session.id ? session : entry));
};

export const sessionHistoryReducer = createReducer(
  initialSessionHistoryState,
  on(loadSessionsFromStorageSuccess, (_, { sessions }) => ({ sessions })),
  on(addSession, (state, { session }) => ({ sessions: upsertSession(state.sessions, session) })),
  on(updateSession, (state, { session }) => ({ sessions: upsertSession(state.sessions, session) })),
  on(deleteSession, (state, { id }) => ({
    sessions: state.sessions.filter((session) => session.id !== id),
  })),
);
