import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { PdfService } from '../../core/services/pdf.service';
import { selectCurrentSessionEntity } from '../../store/current-session/current-session.selectors';
import { startBallotSession, startPreferenceSession } from '../../store/current-session/current-session.actions';
import { selectElection } from '../../store/reference-data/reference-data.selectors';
import { deleteSession } from '../../store/session-history/session-history.actions';
import { selectSessionsSorted } from '../../store/session-history/session-history.selectors';
import { openConfirmDialog } from '../../store/ui/ui.actions';
import { FormatTimestampPipe } from '../../shared/pipes/format-timestamp.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormatTimestampPipe],
  template: `
    <section class="dashboard">
      <article class="panel panel--hero">
        <div>
          <p class="eyebrow">{{ election()?.label ?? 'Зареждане на изборни данни...' }}</p>
          <h2>Изцяло offline броене на бюлетини и преференции</h2>
          <p class="muted">
            Данните се пазят само в localStorage на това устройство. Няма синхронизация и няма backend.
          </p>
        </div>

        <div class="hero__actions">
          <button type="button" class="button button--primary" (click)="startBallot()">+ Ново броене на бюлетини</button>
          <button type="button" class="button button--secondary" (click)="goToPreferences()">+ Ново броене на преференции</button>
        </div>
      </article>

      @if (currentSession()) {
        <article class="panel">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Текущ draft</p>
              <h3>{{ currentSession()!.title }}</h3>
            </div>
            <button type="button" class="button button--secondary" (click)="resumeCurrent()">Продължи</button>
          </div>
          <p class="muted">Последно запазен: {{ currentSession()!.startedAt | formatTimestamp }}</p>
        </article>
      }

      <article class="panel">
        <div class="panel__header">
          <div>
            <p class="eyebrow">История</p>
            <h3>Запазени преброявания</h3>
          </div>
          <span class="badge">{{ sessions().length }}</span>
        </div>

        @if (sessions().length === 0) {
          <p class="empty">Все още няма приключени преброявания.</p>
        } @else {
          <div class="history">
            @for (session of sessions(); track session.id) {
              <article class="history__item">
                <div>
                  <strong>{{ session.title }}</strong>
                  <p>{{ session.startedAt | formatTimestamp }} → {{ session.finishedAt | formatTimestamp }}</p>
                </div>

                <div class="history__actions">
                  <button type="button" class="button button--ghost" (click)="openDetails(session.id)">Детайли</button>
                  <button type="button" class="button button--ghost" (click)="exportSession(session.id)">PDF</button>
                  <button type="button" class="button button--danger" (click)="confirmDelete(session.id, session.title)">Изтрий</button>
                </div>
              </article>
            }
          </div>
        }
      </article>
    </section>
  `,
  styles: `
    .dashboard {
      display: grid;
      gap: 1rem;
    }

    .panel {
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid rgba(16, 72, 89, 0.08);
      border-radius: 28px;
      padding: 1.25rem;
      box-shadow: 0 16px 40px rgba(16, 72, 89, 0.08);
    }

    .panel--hero {
      display: grid;
      gap: 1.5rem;
      background:
        linear-gradient(135deg, rgba(255, 244, 214, 0.95), rgba(233, 245, 246, 0.95)),
        #fff;
    }

    .panel__header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: space-between;
      align-items: start;
    }

    .eyebrow {
      margin: 0 0 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.75rem;
      color: #8a5a1f;
    }

    h2,
    h3 {
      margin: 0;
    }

    .muted {
      color: #526872;
      line-height: 1.55;
    }

    .hero__actions,
    .history__actions {
      display: grid;
      gap: 0.75rem;
    }

    .history {
      display: grid;
      gap: 0.8rem;
      margin-top: 1rem;
    }

    .history__item {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      border-radius: 20px;
      background: #f9fbfb;
      border: 1px solid rgba(16, 72, 89, 0.08);
    }

    .history__item p,
    .empty {
      margin: 0.35rem 0 0;
      color: #526872;
    }

    .badge {
      min-width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #104859;
      color: white;
      font-weight: 700;
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

    .history__item strong,
    .panel__header h3,
    h2 {
      overflow-wrap: anywhere;
    }

    .button--primary {
      background: #104859;
      color: #fff;
    }

    .button--secondary {
      background: #f0dcb0;
      color: #5f3d10;
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
      .panel {
        padding: 1.5rem;
      }

      .panel__header {
        flex-direction: row;
      }

      .hero__actions,
      .history__actions {
        display: flex;
        flex-wrap: wrap;
      }

      .history__item {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }

      .button {
        width: auto;
      }
    }
  `,
})
export class DashboardComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly pdf = inject(PdfService);

  protected readonly election = this.store.selectSignal(selectElection);
  protected readonly sessions = this.store.selectSignal(selectSessionsSorted);
  protected readonly currentSession = this.store.selectSignal(selectCurrentSessionEntity);

  protected startBallot(): void {
    this.store.dispatch(startBallotSession());
    void this.router.navigateByUrl('/ballot-count');
  }

  protected goToPreferences(): void {
    this.store.dispatch(startPreferenceSession());
    void this.router.navigateByUrl('/preference-count');
  }

  protected resumeCurrent(): void {
    const session = this.currentSession();

    if (!session) {
      return;
    }

    void this.router.navigateByUrl(session.mode === 'ballots' ? '/ballot-count' : '/preference-count');
  }

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
