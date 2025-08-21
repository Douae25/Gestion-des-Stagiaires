import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../../services/auth.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-rh-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rh-profile.component.html',
  styleUrls: ['./rh-profile.component.scss']
})
export class RhProfileComponent implements OnInit {
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  showMessage(msg: string, type: 'success' | 'error' = 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3500);
  }
  // Ajoute les propriétés pour l'édition
  nom: string = '';
  prenom: string = '';
  numero_telephone: string = '';
  email: string = '';
  role: string = 'rh';


  saveProfile() {
    if (typeof this.nom !== 'string' || this.nom.trim().length === 0) {
      this.showMessage('Le nom est obligatoire.', 'error');
      return;
    }
    if (typeof this.password !== 'string' || this.password.trim().length === 0) {
      this.showMessage('Le mot de passe est obligatoire.', 'error');
      return;
    }
    const current = this.authService.getCurrentUser();
    if (!current || !current.id) {
      this.showMessage('Utilisateur non authentifié.', 'error');
      return;
    }
    const token = this.authService.getToken();
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const body = {
      nom: this.nom,
      prenom: this.prenom,
      numero_telephone: this.numero_telephone,
      mot_de_passe: this.password,
      type: this.role,
      email: this.email
    };
    this.http.put<User>(`/api/utilisateurs/${current.id}`, body, headers).subscribe({
      next: (data) => {
        this.showMessage('Profil mis à jour avec succès !', 'success');
        this.editMode = false;
        // Rafraîchit les infos du profil avec une nouvelle requête GET
        this.http.get<User>(`/api/utilisateurs/${current.id}`, headers).subscribe({
          next: (userData) => {
            this.user = userData;
            this.nom = userData.nom || '';
            this.prenom = userData.prenom || '';
            this.numero_telephone = userData.numero_telephone || '';
            this.email = userData.email || '';
            this.role = userData.role || 'rh';
            this.password = '';
          },
          error: () => {
            this.showMessage('Erreur lors du rafraîchissement du profil.', 'error');
          }
        });
      },
      error: (err) => {
        this.showMessage('Erreur lors de la mise à jour du profil.', 'error');
      }
    });
  }
  password: string = '';
  editMode = false;

  toggleEditMode() {
    if (this.editMode) {
      this.saveProfile();
    } else {
      this.editMode = true;
    }
  }
  user: User | null = null;

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    const current = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    if (current?.id) {
      this.http.get<User>(`/api/utilisateurs/${current.id}`, headers).subscribe({
        next: (data) => {
          this.user = data;
          this.nom = data.nom || '';
          this.prenom = data.prenom || '';
          this.numero_telephone = data.numero_telephone || '';
          this.email = data.email || '';
          this.role = data.role || 'rh';
        },
        error: (err) => {
          this.user = current;
        }
      });
    } else {
      this.user = current;
    }
  }
}
