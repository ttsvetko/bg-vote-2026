export type CountMode = 'ballots' | 'preferences';
export type CountStatus = 'draft' | 'completed' | 'cancelled';

export interface ElectionMeta {
  id: string;
  label: string;
  date: string;
  threshold: number;
  dataVersion: string;
}

export interface PartyDefinition {
  ballotNumber: number;
  shortName: string;
  fullName: string;
  likelyTop5: boolean;
}

export interface CandidateDefinition {
  preferenceNumber: number;
  name: string;
}

export interface PreferenceListDefinition {
  partyBallotNumber: number;
  partyShortName: string;
  candidates: CandidateDefinition[];
}

export interface CounterItem {
  key: string;
  label: string;
  subtitle?: string;
  ballotNumber: number;
  count: number;
}

export interface CountSession {
  id: string;
  mode: CountMode;
  title: string;
  startedAt: string;
  finishedAt?: string;
  status: CountStatus;
  items: CounterItem[];
  notes?: string;
  electionId: string;
  dataVersion: string;
}

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmAction: string;
  payload?: unknown;
}

export interface UiState {
  showAllParties: boolean;
  confirmDialog: ConfirmDialogConfig | null;
}
