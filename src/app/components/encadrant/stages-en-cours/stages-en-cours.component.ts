import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stages-en-cours',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './stages-en-cours.component.html',
  styleUrls: ['./stages-en-cours.component.scss']
})
export class StagesEnCoursComponent {
  stages = [
    {
      id: 1,
      titre: "Développement d'une application Angular",
      dureeRestante: "15 jours restants",
      createur: "Sarah RH",
      description: "Ce stage consiste à développer une application Angular moderne pour la gestion des stagiaires.",
      stagiaire: {
        nom: "El Amrani",
        prenom: "Ahmed",
        email: "ahmed.elamrani@email.com",
        telephone: "06 12 34 56 78"
      },
      dateDebut: "01/08/2025",
      dateFin: "30/09/2025",
      rapports: [
        {
          id: 1,
          titre: "Rapport 1 : Cahier des charges",
          commentaires: [
            "Bien structuré.",
            "Ajouter plus de détails sur les besoins."
          ]
        },
        {
          id: 2,
          titre: "Rapport 2 : Conception",
          commentaires: [
            "Diagrammes clairs.",
            "Bonne organisation."
          ]
        }
      ]
    }
    // Ajouter d'autres stages ici
  ];

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
      this.selectedReport.commentaires.push(this.newComment.trim());
      this.newComment = '';
    }
  }
}
