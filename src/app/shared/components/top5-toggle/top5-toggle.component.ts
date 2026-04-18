import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-top5-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="toggle" (click)="toggled.emit()">
      {{ showAll() ? 'Покажи само Top 6' : 'Покажи всички партии' }}
    </button>
  `,
  styles: `
    .toggle {
      min-height: 44px;
      width: 100%;
      border: 0;
      border-radius: 999px;
      padding: 0.75rem 1rem;
      background: #d8ecee;
      color: #104859;
      font: inherit;
      cursor: pointer;
    }

    @media (min-width: 768px) {
      .toggle {
        width: auto;
      }
    }
  `,
})
export class Top5ToggleComponent {
  readonly showAll = input(false);
  readonly toggled = output<void>();
}
