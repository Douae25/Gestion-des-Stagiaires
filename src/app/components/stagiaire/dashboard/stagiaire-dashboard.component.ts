import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { StagiaireService, Candidature, StagiaireProfile } from '../../../services/stagiaire.service';

interface Notification {
  id: number;
  title: string;
  type: 'success' | 'warning' | 'info';
  date: Date;
  read: boolean;
}

@Component({
  selector: 'app-stagiaire-dashboard',
  templateUrl: './stagiaire-dashboard.component.html',
  styleUrls: ['./stagiaire-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatToolbarModule,
    MatMenuModule,
    MatBadgeModule,
    MatChipsModule,
    MatDividerModule
  ]
})
export class StagiaireDashboardComponent implements OnInit {
  currentUser: User | null = null;
  
  // Données du dashboard
  candidaturesCount = 0;
  offresCount = 0;
  newOffresCount = 0;
  pendingCandidaturesCount = 0;
  activeStagesCount = 0;
  notificationCount = 0;
  
  // Notifications
  notifications: Notification[] = [
    {
      id: 1,
      title: 'Nouvelle offre correspondant à votre profil',
      type: 'info',
      date: new Date(),
      read: false
    },
    {
      id: 2,
      title: 'Candidature acceptée chez TechCorp',
      type: 'success',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: false
    }
  ];
  
  // Candidatures récentes
  recentCandidatures: Candidature[] = [
    {
      id: 1,
      statut: 'en_attente',
      date_soumission: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      id_offre: 1,
      id_stagiaire: 1,
      offre_info: {
        id: 1,
        id_rh: 1,
        titre: 'Stage Développement Web',
        description: 'Développement d\'applications web',
        date_debut: '2024-09-01',
        date_fin: '2025-02-28',
        duree: 6,
        statut: 'en_cours',
        localisation: 'Paris',
        competence_requise: 'React, Node.js'
      }
    },
    {
      id: 2,
      statut: 'en_attente',
      date_soumission: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      id_offre: 2,
      id_stagiaire: 1,
      offre_info: {
        id: 2,
        id_rh: 2,
        titre: 'Stage Marketing Digital',
        description: 'Stratégies marketing digitales',
        date_debut: '2024-10-01',
        date_fin: '2025-03-31',
        duree: 6,
        statut: 'en_cours',
        localisation: 'Lyon',
        competence_requise: 'SEO, Analytics'
      }
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private stagiaireService: StagiaireService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user || user.role !== 'stagiaire') {
        this.router.navigate(['/login']);
      } else {
        this.loadDashboardData();
      }
    });
    
    this.updateNotificationCount();
  }

  private loadDashboardData(): void {
    // Charger les candidatures réelles depuis l'API
    this.stagiaireService.getCandidatures(1, 5).subscribe({
      next: (response: Candidature[]) => {
        this.recentCandidatures = response || [];
        this.candidaturesCount = this.recentCandidatures.length;
        this.pendingCandidaturesCount = this.recentCandidatures.filter(c => c.statut === 'en_attente').length;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des candidatures:', error);
        // Garder les données de test en cas d'erreur
        this.candidaturesCount = this.recentCandidatures.length;
        this.pendingCandidaturesCount = this.recentCandidatures.filter(c => c.statut === 'en_attente').length;
      }
    });

    // Charger les stages actifs (candidatures acceptées)
    this.stagiaireService.getCandidaturesAcceptees().subscribe({
      next: (candidatures) => {
        // Les candidatures acceptées deviennent des stages actifs
        this.activeStagesCount = candidatures.length;
        console.log('Stages actifs (candidatures acceptées):', this.activeStagesCount);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stages:', error);
        this.activeStagesCount = 0;
      }
    });

    // Simulation pour les autres données - à remplacer par de vrais appels API
    this.offresCount = 25; // Exemple
    this.newOffresCount = 3; // Exemple
  }

  private updateNotificationCount(): void {
    this.notificationCount = this.notifications.filter(n => !n.read).length;
  }

  // Actions de navigation
  navigateToOffres(): void {
    this.router.navigate(['/offres']);
  }

  navigateToCandidatures(): void {
    this.router.navigate(['/stagiaire/candidatures']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/stagiaire/profile']);
  }

  navigateToStages(): void {
    this.router.navigate(['/stagiaire/mes-stages']);
  }

  goToProfile(): void {
    this.navigateToProfile();
  }

  // Actions sur les candidatures
  viewCandidature(candidature: Candidature): void {
    // Passer les données de la candidature via l'état de navigation
    this.router.navigate(['/stagiaire/candidatures', candidature.id], {
      state: { candidature: candidature }
    });
  }

  // Gestion des notifications
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.updateNotificationCount();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  formatNotificationTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  }

  // Gestion des statuts
  getStatusColor(statut: string): 'primary' | 'accent' | 'warn' {
    switch (statut) {
      case 'acceptee': return 'primary';
      case 'en_cours_evaluation': return 'accent';
      case 'refusee': return 'warn';
      default: return 'accent';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'acceptee': return 'Acceptée';
      case 'refusee': return 'Refusée';
      case 'en_cours_evaluation': return 'En évaluation';
      default: return statut;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  logout(): void {
    this.authService.logout();
  }

  goToLanding(): void {
    this.router.navigate(['/']);
  }
}

