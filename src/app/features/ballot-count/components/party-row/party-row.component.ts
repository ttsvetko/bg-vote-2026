import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { CounterItem } from '../../../../core/models';

@Component({
  selector: 'app-party-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="row">
      <div class="row__meta">
        <span class="row__number">{{ item().ballotNumber }}</span>
        <div class="row__text">
          <strong>{{ item().label }}</strong>
          @if (item().subtitle) {
            <small>{{ item().subtitle }}</small>
          }
        </div>
      </div>

      <div class="row__controls">
        <button type="button" (click)="decrement.emit(item().key)">-</button>
        <output>{{ item().count }}</output>
        <button type="button" (click)="increment.emit(item().key)">+</button>
      </div>
    </article>
  `,
  styles: `
    .row {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
      padding: 1rem;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid rgba(16, 72, 89, 0.08);
    }

    .row__meta {
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      min-width: 0;
    }

    .row__text {
      display: grid;
      gap: 0.2rem;
      min-width: 0;
    }

    strong {
      overflow-wrap: anywhere;
    }

    small {
      color: #526872;
      overflow-wrap: anywhere;
    }

    .row__number {
      width: 2.2rem;
      height: 2.2rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #104859;
      color: #fff;
      flex: 0 0 auto;
    }

    .row__controls {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
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
      width: 44px;
      height: 44px;
      border-radius: 14px;
      border: 0;
      background: #17475a;
      color: #fff;
      font-size: 1.25rem;
      cursor: pointer;
    }

    output {
      min-width: 2ch;
      text-align: center;
      font-size: 1.1rem;
      font-weight: 700;
    }
  `,
})
export class PartyRowComponent {
  readonly item = input.required<CounterItem>();
  readonly increment = output<string>();
  readonly decrement = output<string>();
}
