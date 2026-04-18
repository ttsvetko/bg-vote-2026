import { createReducer, on } from '@ngrx/store';

import { UiState } from '../../core/models';
import { closeConfirmDialog, openConfirmDialog, toggleShowAllParties } from './ui.actions';

export const initialUiState: UiState = {
  showAllParties: false,
  confirmDialog: null,
};

export const uiReducer = createReducer(
  initialUiState,
  on(toggleShowAllParties, (state) => ({ ...state, showAllParties: !state.showAllParties })),
  on(openConfirmDialog, (state, { config }) => ({ ...state, confirmDialog: config })),
  on(closeConfirmDialog, (state) => ({ ...state, confirmDialog: null })),
);
