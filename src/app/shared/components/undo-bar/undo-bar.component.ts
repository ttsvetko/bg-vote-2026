import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-undo-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="undo-bar">
      <button type="button" [disabled]="!canUndo()" (click)="undoPressed.emit()">↩ Undo</button>
      <button type="button" [disabled]="!canRedo()" (click)="redoPressed.emit()">↺ Redo</button>
    </div>
  `,
  styles: `
    .undo-bar {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
      width: 100%;
    }

    button {
      min-height: 44px;
      border-radius: 999px;
      border: 1px solid rgba(16, 72, 89, 0.14);
      background: #fff;
      color: #17475a;
      padding: 0.75rem 1rem;
      cursor: pointer;
      font: inherit;
    }

    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    @media (min-width: 768px) {
      .undo-bar {
        display: inline-flex;
        width: auto;
      }
    }
  `,
})
export class UndoBarComponent {
  readonly canUndo = input(false);
  readonly canRedo = input(false);
  readonly undoPressed = output<void>();
  readonly redoPressed = output<void>();
}
