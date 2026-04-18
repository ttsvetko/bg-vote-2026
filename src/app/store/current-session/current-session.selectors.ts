import { createFeatureSelector, createSelector } from '@ngrx/store';

import { CurrentSessionState } from './current-session.reducer';
import { selectParties } from '../reference-data/reference-data.selectors';
import { selectShowAllParties } from '../ui/ui.selectors';

export const selectCurrentSession = createFeatureSelector<CurrentSessionState>('currentSession');

export const selectCurrentSessionEntity = createSelector(selectCurrentSession, (state) => state.session);
export const selectCurrentItems = createSelector(selectCurrentSession, (state) => state.session?.items ?? []);
export const selectCurrentSessionDirty = createSelector(selectCurrentSession, (state) => state.isDirty);
export const selectCurrentMode = createSelector(selectCurrentSessionEntity, (session) => session?.mode ?? null);

export const selectTop6Items = createSelector(selectCurrentItems, selectParties, (items, parties) => {
  const top6Numbers = new Set(parties.filter((party) => party.likelyTop5).map((party) => party.ballotNumber));
  return items.filter((item) => top6Numbers.has(item.ballotNumber));
});

export const selectDisplayedItems = createSelector(
  selectCurrentItems,
  selectTop6Items,
  selectShowAllParties,
  (all, top6, showAll) => (showAll ? all : top6),
);

export const selectTotalCount = createSelector(selectCurrentItems, (items) =>
  items.reduce((sum, item) => sum + item.count, 0),
);

export const selectCanUndo = createSelector(selectCurrentSession, (state) => state.past.length > 0);
export const selectCanRedo = createSelector(selectCurrentSession, (state) => state.future.length > 0);
