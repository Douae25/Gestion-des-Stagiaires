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

interface Notification {
  id: number;
  title: string;
  type: 'success' | 'warning' | 'info';
  date: Date;
  read: boolean;
}

interface Candidature {
  id: number;
  statut: 'en_attente' | 'acceptee' | 'refusee' | 'en_cours_evaluation';
  dateCandidature: Date;
  offre?: {
    titre: string;
    entreprise: string;
  };
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
      dateCandidature: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      offre: {
        titre: 'Stage Développement Web',
        entreprise: 'TechCorp'
      }
    },
    {
      id: 2,
      statut: 'en_cours_evaluation',
      dateCandidature: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      offre: {
        titre: 'Stage Marketing Digital',
        entreprise: 'DigitalAgency'
      }
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
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
    // Simulation de données - à remplacer par de vrais appels API
    this.candidaturesCount = this.recentCandidatures.length;
    this.offresCount = 25; // Exemple
    this.newOffresCount = 3; // Exemple
    this.pendingCandidaturesCount = this.recentCandidatures.filter(c => c.statut === 'en_attente').length;
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

  navigateToDocuments(): void {
    this.router.navigate(['/stagiaire/documents']);
  }

  goToProfile(): void {
    this.navigateToProfile();
  }

  // Actions sur les candidatures
  viewCandidature(candidature: Candidature): void {
    this.router.navigate(['/stagiaire/candidatures', candidature.id]);
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

  formatDate(date: Date): string {
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

