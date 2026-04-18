import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import { ElectionMeta, PartyDefinition, PreferenceListDefinition } from '../models';

@Injectable({ providedIn: 'root' })
export class DataLoaderService {
  private readonly http = inject(HttpClient);

  loadAll(): Observable<{
    election: ElectionMeta;
    parties: PartyDefinition[];
    preferenceLists: PreferenceListDefinition[];
  }> {
    return forkJoin({
      election: this.http.get<ElectionMeta>('assets/data/election.json'),
      parties: this.http.get<PartyDefinition[]>('assets/data/parties.json'),
      preferenceLists: this.http.get<PreferenceListDefinition[]>('assets/data/preferences.json'),
    });
  }
}
