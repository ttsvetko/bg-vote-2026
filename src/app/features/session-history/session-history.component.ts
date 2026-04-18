import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { PdfService } from '../../core/services/pdf.service';
import { deleteSession } from '../../store/session-history/session-history.actions';
import { selectSessionsSorted } from '../../store/session-history/session-history.selectors';
import { openConfirmDialog } from '../../store/ui/ui.actions';
import { FormatTimestampPipe } from '../../shared/pipes/format-timestamp.pipe';
import { SessionCardComponent } from '../../shared/components/session-card/session-card.component';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [CommonModule, FormatTimestampPipe, SessionCardComponent],
  template: `
    <section class="panel">
      <header class="panel__header">
        <div>
          <p class="eyebrow">История</p>
          <h2>Всички запазени преброявания</h2>
        </div>
        <span class="badge">{{ sessions().length }}</span>
      </header>

      @if (sessions().length === 0) {
        <p class="empty">Няма приключени записи.</p>
      } @else {
        <div class="list">
          @for (session of sessions(); track session.id) {
            <app-session-card
              [session]="session"
              (detailsPressed)="openDetails($event.id)"
              (pdfPressed)="exportSession($event.id)"
              (deletePressed)="confirmDelete($event.id, $event.title)"
            />
          }
        </div>
      }
    </section>
  `,
  styles: `
    .panel {
      display: grid;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid rgba(16, 72, 89, 0.08);
      border-radius: 28px;
      padding: 1.25rem;
    }

    .panel__header {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
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

    .badge {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #104859;
      color: #fff;
      font-weight: 700;
      flex: none;
    }

    .list {
      display: grid;
      gap: 0.8rem;
    }

    .empty {
      margin: 0;
      color: #526872;
      font-size: 0.9rem;
      line-height: 1.25;
    }

    @media (min-width: 768px) {
      .panel,
      .panel__header {
        padding: 1.5rem;
      }

      .panel__header,
      .panel__header {
        flex-direction: row;
        align-items: center;
      }
    }
  `,
})
export class SessionHistoryComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly pdf = inject(PdfService);

  protected readonly sessions = this.store.selectSignal(selectSessionsSorted);

  protected openDetails(id: string): void {
    void this.router.navigate(['/history', id]);
  }

  protected async exportSession(id: string): Promise<void> {
    const session = this.sessions().find((entry) => entry.id === id);

    if (session) {
      await this.pdf.generateSessionReport(session);
    }
  }

  protected confirmDelete(id: string, title: string): void {
    this.store.dispatch(
      openConfirmDialog({
        config: {
          title: 'Изтриване на преброяване',
          message: `Сигурни ли сте, че искате да изтриете "${title}"? Това действие е необратимо.`,
          confirmLabel: 'Изтрий',
          cancelLabel: 'Откажи',
          confirmAction: deleteSession.type,
          payload: { id },
        },
      }),
    );
  }
}
