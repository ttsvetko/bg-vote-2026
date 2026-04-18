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
  saveDraft,
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
import { openConfirmDialog, toggleShowAllParties } from '../../store/ui/ui.actions';
import { selectShowAllParties } from '../../store/ui/ui.selectors';

@Component({
  selector: 'app-ballot-count',
  standalone: true,
  imports: [CommonModule, CountToolbarComponent, PartyRowComponent, Top5ToggleComponent],
  template: `
    @if (session(); as currentSession) {
      <section class="screen">
        <app-count-toolbar
          [title]="currentSession.title"
          [startedAt]="currentSession.startedAt"
          [canUndo]="canUndo()"
          [canRedo]="canRedo()"
          (undoPressed)="undoAction()"
          (redoPressed)="redoAction()"
        />

        <div class="screen__actions">
          <app-top5-toggle [showAll]="showAll()" (toggled)="toggleVisibleItems()" />
          <strong>Общо: {{ total() }} бюлетини</strong>
        </div>

        <div class="screen__list">
          @for (item of items(); track item.key) {
            <app-party-row [item]="item" (increment)="incrementAction($event)" (decrement)="decrementAction($event)" />
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
      gap: 1rem;
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid rgba(16, 72, 89, 0.08);
      border-radius: 28px;
      padding: 1.25rem;
    }

    .screen__actions,
    .footer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: space-between;
    }

    .screen__list {
      display: grid;
      gap: 0.8rem;
    }

    .footer__actions {
      display: grid;
      gap: 0.75rem;
    }

    .button {
      min-height: 44px;
      border-radius: 999px;
      border: 0;
      padding: 0.8rem 1rem;
      cursor: pointer;
      font: inherit;
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

    @media (min-width: 768px) {
      .screen,
      .empty-state {
        padding: 1.5rem;
      }

      .screen__actions,
      .footer {
        flex-direction: row;
        align-items: center;
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

  protected save(): void {
    this.store.dispatch(saveDraft());
    void this.router.navigateByUrl('/');
  }

  protected complete(): void {
    this.store.dispatch(completeSession());
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
