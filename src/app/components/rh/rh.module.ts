import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RhMainComponent } from './rh-main.component';
import { RhSidebarComponent } from './rh-sidebar.component';
import { RhDashboardComponent } from './dashboard/rh-dashboard.component';
import { RhOffresComponent } from './offres/rh-offres.component';
import { RhCandidaturesComponent } from './candidatures/rh-candidatures.component';
import { RhStagesComponent } from './stages/rh-stages.component';
import { RhHistoriqueComponent } from './historique/rh-historique.component';
import { RhProfileComponent } from './profile/rh-profile.component';

@NgModule({
  declarations: [
    RhMainComponent,
    RhSidebarComponent,
    RhDashboardComponent,
    RhOffresComponent,
    RhCandidaturesComponent,
    RhStagesComponent,
    RhHistoriqueComponent,
    RhProfileComponent
  ],
    imports: [
      CommonModule,
      FormsModule,
      RouterModule
  ],
  exports: [
    RhMainComponent
  ]
})
export class RhModule {}
