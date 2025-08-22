import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StagesEnCoursComponent } from './stages-en-cours/stages-en-cours.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { HistoriqueComponent } from './historique/historique.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'stages-en-cours', component: StagesEnCoursComponent },
  { path: 'evaluation', component: EvaluationComponent },
  { path: 'historique', component: HistoriqueComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EncadrantRoutingModule {}
