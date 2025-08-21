import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-rh-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './rh-dashboard.component.html',
  styleUrls: ['./rh-dashboard.component.scss']
})
export class RhDashboardComponent {
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

  ngOnInit() {
    // Exemple de données, à remplacer par un appel API
    const data = [
      { annee: 2021, nombre: 12 },
      { annee: 2022, nombre: 18 },
      { annee: 2023, nombre: 25 },
      { annee: 2024, nombre: 20 }
    ];
  this.barChartLabels = data.map(d => d.annee.toString());
  this.barChartData.labels = this.barChartLabels;
  this.barChartData.datasets[0].data = data.map(d => d.nombre);
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

  diagrammeStagesParAnnee: Array<{ annee: number; nombre: number }> = [];

  dernieresActions: Array<{
    action: string;
    utilisateur: string;
    date: string;
  }> = [];
}
