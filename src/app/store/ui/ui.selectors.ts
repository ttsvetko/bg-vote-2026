import { createFeatureSelector, createSelector } from '@ngrx/store';

import { UiState } from '../../core/models';

export const selectUi = createFeatureSelector<UiState>('ui');
export const selectShowAllParties = createSelector(selectUi, (state) => state.showAllParties);
export const selectDensityMode = createSelector(selectUi, (state) => state.densityMode);
export const selectIsUltraCompact = createSelector(selectDensityMode, (mode) => mode === 'ultra');
export const selectDefaultTotalBallots = createSelector(selectUi, (state) => state.defaultTotalBallots);
export const selectTotalBallotsModalOpen = createSelector(selectUi, (state) => state.totalBallotsModalOpen);
export const selectTotalBallotsModalStartBallotAfterSave = createSelector(
  selectUi,
  (state) => state.totalBallotsModalStartBallotAfterSave,
);
export const selectConfirmDialog = createSelector(selectUi, (state) => state.confirmDialog);
