import { createReducer, on } from '@ngrx/store';

import { UiState } from '../../core/models';
import {
  closeConfirmDialog,
  openConfirmDialog,
  setDefaultTotalBallots,
  setDensityMode,
  toggleDensityMode,
  toggleShowAllParties,
} from './ui.actions';

export const initialUiState: UiState = {
  showAllParties: false,
  densityMode: 'compact',
  defaultTotalBallots: null,
  confirmDialog: null,
};

export const uiReducer = createReducer(
  initialUiState,
  on(toggleShowAllParties, (state) => ({ ...state, showAllParties: !state.showAllParties })),
  on(toggleDensityMode, (state) => ({ ...state, densityMode: state.densityMode === 'ultra' ? 'compact' : 'ultra' })),
  on(setDensityMode, (state, { mode }) => ({ ...state, densityMode: mode })),
  on(setDefaultTotalBallots, (state, { totalBallots }) => ({ ...state, defaultTotalBallots: totalBallots })),
  on(openConfirmDialog, (state, { config }) => ({ ...state, confirmDialog: config })),
  on(closeConfirmDialog, (state) => ({ ...state, confirmDialog: null })),
);
