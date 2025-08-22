import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { CandidatureService } from '../../../services/candidature.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent {
  remarque: string = '';
  stagiaires: any[] = [];
  selectedStagiaire: any = null;

  modalEvaluationOuvert = false;
  note = 0;
  constructor(
    private candidatureService: CandidatureService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.candidatureService.getRapportsFinaux(user.id).subscribe({
        next: (data: any[]) => {
          this.stagiaires = data.map(item => {
            const offre = item.offre_info || item.offre;
            return {
              id: item.stagiaire.id,
              nom: item.stagiaire.nom,
              prenom: item.stagiaire.prenom,
              email: item.stagiaire.email,
              stageTitre: offre.titre,
              stageDescription: offre.description,
              dateDebut: offre.date_debut || offre.dateDebut,
              dateFin: offre.date_fin || offre.dateFin,
              dureeDepuisFin: this.getDureeDepuisFin(offre.date_fin || offre.dateFin),
              rapportFinal: item.rapportFinal
            };
          });
        },
        error: () => {
          this.stagiaires = [];
        }
      });
    }
  }

  getDureeDepuisFin(dateFin: string): string {
    const fin = new Date(dateFin);
    const now = new Date();
    const diff = now.getTime() - fin.getTime();
    if (diff <= 0) return 'Stage en cours';
    const jours = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${jours} jour${jours > 1 ? 's' : ''} depuis la fin`;
  }

  telechargerRapport(stagiaire: any) {
    const rapport = stagiaire.rapportFinal;
    if (!rapport || !rapport.document) return;
    const byteCharacters = atob(rapport.document);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = (rapport.titre || 'rapport-final') + '.pdf';
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  ouvrirModalEvaluation(stagiaire: any) {
  this.remarque = '';
    this.selectedStagiaire = stagiaire;
    this.modalEvaluationOuvert = true;
  }

  fermerModalEvaluation() {
  this.remarque = '';
    this.modalEvaluationOuvert = false;
    this.selectedStagiaire = null;
  }

  survolerEtoile(n: number) {
    this.note = n;
  }

  quitterEtoile() {
    // Optionnel : remettre la note à la valeur précédente
  }

  noter(n: number) {
    this.note = n;
  }

  envoyerEvaluation() {
    if (!this.selectedStagiaire || !this.note) return;
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) return;
    const evaluation = {
      note: this.note,
      commentaire: this.remarque,
      dateEvaluation: new Date().toISOString().slice(0, 10),
      id_utilisateur_encadrant: user.id,
      id_utilisateur_stagiaire: this.selectedStagiaire.id
    };
    this.candidatureService.addEvaluation(evaluation).subscribe({
      next: () => {
        this.fermerModalEvaluation();
        this.ngOnInit(); // Recharge la liste après évaluation
        // Optionnel : afficher un message de succès
      },
      error: () => {
        // Optionnel : afficher un message d'erreur
      }
    });
  }
}