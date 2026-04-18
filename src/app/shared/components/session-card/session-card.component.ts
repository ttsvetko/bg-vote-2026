import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { CountSession } from '../../../core/models';
import { FormatTimestampPipe } from '../../pipes/format-timestamp.pipe';

@Component({
  selector: 'app-session-card',
  standalone: true,
  imports: [CommonModule, FormatTimestampPipe],
  template: `
    <article class="card" [class.card--mismatch]="isBallotMismatch()">
      <div class="card__meta">
        <strong>{{ session().title }}</strong>
        <div class="card__times">
          <p><span>Старт:</span> {{ session().startedAt | formatTimestamp }}</p>
          <p><span>Край:</span> {{ session().finishedAt | formatTimestamp }}</p>
        </div>
        @if (isBallotMismatch()) {
          <p class="mismatch">
            Разминаване: преброени {{ totalCount() }}, по протокол {{ session().totalBallots }}.
          </p>
        }
      </div>

      <div class="card__actions">
        <button type="button" class="button button--ghost" (click)="detailsPressed.emit(session())">Детайли</button>
        <button type="button" class="button button--ghost" (click)="pdfPressed.emit(session())">PDF</button>
        <button type="button" class="button button--danger" (click)="deletePressed.emit(session())">Изтрий</button>
      </div>
    </article>
  `,
  styles: `
    .card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: space-between;
      padding: 1rem;
      border-radius: 20px;
      background: #f9fbfb;
      border: 1px solid rgba(16, 72, 89, 0.08);
    }

    .card--mismatch {
      background: #fff2f2;
      border-color: rgba(159, 29, 53, 0.28);
    }

    .card__times {
      display: grid;
      gap: 0.25rem;
      margin-top: 0.4rem;
    }

    .card__times p {
      margin: 0;
      color: #526872;
      font-size: 0.9rem;
      line-height: 1.25;
    }

    .card__times span {
      color: #17475a;
      font-weight: 600;
      font-size: 0.84rem;
      letter-spacing: 0.01em;
    }

    .mismatch {
      margin: 0.55rem 0 0;
      color: #8d162b;
      font-weight: 650;
      font-size: 0.9rem;
      line-height: 1.3;
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

    .button--ghost {
      background: #edf3f5;
      color: #17475a;
    }

    .button--danger {
      background: #9f1d35;
      color: #fff;
    }

    @media (min-width: 768px) {
      .card {
        flex-direction: row;
        align-items: center;
      }

      .card__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .button {
        width: auto;
      }
    }
  `,
})
export class SessionCardComponent {
  readonly session = input.required<CountSession>();
  readonly detailsPressed = output<CountSession>();
  readonly pdfPressed = output<CountSession>();
  readonly deletePressed = output<CountSession>();

  protected readonly totalCount = computed(() =>
    this.session().items.reduce((sum, item) => sum + item.count, 0),
  );

  protected readonly isBallotMismatch = computed(() => {
    const session = this.session();
    if (session.mode !== 'ballots' || session.totalBallots === undefined) {
      return false;
    }
    return this.totalCount() !== session.totalBallots;
  });
}

