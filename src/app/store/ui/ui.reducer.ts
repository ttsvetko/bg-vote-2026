import { createReducer, on } from '@ngrx/store';

import { UiState } from '../../core/models';
import {
  closeConfirmDialog,
  closeTotalBallotsModal,
  openConfirmDialog,
  openTotalBallotsModal,
  setDefaultTotalBallots,
  setDensityMode,
  toggleDensityMode,
  toggleShowAllParties,
} from './ui.actions';

export const initialUiState: UiState = {
  showAllParties: false,
  densityMode: 'compact',
  defaultTotalBallots: null,
  totalBallotsModalOpen: false,
  totalBallotsModalStartBallotAfterSave: false,
  confirmDialog: null,
};

export const uiReducer = createReducer(
  initialUiState,
  on(toggleShowAllParties, (state) => ({ ...state, showAllParties: !state.showAllParties })),
  on(toggleDensityMode, (state) => ({ ...state, densityMode: state.densityMode === 'ultra' ? 'compact' : 'ultra' })),
  on(setDensityMode, (state, { mode }) => ({ ...state, densityMode: mode })),
  on(setDefaultTotalBallots, (state, { totalBallots }) => ({ ...state, defaultTotalBallots: totalBallots })),
  on(openTotalBallotsModal, (state, { startBallotAfterSave }) => ({
    ...state,
    totalBallotsModalOpen: true,
    totalBallotsModalStartBallotAfterSave: startBallotAfterSave,
  })),
  on(closeTotalBallotsModal, (state) => ({
    ...state,
    totalBallotsModalOpen: false,
    totalBallotsModalStartBallotAfterSave: false,
  })),
  on(openConfirmDialog, (state, { config }) => ({ ...state, confirmDialog: config })),
  on(closeConfirmDialog, (state) => ({ ...state, confirmDialog: null })),
);
