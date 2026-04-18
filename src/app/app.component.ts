import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { Store } from '@ngrx/store';

import { loadReferenceData } from './store/reference-data/reference-data.actions';
import { loadSessionsFromStorage } from './store/session-history/session-history.actions';
import { selectConfirmDialog } from './store/ui/ui.selectors';
import { closeConfirmDialog } from './store/ui/ui.actions';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { restoreDraftSession } from './store/current-session/current-session.actions';
import { StorageService } from './core/services/storage.service';
import { selectCurrentSessionEntity } from './store/current-session/current-session.selectors';

interface DeferredInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, DialogModule],
  template: `
    <div class="shell">
      <header class="shell__header">
        <div>
          <p class="shell__eyebrow">Offline SPA за наблюдатели</p>
          <h1>Паралелно преброяване</h1>
        </div>

        <nav class="shell__nav">
          @if (canInstall()) {
            <button type="button" (click)="installApp()">Инсталирай приложението</button>
          }
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Табло</a>
          <a routerLink="/history" routerLinkActive="active">История</a>
        </nav>
      </header>

      <main class="shell__content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(255, 224, 178, 0.5), transparent 30%),
        linear-gradient(180deg, #f7f4ea 0%, #eef3f3 100%);
      color: #122027;
      font-family: "Segoe UI", sans-serif;
    }

    .shell {
      min-height: 100vh;
      padding:
        max(0.9rem, env(safe-area-inset-top))
        max(0.9rem, env(safe-area-inset-right))
        max(1rem, env(safe-area-inset-bottom))
        max(0.9rem, env(safe-area-inset-left));
    }

    .shell__header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 1100px;
      margin: 0 auto;
      padding: 1rem 0 1.5rem;
    }

    .shell__eyebrow {
      margin: 0 0 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.72rem;
      color: #8a5a1f;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.8rem, 2.2vw + 1rem, 3rem);
    }

    .shell__nav {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
      width: 100%;
    }

    .shell__nav a,
    .shell__nav button {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.7rem 1rem;
      border-radius: 999px;
      text-decoration: none;
      color: #1a3a46;
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(26, 58, 70, 0.12);
      font: inherit;
      cursor: pointer;
    }

    .shell__nav a.active {
      background: #104859;
      color: #fff;
    }

    .shell__content {
      max-width: 1100px;
      margin: 0 auto;
      padding-bottom: 2rem;
    }

    @media (min-width: 768px) {
      .shell {
        padding: 1.5rem 2rem 2rem;
      }

      .shell__header {
        flex-direction: row;
        justify-content: space-between;
        align-items: end;
      }

      .shell__nav {
        display: inline-flex;
        width: auto;
      }
    }
  `,
})
export class AppComponent {
  private readonly store = inject(Store);
  private readonly dialog = inject(Dialog);
  private readonly storage = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);
  private dialogRef: { close: () => void } | null = null;
  private deferredInstallPrompt: DeferredInstallPromptEvent | null = null;

  private readonly confirmDialog = this.store.selectSignal(selectConfirmDialog);
  private readonly currentSession = this.store.selectSignal(selectCurrentSessionEntity);
  private readonly installPromptReady = signal(false);
  private readonly isStandalone = signal(this.detectStandaloneMode());
  protected readonly canInstall = computed(() => this.installPromptReady() && !this.isStandalone());

  constructor() {
    this.store.dispatch(loadReferenceData());
    this.store.dispatch(loadSessionsFromStorage());
    this.store.dispatch(restoreDraftSession({ session: this.storage.loadDraft() }));

    effect(() => {
      const config = this.confirmDialog();

      if (!config) {
        this.dialogRef?.close();
        this.dialogRef = null;
        return;
      }

      if (this.dialogRef) {
        return;
      }

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        disableClose: true,
        data: config,
      });

      this.dialogRef = dialogRef;

      const subscription = dialogRef.closed.subscribe((result) => {
        this.dialogRef = null;
        this.store.dispatch(closeConfirmDialog());

        if (result === 'confirm') {
          const payload =
            config.payload && typeof config.payload === 'object' && !Array.isArray(config.payload)
              ? config.payload
              : {};

          this.store.dispatch({
            type: config.confirmAction,
            ...(payload as Record<string, unknown>),
          });
        }
      });

      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    const session = this.currentSession();

    if (!session || session.status !== 'draft') {
      return;
    }

    this.storage.saveDraft(session);

    if (!this.isCountRoute(window.location.pathname)) {
      return;
    }

    event.preventDefault();
    event.returnValue = '';
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  protected onBeforeInstallPrompt(event: Event): void {
    const promptEvent = event as DeferredInstallPromptEvent;
    promptEvent.preventDefault();
    this.deferredInstallPrompt = promptEvent;
    this.installPromptReady.set(true);
  }

  @HostListener('window:appinstalled')
  protected onAppInstalled(): void {
    this.deferredInstallPrompt = null;
    this.installPromptReady.set(false);
    this.isStandalone.set(true);
  }

  protected async installApp(): Promise<void> {
    if (!this.deferredInstallPrompt) {
      return;
    }

    await this.deferredInstallPrompt.prompt();
    await this.deferredInstallPrompt.userChoice;
    this.deferredInstallPrompt = null;
    this.installPromptReady.set(false);
    this.isStandalone.set(this.detectStandaloneMode());
  }

  private isCountRoute(pathname: string): boolean {
    return pathname.endsWith('/ballot-count') || pathname.endsWith('/preference-count');
  }

  private detectStandaloneMode(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  }
}
