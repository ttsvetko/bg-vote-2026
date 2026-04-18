import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SessionHistoryState } from './session-history.reducer';

export const selectSessionHistory = createFeatureSelector<SessionHistoryState>('sessionHistory');
export const selectSessions = createSelector(selectSessionHistory, (state) => state.sessions);
export const selectSessionsSorted = createSelector(selectSessions, (sessions) =>
  [...sessions].sort((left, right) => right.startedAt.localeCompare(left.startedAt)),
);
export const selectSessionById = (id: string) =>
  createSelector(selectSessions, (sessions) => sessions.find((session) => session.id === id) ?? null);
