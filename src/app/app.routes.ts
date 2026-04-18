import { Routes } from '@angular/router';

import { dataLoadedGuard } from './core/guards/data-loaded.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((module) => module.DashboardComponent),
  },
  {
    path: 'ballot-count',
    loadComponent: () =>
      import('./features/ballot-count/ballot-count.component').then((module) => module.BallotCountComponent),
    canActivate: [dataLoadedGuard],
  },
  {
    path: 'preference-count',
    loadComponent: () =>
      import('./features/preference-count/preference-count.component').then((module) => module.PreferenceCountComponent),
    canActivate: [dataLoadedGuard],
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./features/session-history/session-history.component').then((module) => module.SessionHistoryComponent),
  },
  {
    path: 'history/:id',
    loadComponent: () =>
      import('./features/session-details/session-details.component').then((module) => module.SessionDetailsComponent),
  },
  { path: '**', redirectTo: '' },
];
