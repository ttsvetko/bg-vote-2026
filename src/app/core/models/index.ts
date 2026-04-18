export type CountMode = 'ballots' | 'preferences';
export type CountStatus = 'draft' | 'completed' | 'cancelled';
export type UiDensityMode = 'compact' | 'ultra';

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
  likelyTop10: boolean;
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
  partyBallotNumber?: number;
  partyShortName?: string;
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
  /**
   * Optional "protocol total" entered manually by the user.
   * Used to validate whether counted ballots match the expected total.
   */
  totalBallots?: number;
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
  cancelAction?: string;
  cancelPayload?: unknown;
  destructiveAction?: 'confirm' | 'cancel';
}

export interface UiState {
  showAllParties: boolean;
  densityMode: UiDensityMode;
  defaultTotalBallots: number | null;
  totalBallotsModalOpen: boolean;
  totalBallotsModalStartBallotAfterSave: boolean;
  confirmDialog: ConfirmDialogConfig | null;
}
