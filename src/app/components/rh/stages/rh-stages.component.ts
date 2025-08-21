import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rh-stages',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rh-stages.component.html',
  styleUrls: ['./rh-stages.component.scss']
})
export class RhStagesComponent implements OnInit {
  constructor(private authService: AuthService) {}
  stages: any[] = [];
  loading = true;

  calcDaysLeft(dateFin: string): number {
    const today = new Date();
    const end = new Date(dateFin);
    const diff = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  ngOnInit() {
    const token = this.authService.getToken();
    console.log('Token utilisé pour l\'API:', token);
    console.log('Chargement des stages en cours...');
    const apiUrl = '/api/candidatures/en-cours/mes';
    console.log('Appel API:', apiUrl);
    fetch(apiUrl, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
      .then(res => {
        console.log('Réponse brute:', res);
        console.log('Statut HTTP:', res.status);
        return res.text();
      })
      .then(text => {
        console.log('Texte brut reçu:', text);
        let data = [];
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Erreur de parsing JSON:', e);
        }
        console.log('Stages chargés:', data);
        this.stages = data;
        this.loading = false;
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des stages:', err);
        this.loading = false;
      });
  }

  onDetailsClick(stage: any) {
    console.log('Navigation vers les détails du stage:', stage);
  }
}
