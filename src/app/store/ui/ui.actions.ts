import { createAction, props } from '@ngrx/store';

import { ConfirmDialogConfig, CountMode, UiDensityMode } from '../../core/models';

export const toggleShowAllParties = createAction('[UI] Toggle Show All Parties');
export const toggleDensityMode = createAction('[UI] Toggle Density Mode');
export const setDensityMode = createAction('[UI] Set Density Mode', props<{ mode: UiDensityMode }>());

export const openConfirmDialog = createAction(
  '[UI] Open Confirm Dialog',
  props<{ config: ConfirmDialogConfig }>(),
);

export const closeConfirmDialog = createAction('[UI] Close Confirm Dialog');
export const navigateToCountRoute = createAction('[UI] Navigate To Count Route', props<{ mode: CountMode }>());
