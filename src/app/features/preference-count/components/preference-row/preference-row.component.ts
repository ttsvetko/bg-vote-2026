import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { CounterItem } from '../../../../core/models';

@Component({
  selector: 'app-preference-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="row" [class.row--ultra]="ultraCompact()">
      <div class="row__meta">
        <span class="row__number">{{ item().ballotNumber | number: '3.0' }}</span>
        <strong>{{ item().label }}</strong>
      </div>

      <div class="row__controls">
        <button type="button" (click)="decrement.emit(item().key)">-</button>
        <output>{{ item().count }}</output>
        <button type="button" (click)="increment.emit(item().key)">+</button>
      </div>
    </article>
  `,
  styles: [
    `
      .row {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        align-items: stretch;
        padding: 0.65rem 0.75rem;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.82);
        border: 1px solid rgba(16, 72, 89, 0.08);
      }

      .row__meta {
        display: flex;
        align-items: flex-start;
        gap: 0.55rem;
        min-width: 0;
      }

      strong {
        font-size: 0.94rem;
        line-height: 1.2;
        overflow-wrap: anywhere;
      }

      .row__number {
        width: 2.65rem;
        height: 1.9rem;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: #f0dcb0;
        color: #5f3d10;
        flex: 0 0 auto;
        font-size: 0.78rem;
      }

      .row__controls {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.45rem;
        align-self: flex-end;
      }

      @media (min-width: 480px) {
        .row {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        .row__meta {
          align-items: center;
        }
      }

      button {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: 0;
        background: #17475a;
        color: #fff;
        font-size: 1.05rem;
        cursor: pointer;
      }

      output {
        min-width: 2ch;
        text-align: center;
        font-size: 1rem;
        font-weight: 700;
      }

      .row--ultra {
        gap: 0.4rem;
        padding: 0.5rem 0.6rem;
      }

      .row--ultra .row__meta {
        gap: 0.45rem;
      }

      .row--ultra strong {
        font-size: 0.88rem;
      }

      .row--ultra .row__number {
        width: 2.4rem;
        height: 1.75rem;
        font-size: 0.72rem;
      }

      .row--ultra .row__controls {
        gap: 0.35rem;
      }

      .row--ultra button {
        width: 32px;
        height: 32px;
        font-size: 0.95rem;
      }

      .row--ultra output {
        font-size: 0.92rem;
      }
    `,
  ],
})
export class PreferenceRowComponent {
  readonly item = input.required<CounterItem>();
  readonly ultraCompact = input(false);
  readonly increment = output<string>();
  readonly decrement = output<string>();
}
