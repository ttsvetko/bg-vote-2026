import { createAction, props } from '@ngrx/store';

import { ConfirmDialogConfig } from '../../core/models';

export const toggleShowAllParties = createAction('[UI] Toggle Show All Parties');

export const openConfirmDialog = createAction(
  '[UI] Open Confirm Dialog',
  props<{ config: ConfirmDialogConfig }>(),
);

export const closeConfirmDialog = createAction('[UI] Close Confirm Dialog');
