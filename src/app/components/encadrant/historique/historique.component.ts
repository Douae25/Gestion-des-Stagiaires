import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class HistoriqueComponent {


  historiques = [
    {
      titre: 'Développement Angular',
      nom: 'El Amrani',
      prenom: 'Ahmed',
      email: 'ahmed.elamrani@email.com',
      telephone: '06 12 34 56 78',
      note: 4,
      remarque: 'Stage très satisfaisant, stagiaire motivé et autonome.'
    }
    // Ajoute d'autres objets ici
  ];

  modalRemarqueOuvert = false;
  selectedStage: any = null;

  telechargerRapport(stage: any) {
    // Logique de téléchargement
  }

  ouvrirModalRemarque(stage: any) {
    this.selectedStage = stage;
    this.modalRemarqueOuvert = true;
  }

  fermerModalRemarque() {
    this.modalRemarqueOuvert = false;
    this.selectedStage = null;
  }
}