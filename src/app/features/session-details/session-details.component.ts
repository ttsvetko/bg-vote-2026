import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { PdfService } from '../../core/services/pdf.service';
import { selectSessionById } from '../../store/session-history/session-history.selectors';
import { FormatTimestampPipe } from '../../shared/pipes/format-timestamp.pipe';

@Component({
  selector: 'app-session-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormatTimestampPipe],
  template: `
    @if (session(); as currentSession) {
      <section class="panel">
        <div class="panel__header">
          <div>
            <p class="eyebrow">{{ currentSession.mode === 'ballots' ? 'Бюлетини' : 'Преференции' }}</p>
            <h2>{{ currentSession.title }}</h2>
          </div>

          <div class="panel__actions">
            <a routerLink="/history" class="button button--ghost">Назад</a>
            <button type="button" class="button button--primary" (click)="export()">PDF</button>
          </div>
        </div>

        <dl class="meta">
          <div><dt>Старт</dt><dd>{{ currentSession.startedAt | formatTimestamp }}</dd></div>
          <div><dt>Край</dt><dd>{{ currentSession.finishedAt | formatTimestamp }}</dd></div>
          <div><dt>Статус</dt><dd>{{ currentSession.status }}</dd></div>
          <div><dt>Сесия ID</dt><dd>{{ currentSession.id }}</dd></div>
          <div><dt>Общо бюлетини</dt><dd>{{ totalCount() }}</dd></div>
        </dl>

        <div class="sort">
          <label for="result-sort">Сортиране:</label>
          <select id="result-sort" [value]="sortMode()" (change)="changeSort($event)">
            <option value="ballot">По номер в бюлетината</option>
            <option value="votesDesc">По гласове (най-много първо)</option>
            <option value="votesAsc">По гласове (най-малко първо)</option>
          </select>
        </div>

        <div class="list">
          @for (item of sortedItems(); track item.key) {
            <article class="list__item">
              <div class="list__identity">
                <span>{{ item.ballotNumber }}</span>
                <strong>{{ item.label }}</strong>
              </div>
              <div class="list__result">
                <output>{{ item.count }}</output>
                <small>{{ formatPercent(item.count) }}</small>
              </div>
            </article>
          }
        </div>
      </section>
    } @else {
      <section class="panel">
        <h2>Сесията не беше намерена</h2>
        <button type="button" class="button button--primary" (click)="goBack()">Към историята</button>
      </section>
    }
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

    .panel__actions {
      display: grid;
      gap: 0.75rem;
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

    .meta {
      display: grid;
      gap: 0.8rem;
      margin: 0;
    }

    .meta div {
      background: #f9fbfb;
      border-radius: 18px;
      border: 1px solid rgba(16, 72, 89, 0.08);
      padding: 0.9rem 1rem;
    }

    dt {
      font-size: 0.8rem;
      color: #5a7078;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    dd {
      margin: 0.35rem 0 0;
    }

    .list {
      display: grid;
      gap: 0.8rem;
    }

    .sort {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sort label {
      font-size: 0.85rem;
      color: #5a7078;
    }

    .sort select {
      min-height: 44px;
      border-radius: 12px;
      border: 1px solid rgba(16, 72, 89, 0.2);
      padding: 0.65rem 0.8rem;
      font: inherit;
      background: #fff;
      color: #122027;
    }

    .list__item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 18px;
      background: #fff;
      border: 1px solid rgba(16, 72, 89, 0.08);
    }

    .list__identity {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 0;
    }

    .list__identity strong {
      min-width: 0;
      white-space: normal;
    }

    .list__item strong,
    dd,
    h2 {
      overflow-wrap: anywhere;
    }

    .list__item span {
      width: 2.2rem;
      height: 2.2rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #104859;
      color: #fff;
      flex: none;
    }

    output {
      font-weight: 700;
    }

    .list__result {
      display: inline-flex;
      align-items: baseline;
      justify-self: end;
      gap: 0.6rem;
      white-space: nowrap;
    }

    .list__result small {
      color: #526872;
      font-weight: 600;
    }

    .button {
      min-height: 44px;
      border-radius: 999px;
      border: 0;
      padding: 0.8rem 1rem;
      cursor: pointer;
      font: inherit;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .button--primary {
      background: #104859;
      color: white;
    }

    .button--ghost {
      background: #edf3f5;
      color: #17475a;
    }

    @media (min-width: 768px) {
      .panel {
        padding: 1.5rem;
      }

      .panel__header {
        flex-direction: row;
        align-items: start;
      }

      .panel__actions {
        display: flex;
        flex-wrap: wrap;
      }

      .meta {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .sort {
        max-width: 420px;
      }

      .list__item {
        grid-template-columns: minmax(0, 1fr) auto;
      }

      .button {
        width: auto;
      }
    }
  `,
})
export class SessionDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly pdf = inject(PdfService);
  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly sortMode = signal<'ballot' | 'votesDesc' | 'votesAsc'>('ballot');
  private readonly percentageFormatter = new Intl.NumberFormat('bg-BG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  protected readonly session = this.store.selectSignal(selectSessionById(this.id));
  protected readonly totalCount = computed(() => {
    const session = this.session();
    return session ? session.items.reduce((sum, item) => sum + item.count, 0) : 0;
  });
  protected readonly sortedItems = computed(() => {
    const session = this.session();
    const items = session ? [...session.items] : [];
    const mode = this.sortMode();

    if (mode === 'votesDesc') {
      return items.sort((a, b) => b.count - a.count || a.ballotNumber - b.ballotNumber);
    }

    if (mode === 'votesAsc') {
      return items.sort((a, b) => a.count - b.count || a.ballotNumber - b.ballotNumber);
    }

    return items.sort((a, b) => a.ballotNumber - b.ballotNumber);
  });

  protected changeSort(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    const value = select?.value;

    if (value === 'votesDesc' || value === 'votesAsc' || value === 'ballot') {
      this.sortMode.set(value);
    }
  }

  protected formatPercent(count: number): string {
    const total = this.totalCount();

    if (total <= 0) {
      return '0,00%';
    }

    return `${this.percentageFormatter.format((count / total) * 100)}%`;
  }

  protected async export(): Promise<void> {
    const session = this.session();

    if (session) {
      await this.pdf.generateSessionReport(session);
    }
  }

  protected goBack(): void {
    void this.router.navigateByUrl('/history');
  }
}
