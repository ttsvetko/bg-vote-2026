import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';

import { PreferenceRowComponent } from './components/preference-row/preference-row.component';
import { CountToolbarComponent } from '../ballot-count/components/count-toolbar/count-toolbar.component';
import {
  cancelSession,
  completeSession,
  decrementCount,
  incrementCount,
  redo,
  saveAndExitSession,
  startPreferenceSession,
  undo,
} from '../../store/current-session/current-session.actions';
import {
  selectCanRedo,
  selectCanUndo,
  selectCurrentSessionEntity,
  selectCurrentItems,
  selectTotalCount,
} from '../../store/current-session/current-session.selectors';
import { selectParties } from '../../store/reference-data/reference-data.selectors';
import { openConfirmDialog, toggleDensityMode } from '../../store/ui/ui.actions';
import { selectIsUltraCompact } from '../../store/ui/ui.selectors';

@Component({
  selector: 'app-preference-count',
  standalone: true,
  imports: [CommonModule, PreferenceRowComponent, CountToolbarComponent],
  template: `
    @if (session(); as currentSession) {
      <section class="screen" [class.screen--ultra]="isUltraCompact()">
        <div class="screen__sticky">
          <app-count-toolbar
            [title]="toolbarTitle()"
            [startedAt]="currentSession.startedAt"
            [canUndo]="canUndo()"
            [canRedo]="canRedo()"
            [ultraCompact]="isUltraCompact()"
            [showDensityToggle]="true"
            (undoPressed)="undoAction()"
            (redoPressed)="redoAction()"
            (densityTogglePressed)="toggleDensity()"
          />

          <div class="screen__actions">
            <div class="screen__toggles">
              <div class="party-filter-row">
                <label class="party-filter">
                  <select [value]="partyFilter()" (change)="changePartyFilter($event)">
                    <option value="all">Всички партии</option>
                    @for (party of availableParties(); track party.ballotNumber) {
                      <option [value]="party.ballotNumber">
                        {{ party.ballotNumber }} {{ isUltraCompact() ? party.shortName : party.fullName }}
                      </option>
                    }
                  </select>
                </label>
                <button type="button" class="button button--ghost clear-filter" (click)="clearPartyFilter()">
                  Изчисти
                </button>
              </div>
            </div>
            <strong>Общо преференции: {{ total() }}</strong>
          </div>
        </div>

        <div class="screen__list">
          @for (item of items(); track item.key) {
            <app-preference-row
              [item]="item"
              [ultraCompact]="isUltraCompact()"
              [partyFullNameByNumber]="partyFullNameByNumber()"
              (increment)="incrementAction($event)"
              (decrement)="decrementAction($event)"
            />
          }
        </div>

        <footer class="footer">
          <button type="button" class="button button--ghost" (click)="cancel()">Откажи</button>
          <div class="footer__actions">
            <button type="button" class="button button--secondary" (click)="save()">Запази</button>
            <button type="button" class="button button--primary" (click)="complete()">Приключи</button>
          </div>
        </footer>
      </section>
    } @else {
      <section class="empty-state">
        <h2>Няма активна сесия за преференции</h2>
        <button type="button" class="button button--primary" (click)="startSession()">Започни броене</button>
      </section>
    }
  `,
  styles: `
    .screen,
    .empty-state {
      display: grid;
      gap: 0.65rem;
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid rgba(16, 72, 89, 0.08);
      border-radius: 20px;
      padding: 0.8rem 0.9rem;
      overflow-x: hidden;
    }

    h2 {
      margin: 0;
    }

    .screen__list {
      display: grid;
      gap: 0.5rem;
    }

    .screen__actions,
    .footer {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      justify-content: space-between;
    }

    .screen__sticky {
      position: sticky;
      top: max(0.4rem, env(safe-area-inset-top));
      z-index: 20;
      display: grid;
      gap: 0.55rem;
      padding: 0.45rem 0.5rem;
      border-radius: 14px;
      background: rgba(247, 244, 234, 0.96);
      border: 1px solid rgba(16, 72, 89, 0.1);
      backdrop-filter: blur(2px);
    }

    .screen__toggles {
      display: grid;
      gap: 0.4rem;
      width: 100%;
    }

    .party-filter {
      display: grid;
      width: 100%;
    }

    .party-filter-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem;
      width: 100%;
    }

    .party-filter-row .party-filter {
      flex: 1 1 auto;
      min-width: 0;
    }

    .party-filter select {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      min-height: 38px;
      border-radius: 999px;
      border: 1px solid rgba(16, 72, 89, 0.16);
      padding: 0.35rem 0.8rem;
      font: inherit;
      font-size: 0.92rem;
      background: #fff;
      color: #17475a;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .footer__actions {
      display: grid;
      gap: 0.5rem;
    }

    .button {
      min-height: 38px;
      border-radius: 999px;
      border: 0;
      padding: 0.45rem 0.8rem;
      cursor: pointer;
      font: inherit;
      font-size: 0.92rem;
      width: 100%;
    }

    .button--primary {
      background: #104859;
      color: white;
    }

    .button--secondary {
      background: #f0dcb0;
      color: #5f3d10;
    }

    .button--ghost {
      background: #edf3f5;
      color: #17475a;
    }

    .density {
      min-height: 38px;
    }

    .clear-filter {
      min-height: 38px;
      width: auto;
      white-space: nowrap;
      flex: 0 0 auto;
    }

    @media (max-width: 420px) {
      .clear-filter {
        width: 100%;
      }
    }

    .screen--ultra {
      gap: 0.45rem;
      padding: 0.65rem 0.7rem;
    }

    .screen--ultra .screen__actions,
    .screen--ultra .footer {
      gap: 0.4rem;
    }

    .screen--ultra .screen__sticky {
      gap: 0.4rem;
      padding: 0.35rem 0.4rem;
      border-radius: 12px;
    }

    .screen--ultra .screen__list {
      gap: 0.35rem;
    }

    .screen--ultra .button {
      min-height: 34px;
      padding: 0.35rem 0.65rem;
      font-size: 0.84rem;
    }

    .screen--ultra .party-filter select {
      min-height: 34px;
      font-size: 0.84rem;
      padding: 0.25rem 0.65rem;
    }

    @media (min-width: 768px) {
      .screen,
      .empty-state {
        padding: 1rem 1.1rem;
      }

      .screen__sticky {
        top: 0.75rem;
      }

      .screen__actions,
      .footer {
        flex-direction: row;
        align-items: center;
      }

      .screen__toggles {
        display: inline-flex;
        width: auto;
      }

      .footer__actions {
        display: flex;
        flex-wrap: wrap;
      }

      .button {
        width: auto;
      }
    }
  `,
})
export class PreferenceCountComponent {
  private readonly store = inject(Store);
  private readonly currentSession = this.store.selectSignal(selectCurrentSessionEntity);
  protected readonly partyFilter = signal<string>('all');
  private readonly currentItems = this.store.selectSignal(selectCurrentItems);
  private readonly parties = this.store.selectSignal(selectParties);
  protected readonly partyFullNameByNumber = computed(
    () => new Map(this.parties().map((party) => [party.ballotNumber, party.fullName] as const)),
  );

  protected readonly total = this.store.selectSignal(selectTotalCount);
  protected readonly isUltraCompact = this.store.selectSignal(selectIsUltraCompact);
  protected readonly canUndo = this.store.selectSignal(selectCanUndo);
  protected readonly canRedo = this.store.selectSignal(selectCanRedo);
  protected readonly session = computed(() =>
    this.currentSession()?.mode === 'preferences' ? this.currentSession() : null,
  );
  protected readonly toolbarTitle = computed(() =>
    (this.session()?.title ?? '').replace(/\s*\(всички партии\)/i, ''),
  );
  protected readonly availableParties = computed(() => {
    const partiesByNumber = new Map(this.parties().map((party) => [party.ballotNumber, party]));
    const map = new Map<number, { shortName: string; fullName: string }>();

    for (const item of this.currentItems()) {
      if (!item.partyBallotNumber || !item.partyShortName || map.has(item.partyBallotNumber)) {
        continue;
      }

      const party = partiesByNumber.get(item.partyBallotNumber);
      map.set(item.partyBallotNumber, {
        shortName: party?.shortName ?? item.partyShortName,
        fullName: party?.fullName ?? item.partyShortName,
      });
    }

    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([ballotNumber, names]) => ({ ballotNumber, shortName: names.shortName, fullName: names.fullName }));
  });
  protected readonly items = computed(() => {
    const filter = this.partyFilter();
    const all = this.currentItems();
    const filtered = filter === 'all' ? all : all.filter((item) => item.partyBallotNumber === Number(filter));

    return [...filtered].sort(
      (a, b) =>
        (a.partyBallotNumber ?? Number.MAX_SAFE_INTEGER) - (b.partyBallotNumber ?? Number.MAX_SAFE_INTEGER) ||
        a.ballotNumber - b.ballotNumber,
    );
  });

  protected startSession(): void {
    this.store.dispatch(startPreferenceSession());
    this.partyFilter.set('all');
  }

  protected incrementAction(key: string): void {
    this.store.dispatch(incrementCount({ key }));
  }

  protected decrementAction(key: string): void {
    this.store.dispatch(decrementCount({ key }));
  }

  protected undoAction(): void {
    this.store.dispatch(undo());
  }

  protected redoAction(): void {
    this.store.dispatch(redo());
  }

  protected toggleDensity(): void {
    this.store.dispatch(toggleDensityMode());
  }

  protected changePartyFilter(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    this.partyFilter.set(target?.value ?? 'all');
  }

  protected clearPartyFilter(): void {
    this.partyFilter.set('all');
  }

  protected save(): void {
    this.store.dispatch(
      openConfirmDialog({
        config: {
          title: 'Запазване на гласуването',
          message: 'Сигурни ли сте, че искате да запазите текущото преброяване и да се върнете към таблото?',
          confirmLabel: 'Запази',
          cancelLabel: 'Назад',
          confirmAction: saveAndExitSession.type,
        },
      }),
    );
  }

  protected complete(): void {
    this.store.dispatch(
      openConfirmDialog({
        config: {
          title: 'Приключване на преброяването',
          message: 'Сигурни ли сте, че искате да приключите текущото преброяване? След това сесията ще бъде запазена в историята.',
          confirmLabel: 'Приключи',
          cancelLabel: 'Назад',
          confirmAction: completeSession.type,
        },
      }),
    );
  }

  protected cancel(): void {
    this.store.dispatch(
      openConfirmDialog({
        config: {
          title: 'Прекратяване на преброяването',
          message: 'Сигурни ли сте, че искате да прекратите текущото преброяване? Незапазените промени ще бъдат загубени.',
          confirmLabel: 'Прекрати',
          cancelLabel: 'Назад',
          confirmAction: cancelSession.type,
        },
      }),
    );
  }
}
