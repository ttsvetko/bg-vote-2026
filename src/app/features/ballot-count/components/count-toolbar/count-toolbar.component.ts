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

      <div class="toolbar__actions">
        <app-undo-bar
          [canUndo]="canUndo()"
          [canRedo]="canRedo()"
          [ultraCompact]="ultraCompact()"
          (undoPressed)="undoPressed.emit()"
          (redoPressed)="redoPressed.emit()"
        />

        @if (showDensityToggle()) {
          <button type="button" class="density" (click)="densityTogglePressed.emit()">
            {{ ultraCompact() ? 'Compact' : 'Ultra-compact' }}
          </button>
        }
      </div>
    </header>
  `,
  styles: `
    .toolbar {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      justify-content: space-between;
    }

    .toolbar__actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
      align-items: center;
    }

    h2 {
      margin: 0 0 0.15rem;
      font-size: clamp(1.2rem, 1.1vw + 0.95rem, 1.7rem);
      line-height: 1.2;
    }

    p {
      margin: 0;
      color: #4d6670;
      font-size: 0.9rem;
    }

    .density {
      min-height: 38px;
      border-radius: 999px;
      border: 0;
      padding: 0.45rem 0.8rem;
      cursor: pointer;
      font: inherit;
      font-size: 0.92rem;
      background: #edf3f5;
      color: #17475a;
      white-space: nowrap;
      max-width: 100%;
    }

    @media (max-width: 360px) {
      .density {
        width: 100%;
        white-space: normal;
      }
    }

    @media (min-width: 420px) {
      .toolbar__actions {
        grid-template-columns: 1fr auto;
      }

      .density {
        justify-self: end;
      }
    }

    @media (min-width: 768px) {
      .toolbar {
        flex-direction: row;
        align-items: end;
      }

      .toolbar__actions {
        grid-template-columns: auto auto;
        justify-content: end;
      }
    }
  `,
})
export class CountToolbarComponent {
  readonly title = input.required<string>();
  readonly startedAt = input.required<string>();
  readonly canUndo = input(false);
  readonly canRedo = input(false);
  readonly ultraCompact = input(false);
  readonly showDensityToggle = input(false);
  readonly undoPressed = output<void>();
  readonly redoPressed = output<void>();
  readonly densityTogglePressed = output<void>();
}
