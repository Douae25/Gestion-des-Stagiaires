import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Route par défaut - Landing page
  {
    path: '',
    loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent)
  },

  // Route pour toutes les offres (protégée par authentification)
  {
    path: 'offres',
    loadComponent: () => import('./components/offres/offres.component').then(m => m.OffresComponent),
    canActivate: [AuthGuard]
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
        path: 'documents',
        loadComponent: () => import('./components/stagiaire/documents/documents.component').then(m => m.DocumentsComponent)
      }
    ]
  },

  // Routes pour les RH
  {
    path: 'rh',
    canActivate: [RoleGuard],
    data: { role: 'rh' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/rh/dashboard/rh-dashboard.component').then(m => m.RhDashboardComponent)
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
