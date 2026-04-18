import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-top5-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="toggle" [class.toggle--ultra]="ultraCompact()" (click)="toggled.emit()">
      {{ showAll() ? 'Покажи само Top 10' : 'Покажи всички партии' }}
    </button>
  `,
  styles: `
    .toggle {
      min-height: 38px;
      width: 100%;
      border: 0;
      border-radius: 999px;
      padding: 0.45rem 0.8rem;
      background: #d8ecee;
      color: #104859;
      font: inherit;
      font-size: 0.92rem;
      cursor: pointer;
    }

    @media (min-width: 768px) {
      .toggle {
        width: auto;
      }
    }

    .toggle--ultra {
      min-height: 34px;
      padding: 0.35rem 0.65rem;
      font-size: 0.84rem;
    }
  `,
})
export class Top5ToggleComponent {
  readonly showAll = input(false);
  readonly ultraCompact = input(false);
  readonly toggled = output<void>();
}
