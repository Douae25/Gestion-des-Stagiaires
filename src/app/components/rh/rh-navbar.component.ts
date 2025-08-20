import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { RhSearchService } from '../../services/rh-search.service';

@Component({
  selector: 'app-rh-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rh-navbar.component.html',
  styleUrls: ['./rh-navbar.component.scss']
})
export class RhNavbarComponent implements OnInit {
  @Output() searchQuery = new EventEmitter<string>();
  
  searchTerm: string = '';
  currentUser: User | null = null;
  showProfileMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private rhSearchService: RhSearchService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('🔍 Utilisateur actuel dans navbar:', this.currentUser);
    
    // Si l'utilisateur n'a pas de nom/prénom, tenter de récupérer son profil complet
    if (this.currentUser && (!this.currentUser.nom || !this.currentUser.prenom)) {
      console.log('🔄 Récupération du profil complet de l\'utilisateur...');
      this.authService.getUserProfile().subscribe({
        next: (userProfile) => {
          this.currentUser = userProfile;
          console.log('✅ Profil utilisateur récupéré:', userProfile);
        },
        error: (error) => {
          console.error('❌ Erreur lors de la récupération du profil:', error);
          // Continuer avec les informations existantes
        }
      });
    }
  }

  onSearch(): void {
    console.log('🔍 Recherche effectuée:', this.searchTerm);
    this.rhSearchService.updateSearchQuery(this.searchTerm);
    this.searchQuery.emit(this.searchTerm);
  }

  onSearchInput(): void {
    // Recherche en temps réel pendant la saisie
    this.rhSearchService.updateSearchQuery(this.searchTerm);
    this.searchQuery.emit(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.rhSearchService.clearSearch();
    this.searchQuery.emit('');
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  navigateToProfile(): void {
    console.log('📱 Navigation vers le profil');
    this.closeProfileMenu();
    // TODO: Implémenter la navigation vers le profil
    // this.router.navigate(['/rh/profile']);
  }

  logout(): void {
    console.log('🚪 Déconnexion de l\'utilisateur');
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'RH';
    
    const firstName = this.currentUser.prenom || '';
    const lastName = this.currentUser.nom || '';
    
    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }
    
    return 'RH';
  }

  getUserFullName(): string {
    console.log('🔍 Debug getUserFullName - currentUser:', this.currentUser);
    
    if (!this.currentUser) return 'Utilisateur';
    
    const firstName = this.currentUser.prenom || '';
    const lastName = this.currentUser.nom || '';
    
    console.log('🔍 Debug getUserFullName - prénom:', firstName, 'nom:', lastName);
    
    if (firstName && lastName) {
      console.log('🔍 Retour nom complet:', `${firstName} ${lastName}`);
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      console.log('🔍 Retour prénom seul:', firstName);
      return firstName;
    } else if (lastName) {
      console.log('🔍 Retour nom seul:', lastName);
      return lastName;
    }
    
    // Extraire le nom de l'email en attendant les vraies données
    if (this.currentUser.email) {
      const emailParts = this.currentUser.email.split('@');
      const emailName = emailParts[0];
      // Capitaliser la première lettre
      const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      console.log('🔍 Retour nom depuis email:', displayName);
      return displayName;
    }
    
    console.log('🔍 Retour utilisateur par défaut');
    return 'Utilisateur';
  }

  getUserRole(): string {
    if (!this.currentUser) return 'Ressources Humaines';
    
    // Si l'utilisateur a un rôle défini, l'utiliser
    if (this.currentUser.role) {
      return this.currentUser.role === 'rh' ? 'Ressources Humaines' : this.currentUser.role;
    }
    
    // Sinon, utiliser le rôle par défaut
    return 'Ressources Humaines';
  }
}
