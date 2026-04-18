import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { ConfirmDialogConfig } from '../../../core/models';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog">
      <p class="dialog__icon">Внимание</p>
      <h2>{{ data.title }}</h2>
      <p>{{ data.message }}</p>

      <div class="dialog__actions">
        <button type="button" class="dialog__button dialog__button--ghost" (click)="close()">
          {{ data.cancelLabel }}
        </button>
        <button type="button" class="dialog__button dialog__button--danger" (click)="confirm()">
          {{ data.confirmLabel }}
        </button>
      </div>
    </div>
  `,
  styles: `
    .dialog {
      width: min(92vw, 420px);
      background: #fffdf8;
      border-radius: 24px;
      padding: 1.5rem;
      box-shadow: 0 24px 80px rgba(18, 32, 39, 0.24);
      border: 1px solid rgba(18, 32, 39, 0.08);
    }

    .dialog__icon {
      margin: 0 0 0.5rem;
      color: #8a5a1f;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    h2 {
      margin: 0 0 0.75rem;
      font-size: 1.35rem;
    }

    p {
      margin: 0;
      line-height: 1.5;
    }

    .dialog__actions {
      display: grid;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .dialog__button {
      min-height: 44px;
      width: 100%;
      border-radius: 999px;
      padding: 0.75rem 1.1rem;
      border: 0;
      cursor: pointer;
      font: inherit;
    }

    .dialog__button--ghost {
      background: #edf3f5;
      color: #17475a;
    }

    .dialog__button--danger {
      background: #9f1d35;
      color: white;
    }

    @media (min-width: 480px) {
      .dialog__actions {
        display: flex;
        justify-content: end;
      }

      .dialog__button {
        width: auto;
      }
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogConfig>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<string>);

  protected close(): void {
    this.dialogRef.close('cancel');
  }

  protected confirm(): void {
    this.dialogRef.close('confirm');
  }
}
