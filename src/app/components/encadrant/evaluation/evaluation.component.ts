import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent {
  stagiaires = [
    {
      stageTitre: 'Développement d\'une application Angular',
      dureeDepuisFin: '2 jours depuis la fin',
      nom: 'El Amrani',
      prenom: 'Ahmed'
    }
    // Ajoute d'autres stagiaires ici
  ];

  modalEvaluationOuvert = false;
  note = 0;

  telechargerRapport(stagiaire: any) {
    // Logique de téléchargement
  }

  ouvrirModalEvaluation(stagiaire: any) {
    this.modalEvaluationOuvert = true;
    // Logique pour sélectionner le stagiaire si besoin
  }

  fermerModalEvaluation() {
    this.modalEvaluationOuvert = false;
  }

  survolerEtoile(n: number) {
    this.note = n;
  }

  quitterEtoile() {
    // Optionnel : remettre la note à la valeur précédente
  }

  noter(n: number) {
    this.note = n;
  }
}