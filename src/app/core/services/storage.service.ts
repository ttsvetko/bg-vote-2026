import { Injectable } from '@angular/core';

import { CountSession } from '../models';

const STORAGE_KEYS = {
  SESSIONS_V2: 'bpc_sessions_v2',
  SESSIONS_V1: 'bpc_sessions_v1',
  DRAFT_V2: 'bpc_draft_v2',
  DRAFT_V1: 'bpc_draft_v1',
} as const;

@Injectable({ providedIn: 'root' })
export class StorageService {
  saveSessions(sessions: CountSession[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS_V2, JSON.stringify(sessions));
  }

  loadSessions(): CountSession[] {
    const current = this.readSessions(STORAGE_KEYS.SESSIONS_V2);

    if (current.length > 0) {
      return current;
    }

    const legacy = this.readSessions(STORAGE_KEYS.SESSIONS_V1);

    if (legacy.length > 0) {
      this.saveSessions(legacy);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS_V1);
    }

    return legacy;
  }

  saveDraft(session: CountSession): void {
    localStorage.setItem(STORAGE_KEYS.DRAFT_V2, JSON.stringify(session));
  }

  loadDraft(): CountSession | null {
    const current = this.readDraft(STORAGE_KEYS.DRAFT_V2);

    if (current) {
      return current;
    }

    const legacy = this.readDraft(STORAGE_KEYS.DRAFT_V1);

    if (legacy) {
      this.saveDraft(legacy);
      localStorage.removeItem(STORAGE_KEYS.DRAFT_V1);
    }

    return legacy;
  }

  clearDraft(): void {
    localStorage.removeItem(STORAGE_KEYS.DRAFT_V2);
    localStorage.removeItem(STORAGE_KEYS.DRAFT_V1);
  }

  exportAll(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        sessions: this.loadSessions(),
      },
      null,
      2,
    );
  }

  private readSessions(key: string): CountSession[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as CountSession[]) : [];
    } catch {
      return [];
    }
  }

  private readDraft(key: string): CountSession | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as CountSession) : null;
    } catch {
      return null;
    }
  }
}
