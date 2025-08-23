import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CandidatureService } from '../../../services/candidature.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  encadrantName = '';
  nbStagiaires = 0;
  nbStagesEnCours = 0;
  nbStagesTermines = 0;
  nbEvaluationsEnAttente = 0;

  derniersStagesEnCours: any[] = [];
  evaluationsEnAttente: any[] = [];
  timelineActions: any[] = [];

  constructor(
    private authService: AuthService,
    private candidatureService: CandidatureService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) return;
    this.encadrantName = user.nom + ' ' + user.prenom;

    // Stagiaires encadrés
    this.candidatureService.getCandidaturesAcceptees(user.id).subscribe({
      next: (stagiaires: any[]) => {
        this.nbStagiaires = stagiaires.length;
      }
    });

    // Stages en cours
    this.candidatureService.getCandidaturesAcceptees(user.id).subscribe({
      next: (stages: any[]) => {
        const enCours = stages.filter(s => s.statut === 'en_cours');
        this.nbStagesEnCours = enCours.length;
        this.derniersStagesEnCours = enCours.slice(0, 3).map(s => ({
          titre: s.titre,
          stagiaire: s.nom + ' ' + s.prenom,
          dureeRestante: this.getDureeRestante(s.date_fin)
        }));
      }
    });

    // Stages terminés
    this.candidatureService.getCandidaturesEvaluees(user.id).subscribe({
      next: (stages: any[]) => {
        this.nbStagesTermines = stages.length;
      }
    });

    // Evaluations en attente
    this.candidatureService.getRapportsFinaux(user.id).subscribe({
      next: (rapports: any[]) => {
        const enAttente = rapports.filter(r => !r.evaluation);
        this.nbEvaluationsEnAttente = enAttente.length;
        this.evaluationsEnAttente = enAttente.map(r => ({
          stagiaire: r.stagiaire.nom + ' ' + r.stagiaire.prenom,
          stage: r.offre_info?.titre || r.offre?.titre || ''
        }));
      }
    });

    // Timeline (historique)
    this.candidatureService.getCandidaturesEvaluees(user.id).subscribe({
      next: (historiques: any[]) => {
        this.timelineActions = historiques.slice(0, 5).map(h => ({
          icon: 'star',
          type: 'evaluation',
          text: `Évaluation pour ${h.stagiaire?.nom || h.nom || ''} ${h.stagiaire?.prenom || h.prenom || ''} (${h.offre_info?.titre || h.titre || h.offre?.titre || ''})`,
          date: h.dateEvaluation || h.date_fin || ''
        }));
      }
    });
  }

  getDureeRestante(dateFin: string): string {
    if (!dateFin) return '';
    const fin = new Date(dateFin);
    const now = new Date();
    const diff = fin.getTime() - now.getTime();
    if (diff <= 0) return 'Terminé';
    const jours = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (jours > 30) return Math.ceil(jours / 30) + ' mois';
    if (jours > 7) return Math.ceil(jours / 7) + ' semaines';
    return jours + ' jours';
  }

  goToStagesEnCours() {
    this.router.navigate(['/encadrant/stages-en-cours']);
  }

  voirDetailsStage(stage: any) {
    // Show stage details logic here
  }

  ouvrirModalEvaluation(evaluation: any) {
    this.router.navigate(['/encadrant/evaluation']);
  }
}
