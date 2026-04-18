import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { PartySelectorComponent } from './components/party-selector/party-selector.component';
import { PreferenceRowComponent } from './components/preference-row/preference-row.component';
import { CountToolbarComponent } from '../ballot-count/components/count-toolbar/count-toolbar.component';
import {
  cancelSession,
  completeSession,
  decrementCount,
  incrementCount,
  redo,
  saveDraft,
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
import { openConfirmDialog } from '../../store/ui/ui.actions';

@Component({
  selector: 'app-preference-count',
  standalone: true,
  imports: [CommonModule, PartySelectorComponent, PreferenceRowComponent, CountToolbarComponent],
  template: `
    <section class="screen">
      @if (session(); as currentSession) {
        <app-count-toolbar
          [title]="currentSession.title"
          [startedAt]="currentSession.startedAt"
          [canUndo]="canUndo()"
          [canRedo]="canRedo()"
          (undoPressed)="undoAction()"
          (redoPressed)="redoAction()"
        />

        <strong>Общо преференции: {{ total() }}</strong>

        <div class="screen__list">
          @for (item of items(); track item.key) {
            <app-preference-row
              [item]="item"
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
      } @else {
        <div class="selector-panel">
          <div>
            <p class="eyebrow">Стъпка 1</p>
            <h2>Избери партия за преференциално броене</h2>
          </div>

          <app-party-selector [parties]="parties()" (start)="startSession($event)" />
        </div>
      }
    </section>
  `,
  styles: `
    .screen {
      display: grid;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid rgba(16, 72, 89, 0.08);
      border-radius: 28px;
      padding: 1.25rem;
    }

    .selector-panel {
      display: grid;
      gap: 1rem;
      padding: 0.25rem;
    }

    .eyebrow {
      margin: 0 0 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.75rem;
      color: #8a5a1f;
    }

    h2 {
      margin: 0;
    }

    .screen__list {
      display: grid;
      gap: 0.8rem;
    }

    .footer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: space-between;
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
      .screen {
        padding: 1.5rem;
      }

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
export class PreferenceCountComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly currentSession = this.store.selectSignal(selectCurrentSessionEntity);

  protected readonly parties = this.store.selectSignal(selectParties);
  protected readonly items = this.store.selectSignal(selectCurrentItems);
  protected readonly total = this.store.selectSignal(selectTotalCount);
  protected readonly canUndo = this.store.selectSignal(selectCanUndo);
  protected readonly canRedo = this.store.selectSignal(selectCanRedo);
  protected readonly session = computed(() =>
    this.currentSession()?.mode === 'preferences' ? this.currentSession() : null,
  );

  protected startSession(partyBallotNumber: number): void {
    this.store.dispatch(startPreferenceSession({ partyBallotNumber }));
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
}
