import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { debounceTime, filter, map, tap, withLatestFrom } from 'rxjs';

import { CounterItem, CountMode, CountSession, PartyDefinition, PreferenceListDefinition } from '../../core/models';
import { StorageService } from '../../core/services/storage.service';
import { selectCurrentSessionEntity } from './current-session.selectors';
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
  saveAndExitSession,
  startBallotSession,
  startPreferenceSession,
  undo,
} from './current-session.actions';
import { selectElection, selectParties, selectPreferenceLists } from '../reference-data/reference-data.selectors';
import { addSession, updateSession } from '../session-history/session-history.actions';
import { selectSessions } from '../session-history/session-history.selectors';

const buildBallotItems = (parties: PartyDefinition[]): CounterItem[] =>
  parties.map((party) => ({
    key: `party-${party.ballotNumber}`,
    label: party.shortName,
    subtitle: party.fullName,
    ballotNumber: party.ballotNumber,
    count: 0,
  }));

const buildPreferenceItems = (list: PreferenceListDefinition): CounterItem[] =>
  list.candidates.map((candidate) => ({
    key: `pref-${list.partyBallotNumber}-${String(candidate.preferenceNumber).padStart(3, '0')}`,
    label: candidate.name,
    ballotNumber: candidate.preferenceNumber,
    count: 0,
  }));

const buildSession = (
  mode: CountMode,
  title: string,
  items: CounterItem[],
  electionId: string,
  dataVersion: string,
): CountSession => ({
  id: crypto.randomUUID(),
  mode,
  title,
  startedAt: new Date().toISOString(),
  status: 'draft',
  items,
  electionId,
  dataVersion,
});

@Injectable()
export class CurrentSessionEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  startBallot$ = createEffect(() =>
    this.actions$.pipe(
      ofType(startBallotSession),
      withLatestFrom(this.store.select(selectParties), this.store.select(selectElection)),
      filter(([, parties, election]) => parties.length > 0 && !!election),
      map(([, parties, election]) =>
        initializeSession({
          session: buildSession(
            'ballots',
            `Броене на бюлетини - ${new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}`,
            buildBallotItems(parties),
            election!.id,
            election!.dataVersion,
          ),
        }),
      ),
    ),
  );

  startPreference$ = createEffect(() =>
    this.actions$.pipe(
      ofType(startPreferenceSession),
      withLatestFrom(this.store.select(selectPreferenceLists), this.store.select(selectElection)),
      map(([{ partyBallotNumber }, lists, election]) => ({
        list: lists.find((entry) => entry.partyBallotNumber === partyBallotNumber) ?? null,
        election,
      })),
      filter(({ list, election }) => !!list && !!election),
      map(({ list, election }) =>
        initializeSession({
          session: buildSession(
            'preferences',
            `Преференции ${list!.partyShortName} - ${new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}`,
            buildPreferenceItems(list!),
            election!.id,
            election!.dataVersion,
          ),
        }),
      ),
    ),
  );

  autosave$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(incrementCount, decrementCount, undo, redo),
        debounceTime(500),
        withLatestFrom(this.store.select(selectCurrentSessionEntity)),
        filter(([, session]) => !!session),
        tap(([, session]) => this.storage.saveDraft(session!)),
      ),
    { dispatch: false },
  );

  saveDraft$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(saveDraft, restoreDraftSession),
        withLatestFrom(this.store.select(selectCurrentSessionEntity)),
        tap(([, session]) => {
          if (session) {
            this.storage.saveDraft(session);
          }
        }),
      ),
    { dispatch: false },
  );

  saveAndExit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(saveAndExitSession),
        tap(() => {
          this.store.dispatch(saveDraft());
          void this.router.navigateByUrl('/');
        }),
      ),
    { dispatch: false },
  );

  complete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(completeSession),
      withLatestFrom(this.store.select(selectCurrentSessionEntity), this.store.select(selectSessions)),
      filter(([, session]) => !!session),
      map(([, session, sessions]) => {
        const exists = sessions.some((entry) => entry.id === session!.id);
        return exists ? updateSession({ session: session! }) : addSession({ session: session! });
      }),
    ),
  );

  completeCleanup$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addSession, updateSession),
        tap(() => {
          this.storage.clearDraft();
          this.store.dispatch(clearCurrentSession());
          void this.router.navigateByUrl('/');
        }),
      ),
    { dispatch: false },
  );

  cancel$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(cancelSession),
        tap(() => {
          this.storage.clearDraft();
          this.store.dispatch(clearCurrentSession());
          void this.router.navigateByUrl('/');
        }),
      ),
    { dispatch: false },
  );
}
