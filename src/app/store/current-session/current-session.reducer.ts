import { createReducer, on } from '@ngrx/store';

import { CounterItem, CountSession } from '../../core/models';
import {
  cancelSession,
  clearCurrentSession,
  completeSession,
  decrementCount,
  incrementCount,
  initializeSession,
  redo,
  restoreDraftSession,
  saveDraft,
  undo,
} from './current-session.actions';

export interface CurrentSessionState {
  session: CountSession | null;
  past: CounterItem[][];
  future: CounterItem[][];
  isDirty: boolean;
}

export const initialCurrentSessionState: CurrentSessionState = {
  session: null,
  past: [],
  future: [],
  isDirty: false,
};

const cloneItems = (items: CounterItem[]): CounterItem[] => items.map((item) => ({ ...item }));

const applyCountChange = (
  state: CurrentSessionState,
  key: string,
  delta: 1 | -1,
): CurrentSessionState => {
  if (!state.session) {
    return state;
  }

  const items = state.session.items.map((item) => {
    if (item.key !== key) {
      return item;
    }

    return {
      ...item,
      count: Math.max(0, item.count + delta),
    };
  });

  const changed = items.some((item, index) => item.count !== state.session?.items[index]?.count);

  if (!changed) {
    return state;
  }

  return {
    ...state,
    past: [...state.past, cloneItems(state.session.items)],
    future: [],
    session: { ...state.session, items },
    isDirty: true,
  };
};

export const currentSessionReducer = createReducer(
  initialCurrentSessionState,
  on(initializeSession, (_, { session }) => ({
    session,
    past: [],
    future: [],
    isDirty: false,
  })),
  on(restoreDraftSession, (_, { session }) => ({
    session,
    past: [],
    future: [],
    isDirty: false,
  })),
  on(incrementCount, (state, { key }) => applyCountChange(state, key, 1)),
  on(decrementCount, (state, { key }) => applyCountChange(state, key, -1)),
  on(undo, (state) => {
    if (!state.session || state.past.length === 0) {
      return state;
    }

    const items = state.past[state.past.length - 1] ?? [];

    return {
      ...state,
      past: state.past.slice(0, -1),
      future: [cloneItems(state.session.items), ...state.future],
      session: { ...state.session, items: cloneItems(items) },
      isDirty: true,
    };
  }),
  on(redo, (state) => {
    if (!state.session || state.future.length === 0) {
      return state;
    }

    const [items, ...future] = state.future;

    return {
      ...state,
      past: [...state.past, cloneItems(state.session.items)],
      future,
      session: { ...state.session, items: cloneItems(items ?? []) },
      isDirty: true,
    };
  }),
  on(saveDraft, (state) => ({ ...state, isDirty: false })),
  on(completeSession, (state) => {
    if (!state.session) {
      return state;
    }

    return {
      ...state,
      session: {
        ...state.session,
        status: 'completed',
        finishedAt: new Date().toISOString(),
      },
      isDirty: false,
    };
  }),
  on(cancelSession, (state) => {
    if (!state.session) {
      return state;
    }

    return {
      ...state,
      session: {
        ...state.session,
        status: 'cancelled',
        finishedAt: new Date().toISOString(),
      },
      isDirty: false,
    };
  }),
  on(clearCurrentSession, () => initialCurrentSessionState),
);
