import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffreStageService } from '../../../services/offre-stage.service';
import { AdminActionService } from '../../../services/admin-action.service';

@Component({
  selector: 'admin-stages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stages.component.html',
  styleUrls: ['./stages.component.scss']
})
export class AdminStagesComponent implements OnInit {
  stages: any[] = [];
  isLoading = true;
  apiError: any = null;

  constructor(
    private offreStageService: OffreStageService,
    private adminActionService: AdminActionService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.offreStageService.getAllOffres().subscribe({
      next: (data) => {
        this.stages = data;
        this.isLoading = false;
        this.apiError = null;
      },
      error: (err) => {
        this.apiError = err;
        this.isLoading = false;
      }
    });
  }

  toggleStage(stage: any) {
    let nouveauStatut = '';
    let actionLabel: 'Activée' | 'Archivée';
    if (stage.statut === 'archivee') {
      // Activer : vérifier la date de fin
      const dateFinStr = stage.date_fin || stage.dateFin;
      let dateFin: Date;
      if (dateFinStr && dateFinStr.includes('/')) {
        const [jour, mois, annee] = dateFinStr.split('/').map(Number);
        dateFin = new Date(annee, mois - 1, jour);
      } else {
        dateFin = new Date(dateFinStr);
      }
      const maintenant = new Date();
      nouveauStatut = dateFin < maintenant ? 'fermee' : 'en_cours';
      actionLabel = 'Activée';
    } else {
      nouveauStatut = 'archivee';
      actionLabel = 'Archivée';
    }
    this.offreStageService.changeStatut(stage.id, nouveauStatut).subscribe({
      next: () => {
        stage.statut = nouveauStatut;
        // Enregistre l'action admin localement
        this.adminActionService.addAction({
          type: 'offre',
          action: actionLabel,
          cible: stage.titre,
          date: new Date().toISOString()
        });
      },
      error: (err) => {
        this.apiError = err;
      }
    });
  }
}

