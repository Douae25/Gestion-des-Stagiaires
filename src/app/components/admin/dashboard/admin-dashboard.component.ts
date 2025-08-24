
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffreStageService } from '../../../services/offre-stage.service';
import { UtilisateurService } from '../../../services/utilisateur.service';
import { AdminActionService, AdminAction } from '../../../services/admin-action.service';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    enCours: 0,
    archivee: 0,
    terminee: 0,
    enCoursReel: 0
  };
  lastActions: AdminAction[] = [];
  isLoading = true;
  apiError: any = null;

  constructor(
    private offreStageService: OffreStageService,
    private utilisateurService: UtilisateurService,
    private adminActionService: AdminActionService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.offreStageService.getAllOffres().subscribe({
      next: (offres) => {
        const maintenant = new Date();
        this.stats.enCours = offres.filter(o => o.statut === 'en_cours').length;
        this.stats.archivee = offres.filter(o => o.statut === 'archivee').length;
        this.stats.terminee = offres.filter(o => o.statut === 'fermee' && new Date(o.date_fin) < maintenant).length;
        this.stats.enCoursReel = offres.filter(o => o.statut === 'fermee' && new Date(o.date_debut) < maintenant && new Date(o.date_fin) > maintenant).length;
        // Récupère les vraies dernières actions admin (offres et utilisateurs)
        this.lastActions = this.adminActionService.getActions().slice(0, 5);
        this.isLoading = false;
        this.apiError = null;
      },
      error: (err) => {
        this.apiError = err;
        this.isLoading = false;
      }
    });
  }
}

