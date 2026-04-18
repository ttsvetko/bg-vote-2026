import { createFeatureSelector, createSelector } from '@ngrx/store';

import { UiState } from '../../core/models';

export const selectUi = createFeatureSelector<UiState>('ui');
export const selectShowAllParties = createSelector(selectUi, (state) => state.showAllParties);
export const selectConfirmDialog = createSelector(selectUi, (state) => state.confirmDialog);
