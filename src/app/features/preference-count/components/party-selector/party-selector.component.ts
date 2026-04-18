import { CommonModule } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PartyDefinition } from '../../../../core/models';

@Component({
  selector: 'app-party-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <label class="selector">
      <span>Партия</span>
      <select [(ngModel)]="selectedBallotNumber">
        <option [ngValue]="null">Избери партия</option>
        @for (party of parties(); track party.ballotNumber) {
          <option [ngValue]="party.ballotNumber">{{ party.ballotNumber }} {{ party.shortName }}</option>
        }
      </select>
    </label>

    <button type="button" class="selector__button" [disabled]="selectedBallotNumber() === null" (click)="start.emit(selectedBallotNumber()!)">
      Започни броене на преференции
    </button>
  `,
  styles: `
    .selector {
      display: grid;
      gap: 0.5rem;
      width: 100%;
    }

    span {
      font-weight: 600;
    }

    select,
    .selector__button {
      min-height: 48px;
      width: 100%;
      border-radius: 16px;
      border: 1px solid rgba(16, 72, 89, 0.18);
      font: inherit;
    }

    select {
      padding: 0.75rem 1rem;
      background: #fff;
    }

    .selector__button {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border: 0;
      background: #104859;
      color: #fff;
      cursor: pointer;
    }

    .selector__button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  `,
})
export class PartySelectorComponent {
  readonly parties = input.required<PartyDefinition[]>();
  readonly selectedBallotNumber = model<number | null>(null);
  readonly start = output<number>();
}
