import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserTypePipe } from './user-type.pipe';
import { UtilisateurService } from '../../../services/utilisateur.service';
import { AdminActionService } from '../../../services/admin-action.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserTypePipe, HttpClientModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  get passwordMismatch(): boolean {
    return (
      this.newUser.mot_de_passe &&
      this.newUser.confirm_mot_de_passe &&
      this.newUser.mot_de_passe !== this.newUser.confirm_mot_de_passe
    );
  }
  selectedType: 'stagiaire' | 'encadrant' | 'rh' = 'stagiaire';
  users: any[] = [];
  apiError: any = null;
  showAddUserModal = false;
  hidePassword = true;
  hideConfirmPassword = true;
  newUser: any = {
    nom: '',
    prenom: '',
    email: '',
    numero_telephone: '',
    mot_de_passe: '',
    confirm_mot_de_passe: '',
    type: 'stagiaire',
    niveau_etude: '',
    etablissement: '',
    departement: ''
  };

  constructor(private utilisateurService: UtilisateurService, private adminActionService: AdminActionService) {}
  submitAddUser() {
    // Construction du payload selon le type
    let payload: any = {
      nom: this.newUser.nom,
      prenom: this.newUser.prenom,
      email: this.newUser.email,
      numero_telephone: this.newUser.numero_telephone,
      mot_de_passe: this.newUser.mot_de_passe,
      type: this.newUser.type
    };
    if (this.newUser.type === 'stagiaire') {
      payload.stagiaire_info = {
        niveau_etude: this.newUser.niveau_etude,
        etablissement: this.newUser.etablissement
      };
    }
    if (this.newUser.type === 'encadrant') {
      payload.encadrant_info = {
        departement: this.newUser.departement
      };
    }
    // Appel API POST
    this.utilisateurService.createUtilisateur(payload).subscribe({
      next: (createdUser) => {
        this.users.push(createdUser);
        this.apiError = null;
        this.showAddUserModal = false;
        this.newUser = {
          nom: '',
          prenom: '',
          email: '',
          numero_telephone: '',
          mot_de_passe: '',
          confirm_mot_de_passe: '',
          type: 'stagiaire',
          niveau_etude: '',
          etablissement: '',
          departement: ''
        };
      },
      error: (err) => {
        this.apiError = err;
      }
    });
  }

  ngOnInit(): void {
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (data) => {
        this.users = data;
        this.apiError = null;
      },
      error: (err) => {
        this.apiError = err;
        console.error('Erreur lors de la récupération des utilisateurs:', err);
      }
    });
  }

  toggleUser(user: any) {
    const nouveauStatut = user.statut === 'active' ? 'archive' : 'active';
    this.utilisateurService.updateStatut(user.id_utilisateur, nouveauStatut).subscribe({
      next: () => {
        user.statut = nouveauStatut;
        // Enregistre l'action admin localement
        this.adminActionService.addAction({
          type: 'utilisateur',
          action: nouveauStatut === 'active' ? 'Activée' : 'Archivée',
          cible: user.nom + ' ' + user.prenom,
          date: new Date().toISOString()
        });
      },
      error: (err) => {
        this.apiError = err;
        console.error('Erreur lors de la mise à jour du statut:', err);
      }
    });
  }
}
