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
            (undoPressed)="undoAction()"
            (redoPressed)="redoAction()"
          />

          <div class="screen__actions">
            <div class="screen__toggles">
              <app-top5-toggle [showAll]="showAll()" [ultraCompact]="isUltraCompact()" (toggled)="toggleVisibleItems()" />
              <button type="button" class="button button--ghost density" (click)="toggleDensity()">
                {{ isUltraCompact() ? 'Compact' : 'Ultra-compact' }}
              </button>
            </div>
            <strong>Общо: {{ total() }} бюлетини</strong>
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

    .density {
      min-height: 38px;
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

  protected goHome(): void {
    void this.router.navigateByUrl('/');
  }
}
