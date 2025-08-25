import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { StagiaireService } from '../../../services/stagiaire.service';
import { OffreStageService } from '../../../services/offre-stage.service';
import { UtilisateurService } from '../../../services/utilisateur.service';
import { AdminActionService, AdminAction } from '../../../services/admin-action.service';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-rh-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './rh-dashboard.component.html',
  styleUrls: ['./rh-dashboard.component.scss']
})
export class RhDashboardComponent implements OnInit {
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Nombre de stages par année' }
    }
  };
  barChartType: ChartType = 'bar';
  barChartLabels: string[] = [];
  barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Stages' }
    ]
  };

  constructor(
    private stagiaireService: StagiaireService,
    private offreStageService: OffreStageService,
    private utilisateurService: UtilisateurService,
    private adminActionService: AdminActionService,
    private authService: AuthService
  ) {}

  terminees: any[] = [];
  currentUserEmail: string | null = null;

  ngOnInit() {
    // Récupérer l'utilisateur RH connecté
    const currentUser = this.authService.getCurrentUser();
    this.currentUserEmail = currentUser?.email || null;
    if (currentUser?.id) {
      // Offres à traiter (RH) - comme rh-candidatures
      this.offreStageService.getOffresForTraitement(currentUser.id).subscribe((offres: any[]) => {
        this.stats.offresATraiter = offres.length;
      });

      // Stages en cours et stagiaires actuels - comme rh-stages
      this.stagiaireService.getStagesEnCoursRh(currentUser.id).subscribe((stages: any[]) => {
        this.stats.stagesEnCours = stages.length;
        this.stats.stagiairesActuels = stages.length;
      });

      // Offres en cours
      this.offreStageService.getAllOffresActives().subscribe(offres => {
        this.stats.offresEnCours = offres.length;
      });

      // Encadrants
      this.stagiaireService.getEncadrants().subscribe(encadrants => {
        this.stats.encadrants = encadrants.length;
      });

      // Dernières actions RH (localStorage, filtrées par cible RH)
      this.dernieresActions = this.adminActionService.getActions()
        .filter((a: AdminAction) => a.cible && a.cible.toLowerCase().includes('rh'))
        .map((a: AdminAction) => ({
          action: `${a.type} ${a.action}`,
          utilisateur: a.cible,
          date: a.date
        }));

      // Récupérer les candidatures terminées (comme rh-historique)
      this.stagiaireService.getCandidaturesTerminees().subscribe((terminees: any[]) => {
        this.terminees = terminees;
        // Logique du diagramme Nombre de stages par année basée sur terminees
        const stagesParAnnee: { [annee: string]: number } = {};
        terminees.forEach((c: any) => {
          let yearLabel = 'Année inconnue';
          // Priorité à offre_info.date_debut, fallback sur offre.date_debut
          const dateDebut = c.offre_info?.date_debut || c.offre?.date_debut;
          if (dateDebut) {
            const year = new Date(dateDebut).getFullYear();
            if (!isNaN(year) && year > 1970) {
              yearLabel = year.toString();
            }
          }
          stagesParAnnee[yearLabel] = (stagesParAnnee[yearLabel] || 0) + 1;
        });
        this.diagrammeStagesParAnnee = Object.entries(stagesParAnnee)
          .map(([annee, nombre]) => ({ annee, nombre: Number(nombre) }))
          .sort((a, b) => a.annee.localeCompare(b.annee));
        this.barChartLabels = this.diagrammeStagesParAnnee.map(d => d.annee);
        this.barChartData.labels = this.barChartLabels;
        this.barChartData.datasets[0].data = this.diagrammeStagesParAnnee.map(d => d.nombre);
      });
    }
  }
  stats = {
    stagiairesActuels: 0,
    stagiairesActuelsChange: 0,
    stagesEnCours: 0,
    stagesEnCoursChange: 0,
    offresEnCours: 0,
    offresEnCoursChange: 0,
    offresATraiter: 0,
    encadrants: 0,
    encadrantsChange: 0
  };

  diagrammeStagesParAnnee: Array<{ annee: string; nombre: number }> = [];

  dernieresActions: Array<{
    action: string;
    utilisateur: string;
    date: string;
  }> = [];
}
