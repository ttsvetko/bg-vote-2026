import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { PdfService } from '../../core/services/pdf.service';
import { selectCurrentSessionEntity } from '../../store/current-session/current-session.selectors';
import { setTotalBallots, startBallotSession, startPreferenceSession } from '../../store/current-session/current-session.actions';
import { selectElection } from '../../store/reference-data/reference-data.selectors';
import { deleteSession } from '../../store/session-history/session-history.actions';
import { selectSessionsSorted } from '../../store/session-history/session-history.selectors';
import { navigateToCountRoute, openConfirmDialog, setDefaultTotalBallots } from '../../store/ui/ui.actions';
import { selectDefaultTotalBallots } from '../../store/ui/ui.selectors';
import { FormatTimestampPipe } from '../../shared/pipes/format-timestamp.pipe';
import { SessionCardComponent } from '../../shared/components/session-card/session-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormatTimestampPipe, SessionCardComponent],
  template: `
    <section class="dashboard">
      @if (showTotalBallotsModal()) {
        <div class="modal-overlay" role="presentation">
          <div class="modal" role="dialog" aria-modal="true" aria-label="Общо бюлетини">
            <p class="modal__eyebrow">Бюлетини</p>
            <h3>Общо бюлетини</h3>
            <p class="modal__hint">Ще се използва като default за ново броене и за проверка при запис.</p>

            <label class="modal__field">
              <span class="modal__label">Брой</span>
              <input
                type="number"
                inputmode="numeric"
                min="0"
                step="1"
                [value]="totalBallotsDraft()"
                (input)="onTotalBallotsInput($event)"
              />
            </label>

            <div class="modal__actions">
              <button type="button" class="button button--ghost" (click)="closeTotalBallotsModal()">Откажи</button>
              @if (defaultTotalBallots() !== null || (currentSession() && currentSession()!.mode === 'ballots' && currentSession()!.totalBallots !== undefined)) {
                <button type="button" class="button button--ghost" (click)="clearTotalBallots()">Изчисти</button>
              }
              <button
                type="button"
                class="button button--primary"
                [disabled]="!canSaveTotalBallots()"
                (click)="saveTotalBallots()"
              >
                Запази
              </button>
            </div>
          </div>
        </div>
      }

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
          <button type="button" class="button button--ghost" (click)="openTotalBallotsModal()">
            Общо бюлетини: {{ formatTotalBallots(displayedTotalBallots()) }}
          </button>
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
          @if (currentSession()!.mode === 'ballots') {
            <p class="muted">Общо бюлетини: {{ formatTotalBallots(currentSession()!.totalBallots) }}</p>
          }
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
              <app-session-card
                [session]="session"
                (detailsPressed)="openDetails($event.id)"
                (pdfPressed)="exportSession($event.id)"
                (deletePressed)="confirmDelete($event.id, $event.title)"
              />
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

    .hero__actions {
      display: grid;
      gap: 0.75rem;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(18, 32, 39, 0.42);
      display: grid;
      place-items: center;
      z-index: 60;
      padding: 1rem;
    }

    .modal {
      width: min(92vw, 460px);
      background: #fffdf8;
      border-radius: 24px;
      padding: 1.25rem;
      box-shadow: 0 24px 80px rgba(18, 32, 39, 0.24);
      border: 1px solid rgba(18, 32, 39, 0.08);
      display: grid;
      gap: 0.65rem;
    }

    .modal__eyebrow {
      margin: 0;
      color: #8a5a1f;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .modal__hint {
      margin: 0;
      line-height: 1.45;
      color: #526872;
    }

    .modal__field {
      display: grid;
      gap: 0.35rem;
    }

    .modal__label {
      font-size: 0.85rem;
      color: #5a7078;
    }

    .modal__field input {
      min-height: 44px;
      border-radius: 12px;
      border: 1px solid rgba(16, 72, 89, 0.2);
      padding: 0.65rem 0.8rem;
      font: inherit;
      background: #fff;
      color: #122027;
    }

    .modal__actions {
      display: grid;
      gap: 0.6rem;
      margin-top: 0.35rem;
    }

    .history {
      display: grid;
      gap: 0.8rem;
      margin-top: 1rem;
    }

    .empty {
      margin: 0;
      color: #526872;
      font-size: 0.9rem;
      line-height: 1.25;
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
      flex: none;
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

      .hero__actions {
        display: flex;
        flex-wrap: wrap;
      }

      .button {
        width: auto;
      }

      .modal__actions {
        display: flex;
        justify-content: end;
        flex-wrap: wrap;
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
  protected readonly defaultTotalBallots = this.store.selectSignal(selectDefaultTotalBallots);
  protected readonly displayedTotalBallots = computed(() => {
    const session = this.currentSession();
    if (session && session.mode === 'ballots') {
      return session.totalBallots;
    }
    return this.defaultTotalBallots();
  });

  protected readonly showTotalBallotsModal = signal(false);
  protected readonly totalBallotsDraft = signal<string>('');

  protected startBallot(): void {
    const draft = this.currentSession();

    if (draft && draft.status === 'draft' && draft.mode === 'ballots') {
      this.store.dispatch(
        openConfirmDialog({
          config: {
            title: 'Има незавършен драфт',
            message: 'Имате незавършено броене на бюлетини. Искате ли да го отворите или да започнете ново?',
            confirmLabel: 'Отвори драфта',
            cancelLabel: 'Ново броене',
            confirmAction: navigateToCountRoute.type,
            payload: { mode: 'ballots' },
            cancelAction: startBallotSession.type,
            destructiveAction: 'cancel',
          },
        }),
      );
      return;
    }

    this.store.dispatch(startBallotSession());
  }

  protected goToPreferences(): void {
    const draft = this.currentSession();

    if (draft && draft.status === 'draft' && draft.mode === 'preferences') {
      this.store.dispatch(
        openConfirmDialog({
          config: {
            title: 'Има незавършен драфт',
            message: 'Имате незавършено преброяване на преференции. Искате ли да го отворите или да започнете ново?',
            confirmLabel: 'Отвори драфта',
            cancelLabel: 'Ново броене',
            confirmAction: navigateToCountRoute.type,
            payload: { mode: 'preferences' },
            cancelAction: startPreferenceSession.type,
            destructiveAction: 'cancel',
          },
        }),
      );
      return;
    }

    this.store.dispatch(startPreferenceSession());
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

  protected openTotalBallotsModal(): void {
    const session = this.currentSession();
    const sessionValue = session && session.mode === 'ballots' ? session.totalBallots : undefined;
    const initial = sessionValue !== undefined ? sessionValue : this.defaultTotalBallots();
    this.totalBallotsDraft.set(initial !== null && initial !== undefined ? String(initial) : '');
    this.showTotalBallotsModal.set(true);
  }

  protected closeTotalBallotsModal(): void {
    this.showTotalBallotsModal.set(false);
  }

  protected onTotalBallotsInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.totalBallotsDraft.set(input?.value ?? '');
  }

  protected canSaveTotalBallots(): boolean {
    const raw = this.totalBallotsDraft().trim();
    if (!raw) {
      return false;
    }
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0;
  }

  protected saveTotalBallots(): void {
    const raw = this.totalBallotsDraft().trim();
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      return;
    }

    const normalized = Math.max(0, Math.trunc(value));
    this.store.dispatch(setDefaultTotalBallots({ totalBallots: normalized }));

    const session = this.currentSession();
    if (session && session.mode === 'ballots') {
      this.store.dispatch(setTotalBallots({ totalBallots: normalized }));
    }

    this.closeTotalBallotsModal();
  }

  protected clearTotalBallots(): void {
    this.store.dispatch(setDefaultTotalBallots({ totalBallots: null }));

    const session = this.currentSession();
    if (session && session.mode === 'ballots') {
      this.store.dispatch(setTotalBallots({ totalBallots: null }));
    }

    this.closeTotalBallotsModal();
  }

  protected formatTotalBallots(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return 'не е зададено';
    }

    return String(value);
  }
}
