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
import { selectPartiesWithPreferenceLists } from '../../store/reference-data/reference-data.selectors';
import { openConfirmDialog, toggleDensityMode } from '../../store/ui/ui.actions';
import { selectIsUltraCompact } from '../../store/ui/ui.selectors';

@Component({
  selector: 'app-preference-count',
  standalone: true,
  imports: [CommonModule, PartySelectorComponent, PreferenceRowComponent, CountToolbarComponent],
  template: `
    <section class="screen" [class.screen--ultra]="isUltraCompact()">
      @if (session(); as currentSession) {
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
            <button type="button" class="button button--ghost density" (click)="toggleDensity()">
              {{ isUltraCompact() ? 'Compact' : 'Ultra-compact' }}
            </button>
          </div>
          <strong>Общо преференции: {{ total() }}</strong>
        </div>

        <div class="screen__list">
          @for (item of items(); track item.key) {
            <app-preference-row
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
      gap: 0.65rem;
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid rgba(16, 72, 89, 0.08);
      border-radius: 20px;
      padding: 0.8rem 0.9rem;
    }

    .selector-panel {
      display: grid;
      gap: 0.65rem;
      padding: 0.1rem;
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
      gap: 0.5rem;
    }

    .screen__actions,
    .footer {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      justify-content: space-between;
    }

    .screen__toggles {
      display: grid;
      gap: 0.4rem;
      width: 100%;
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

    .screen--ultra .screen__list {
      gap: 0.35rem;
    }

    .screen--ultra .button {
      min-height: 34px;
      padding: 0.35rem 0.65rem;
      font-size: 0.84rem;
    }

    @media (min-width: 768px) {
      .screen {
        padding: 1rem 1.1rem;
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
  private readonly router = inject(Router);
  private readonly currentSession = this.store.selectSignal(selectCurrentSessionEntity);

  protected readonly parties = this.store.selectSignal(selectPartiesWithPreferenceLists);
  protected readonly items = this.store.selectSignal(selectCurrentItems);
  protected readonly total = this.store.selectSignal(selectTotalCount);
  protected readonly isUltraCompact = this.store.selectSignal(selectIsUltraCompact);
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
}
