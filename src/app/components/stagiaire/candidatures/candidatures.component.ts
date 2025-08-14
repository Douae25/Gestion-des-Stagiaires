import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';

interface Candidature {
  id: number;
  statut: 'en_attente' | 'acceptee' | 'refusee' | 'en_cours_evaluation';
  dateCandidature: Date;
  offre: {
    id: number;
    titre: string;
    entreprise: string;
    localisation: string;
    type: string;
  };
}

@Component({
  selector: 'app-candidatures',
  templateUrl: './candidatures.component.html',
  styleUrls: ['./candidatures.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ]
})
export class CandidaturesComponent implements OnInit {
  currentUser: User | null = null;
  candidatures: Candidature[] = [];
  loading = false;

  // Données de test
  mockCandidatures: Candidature[] = [
    {
      id: 1,
      statut: 'en_attente',
      dateCandidature: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      offre: {
        id: 1,
        titre: 'Stage Développement Web',
        entreprise: 'TechCorp',
        localisation: 'Paris',
        type: 'Stage'
      }
    },
    {
      id: 2,
      statut: 'en_cours_evaluation',
      dateCandidature: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      offre: {
        id: 2,
        titre: 'Stage Marketing Digital',
        entreprise: 'DigitalAgency',
        localisation: 'Lyon',
        type: 'Stage'
      }
    },
    {
      id: 3,
      statut: 'acceptee',
      dateCandidature: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      offre: {
        id: 3,
        titre: 'Stage Data Science',
        entreprise: 'DataCorp',
        localisation: 'Marseille',
        type: 'Stage'
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
        this.loadCandidatures();
      }
    });
  }

  private loadCandidatures(): void {
    this.loading = true;
    // Simulation de chargement
    setTimeout(() => {
      this.candidatures = this.mockCandidatures;
      this.loading = false;
    }, 1000);
  }

  viewCandidature(candidature: Candidature): void {
    this.router.navigate(['/stagiaire/candidatures', candidature.id]);
  }

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

  goBack(): void {
    this.router.navigate(['/stagiaire/dashboard']);
  }
}
