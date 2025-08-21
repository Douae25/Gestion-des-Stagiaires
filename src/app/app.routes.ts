import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Route par défaut - Landing page
  {
    path: '',
    loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent)
  },

  // Route pour toutes les offres (accessible à tous)
  {
    path: 'offres',
    loadComponent: () => import('./components/offres/offres.component').then(m => m.OffresComponent)
  },

  // Routes d'authentification (accès aux visiteurs non connectés)
  {
    path: 'login',
    loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent),
    canActivate: [GuestGuard]
  },

  {
    path: 'auth',
    loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent),
    canActivate: [GuestGuard]
  },

  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [GuestGuard]
  },

  {
    path: 'inscription',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [GuestGuard]
  },

  // Page d'accès non autorisé
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // Routes pour les stagiaires
  {
    path: 'stagiaire',
    canActivate: [RoleGuard],
    data: { role: 'stagiaire' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/stagiaire/dashboard/stagiaire-dashboard.component').then(m => m.StagiaireDashboardComponent)
      },
      {
        path: 'candidatures',
        loadComponent: () => import('./components/stagiaire/candidatures/candidatures.component').then(m => m.CandidaturesComponent)
      },
      {
        path: 'candidatures/:id',
        loadComponent: () => import('./components/stagiaire/candidature-detail/candidature-detail.component').then(m => m.CandidatureDetailComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/stagiaire/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'mes-stages',
        loadComponent: () => import('./components/stagiaire/mes-stages/mes-stages.component').then(m => m.MesStagesComponent)
      },
    ]
  },

  // Routes pour les RH
  {
    path: 'rh',
    canActivate: [RoleGuard],
    data: { role: 'rh' },
    loadComponent: () => import('./components/rh/rh-main.component').then(m => m.RhMainComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
   {
  path: 'dashboard',
  loadComponent: () =>
    import('./components/rh/dashboard/rh-dashboard.component')
      .then(m => m.RhDashboardComponent)
},
      {
        path: 'offres',
        loadComponent: () => import('./components/rh/offres/rh-offres.component').then(m => m.RhOffresComponent)
      },
      {
        path: 'candidatures',
        loadComponent: () => import('./components/rh/candidatures/rh-candidatures.component').then(m => m.RhCandidaturesComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./components/rh/documents/rh-documents.component').then(m => m.RhDocumentsComponent)
      },
      {
        path: 'stages',
        loadComponent: () => import('./components/rh/stages/rh-stages.component').then(m => m.RhStagesComponent)
      },
      {
        path: 'stages/details/:id',
        loadComponent: () => import('../app/components/rh/stages/rh-stages-details.component').then(m => m.RhStagesDetailsComponent)
      },
      {
        path: 'historique',
        loadComponent: () => import('./components/rh/historique/rh-historique.component').then(m => m.RhHistoriqueComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/rh/profile/rh-profile.component').then(m => m.RhProfileComponent)
      }
    ]
  },

  // Routes pour les administrateurs
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      }
    ]
  },

  // Routes pour les encadrants
  {
    path: 'encadrant',
    canActivate: [RoleGuard],
    data: { role: 'encadrant' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/encadrant/dashboard/encadrant-dashboard.component').then(m => m.EncadrantDashboardComponent)
      }
    ]
  },

  // Route de fallback - Page 404
  {
    path: '**',
    redirectTo: ''
  }
];
