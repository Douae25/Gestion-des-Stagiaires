import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { CandidatureService } from '../../../services/candidature.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EncadrantNavbarComponent } from '../encadrant-navbar.component';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, RouterModule, EncadrantNavbarComponent],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class HistoriqueComponent {
  onSearch(query: any) {
    const q = (query || '').toString().trim().toLowerCase();
    this.historiques = this.allHistoriques.filter(h =>
      (h.titre && h.titre.toLowerCase().includes(q)) ||
      (h.nom && h.nom.toLowerCase().includes(q)) ||
      (h.prenom && h.prenom.toLowerCase().includes(q))
    );
  }
  allHistoriques: any[] = [];

  historiques: any[] = [];

  modalRemarqueOuvert = false;
  selectedStage: any = null;
  constructor(
    private candidatureService: CandidatureService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.candidatureService.getCandidaturesEvaluees(user.id).subscribe({
        next: (data: any[]) => {
          this.allHistoriques = data.map(item => ({
            titre: item.offre_info?.titre || item.offre?.titre,
            nom: item.stagiaire?.nom || item.stagiaire_info?.nom,
            prenom: item.stagiaire?.prenom || item.stagiaire_info?.prenom,
            email: item.stagiaire?.email || item.stagiaire_info?.email,
            telephone: item.stagiaire?.numero_telephone || item.stagiaire_info?.numero_telephone,
            note: item.evaluation?.note,
            remarque: item.evaluation?.commentaire,
            rapport: item.rapportFinal // à utiliser pour le téléchargement
          }));
          this.historiques = [...this.allHistoriques];
        },
        error: () => {
          this.historiques = [];
        }
      });
    }
  }

  telechargerRapport(stage: any) {
    const rapport = stage.rapport;
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

  ouvrirModalRemarque(stage: any) {
  this.selectedStage = stage;
  this.modalRemarqueOuvert = true;
  // Le commentaire complet est accessible via stage.remarque
  }

  fermerModalRemarque() {
    this.modalRemarqueOuvert = false;
    this.selectedStage = null;
  }
}