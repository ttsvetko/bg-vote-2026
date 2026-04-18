import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ReferenceDataState } from './reference-data.reducer';

export const selectReferenceData = createFeatureSelector<ReferenceDataState>('referenceData');

export const selectElection = createSelector(selectReferenceData, (state) => state.election);
export const selectParties = createSelector(selectReferenceData, (state) => state.parties);
export const selectPreferenceLists = createSelector(selectReferenceData, (state) => state.preferenceLists);
export const selectReferenceDataLoaded = createSelector(selectReferenceData, (state) => state.loaded);
export const selectReferenceDataError = createSelector(selectReferenceData, (state) => state.error);
