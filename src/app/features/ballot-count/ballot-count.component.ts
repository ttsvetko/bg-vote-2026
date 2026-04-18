import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CountToolbarComponent } from './components/count-toolbar/count-toolbar.component';
import { PartyRowComponent } from './components/party-row/party-row.component';
import {
  cancelSession,
  completeSession,
  decrementCount,
  incrementCount,
  redo,
  saveAndExitSession,
  undo,
} from '../../store/current-session/current-session.actions';
import {
  selectCanRedo,
  selectCanUndo,
  selectCurrentSessionEntity,
  selectDisplayedItems,
  selectTotalCount,
} from '../../store/current-session/current-session.selectors';
import { Top5ToggleComponent } from '../../shared/components/top5-toggle/top5-toggle.component';
import { openConfirmDialog, toggleDensityMode, toggleShowAllParties } from '../../store/ui/ui.actions';
import { selectIsUltraCompact, selectShowAllParties } from '../../store/ui/ui.selectors';

@Component({
  selector: 'app-ballot-count',
  standalone: true,
  imports: [CommonModule, CountToolbarComponent, PartyRowComponent, Top5ToggleComponent],
  template: `
    @if (session(); as currentSession) {
      <section class="screen" [class.screen--ultra]="isUltraCompact()">
        <div class="screen__sticky">
          <app-count-toolbar
            [title]="currentSession.title"
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
              <app-top5-toggle [showAll]="showAll()" [ultraCompact]="isUltraCompact()" (toggled)="toggleVisibleItems()" />
            </div>
            <div class="screen__totals">
              <strong>Общо бюлетини: {{ formatTotalBallots(currentSession.totalBallots) }}</strong>
              <strong>Преброени: {{ total() }}</strong>
            </div>
          </div>
        </div>

        <div class="screen__list">
          @for (item of items(); track item.key) {
            <app-party-row
              [item]="item"
              [ultraCompact]="isUltraCompact()"
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
        <h2>Няма активна сесия за бюлетини</h2>
        <button type="button" class="button button--primary" (click)="goHome()">Към таблото</button>
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

    .screen__totals {
      display: grid;
      gap: 0.2rem;
      align-items: start;
    }

    .screen__list {
      display: grid;
      gap: 0.5rem;
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

      .screen__totals {
        text-align: right;
        justify-items: end;
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
export class BallotCountComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly currentSession = this.store.selectSignal(selectCurrentSessionEntity);

  protected readonly session = computed(() => (this.currentSession()?.mode === 'ballots' ? this.currentSession() : null));
  protected readonly items = this.store.selectSignal(selectDisplayedItems);
  protected readonly total = this.store.selectSignal(selectTotalCount);
  protected readonly showAll = this.store.selectSignal(selectShowAllParties);
  protected readonly isUltraCompact = this.store.selectSignal(selectIsUltraCompact);
  protected readonly canUndo = this.store.selectSignal(selectCanUndo);
  protected readonly canRedo = this.store.selectSignal(selectCanRedo);

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

  protected toggleVisibleItems(): void {
    this.store.dispatch(toggleShowAllParties());
  }

  protected toggleDensity(): void {
    this.store.dispatch(toggleDensityMode());
  }

  protected formatTotalBallots(value: number | undefined): string {
    if (value === undefined) {
      return 'не е зададено';
    }

    return String(value);
  }

  protected save(): void {
    const counted = this.total();
    const expected = this.session()?.totalBallots;
    const mismatch = typeof expected === 'number' && expected !== counted;
    const mismatchNote = mismatch ? ` Внимание: преброени ${counted}, общо бюлетини ${expected}.` : '';

    this.store.dispatch(
      openConfirmDialog({
        config: {
          title: 'Запазване на гласуването',
          message: `Сигурни ли сте, че искате да запазите текущото преброяване и да се върнете към таблото?${mismatchNote}`,
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

  protected goHome(): void {
    void this.router.navigateByUrl('/');
  }
}
