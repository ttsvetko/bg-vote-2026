import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { UndoBarComponent } from '../../../../shared/components/undo-bar/undo-bar.component';
import { FormatTimestampPipe } from '../../../../shared/pipes/format-timestamp.pipe';

@Component({
  selector: 'app-count-toolbar',
  standalone: true,
  imports: [CommonModule, UndoBarComponent, FormatTimestampPipe],
  template: `
    <header class="toolbar">
      <div>
        <h2>{{ title() }}</h2>
        <p>Старт: {{ startedAt() | formatTimestamp }}</p>
      </div>

      <app-undo-bar
        [canUndo]="canUndo()"
        [canRedo]="canRedo()"
        (undoPressed)="undoPressed.emit()"
        (redoPressed)="redoPressed.emit()"
      />
    </header>
  `,
  styles: `
    .toolbar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: space-between;
    }

    h2 {
      margin: 0 0 0.35rem;
      font-size: clamp(1.5rem, 2vw + 1rem, 2.25rem);
    }

    p {
      margin: 0;
      color: #4d6670;
    }

    @media (min-width: 768px) {
      .toolbar {
        flex-direction: row;
        align-items: start;
      }
    }
  `,
})
export class CountToolbarComponent {
  readonly title = input.required<string>();
  readonly startedAt = input.required<string>();
  readonly canUndo = input(false);
  readonly canRedo = input(false);
  readonly undoPressed = output<void>();
  readonly redoPressed = output<void>();
}
