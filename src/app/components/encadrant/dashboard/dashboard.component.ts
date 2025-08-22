import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  encadrantName = 'Dr. Ahmed Benali';
  nbStagiaires = 12;
  nbStagesEnCours = 3;
  nbStagesTermines = 9;
  nbEvaluationsEnAttente = 2;

  derniersStagesEnCours = [
    { titre: 'Développement d’une API REST', stagiaire: 'Sara El Amrani', dureeRestante: '2 semaines' },
    { titre: 'Refonte UI Dashboard', stagiaire: 'Yassine Bouzid', dureeRestante: '1 semaine' },
    { titre: 'Automatisation des tests', stagiaire: 'Imane Kabbaj', dureeRestante: '5 jours' }
  ];

  evaluationsEnAttente = [
    { stagiaire: 'Sara El Amrani', stage: 'API REST' },
    { stagiaire: 'Imane Kabbaj', stage: 'Automatisation des tests' }
  ];

  timelineActions = [
    { icon: 'description', type: 'rapport', text: 'Ahmed a soumis un rapport', date: '21 août 2025' },
    { icon: 'comment', type: 'remarque', text: 'Vous avez ajouté une remarque', date: '20 août 2025' },
    { icon: 'star', type: 'evaluation', text: 'Évaluation complétée pour Yassine', date: '18 août 2025' }
  ];

  goToStagesEnCours() {
    // Navigation logic here
  }

  voirDetailsStage(stage: any) {
    // Show stage details logic here
  }

  ouvrirModalEvaluation(evaluation: any) {
    // Open evaluation modal logic here
  }
}
