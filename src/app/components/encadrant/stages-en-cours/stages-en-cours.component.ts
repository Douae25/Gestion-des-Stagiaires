import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidatureService } from '../../../services/candidature.service';
import { AuthService } from '../../../services/auth.service';
import { EncadrantNavbarComponent } from '../encadrant-navbar.component';

@Component({
  selector: 'app-stages-en-cours',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EncadrantNavbarComponent],
  providers: [CandidatureService, AuthService],
  templateUrl: './stages-en-cours.component.html',
  styleUrls: ['./stages-en-cours.component.scss']
})

export class StagesEnCoursComponent implements OnInit {
  onSearch(query: any) {
    const q = (query || '').toString().trim().toLowerCase();
    this.stages = this.allStages.filter(s =>
      (s.titre && s.titre.toLowerCase().includes(q)) ||
      (s.stagiaire.nom && s.stagiaire.nom.toLowerCase().includes(q)) ||
      (s.stagiaire.prenom && s.stagiaire.prenom.toLowerCase().includes(q))
    );
  }
  allStages: any[] = [];
  stages: any[] = [];
  // (doublons supprimés)

  constructor(
    private candidatureService: CandidatureService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.candidatureService.getCandidaturesAcceptees(user.id).subscribe({
        next: (data: any[]) => {
          this.allStages = data.map((item: any) => ({
            id: item.candidature?.id || item.candidature?.id_candidature,
            titre: item.offre?.titre || item.offre_info?.titre,
            dureeRestante: this.getDureeRestante(item.offre?.date_fin || item.offre_info?.date_fin),
            createur: item.offre?.rh_info ? `${item.offre.rh_info.prenom} ${item.offre.rh_info.nom}` : (item.offre_info?.rh_info ? `${item.offre_info.rh_info.prenom} ${item.offre_info.rh_info.nom}` : 'RH'),
            description: item.offre?.description || item.offre_info?.description,
            stagiaire: {
              nom: item.stagiaire?.nom || item.stagiaire_info?.nom,
              prenom: item.stagiaire?.prenom || item.stagiaire_info?.prenom,
              email: item.stagiaire?.email || item.stagiaire_info?.email,
              telephone: item.stagiaire?.numero_telephone || item.stagiaire_info?.numero_telephone || ''
            },
            dateDebut: item.offre?.date_debut || item.offre_info?.date_debut,
            dateFin: item.offre?.date_fin || item.offre_info?.date_fin,
              rapports: (item.rapports || []).map((r: any) => ({
                id: r.id,
                titre: r.titre,
                document: r.document || r.fichier || '',
                commentaires: Array.isArray(r.commentaires) ? r.commentaires : (r.commentaires ? [r.commentaires] : [])
              }))
          }));
          this.stages = [...this.allStages];
        },
        error: (_err: any) => {
          this.stages = [];
        }
      });
    }
  }

  getDureeRestante(dateFin: string): string {
    const fin = new Date(dateFin);
    const now = new Date();
    const diff = fin.getTime() - now.getTime();
    if (diff <= 0) return 'Terminé';
    const jours = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${jours} jour${jours > 1 ? 's' : ''} restant${jours > 1 ? 's' : ''}`;
  }

  selectedStage: any = null;
  detailsModalOpen = false;
  selectedReport: any = null;
  remarksModalOpen = false;
  newComment: string = '';

  openDetailsModal(stage: any) {
    this.selectedStage = stage;
    this.detailsModalOpen = true;
    this.selectedReport = null;
    this.remarksModalOpen = false;
  }

  closeDetailsModal() {
    this.detailsModalOpen = false;
    this.selectedStage = null;
    this.selectedReport = null;
    this.remarksModalOpen = false;
  }

  openRemarksModal(report: any) {
    this.selectedReport = report;
    this.remarksModalOpen = true;
  }

  closeRemarksModal() {
    this.remarksModalOpen = false;
    this.selectedReport = null;
    this.newComment = '';
  }

  addComment() {
    if (this.newComment.trim() && this.selectedReport) {
      this.candidatureService.addCommentToReport(this.selectedReport.id, this.newComment.trim())
        .subscribe({
          next: (comment) => {
            this.selectedReport.commentaires.push(comment);
            this.newComment = '';
          },
          error: () => {
            // Optionnel : afficher une erreur
          }
        });
    }
  }

  downloadReport(report: any) {
    if (!report.document) return;
    const byteCharacters = atob(report.document);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = (report.titre || 'rapport') + '.pdf';
    link.click();
    window.URL.revokeObjectURL(link.href);
  }
}
