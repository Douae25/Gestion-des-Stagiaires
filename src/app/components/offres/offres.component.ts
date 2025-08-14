import { Component, OnInit } from '@angular/core';
import { OffreStageService } from '../../services/offre-stage.service';
import { OffreStage } from '../../models/offre-stage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-offres',
  templateUrl: './offres.component.html',
  styleUrls: ['./offres.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class OffresComponent implements OnInit {
  offres: OffreStage[] = [];
  offresFiltrees: OffreStage[] = [];
  loading = false;
  error: string | null = null;
  currentUser: User | null = null;
  isAuthenticated = false;

  // Propriétés pour le filtrage et tri
  viewMode: 'grid' | 'list' = 'grid';
  selectedLocation: string = 'all';
  sortBy: 'date' | 'title' | 'duration' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  showFilters: boolean = false;

  locationOptions: { value: string; label: string }[] = [];
  sortOptions = [
    { value: 'date', label: 'Date de début' },
    { value: 'title', label: 'Titre' },
    { value: 'duration', label: 'Durée' }
  ];

  constructor(
    private offreStageService: OffreStageService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Vérifier l'authentification
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      
      if (!this.isAuthenticated) {
        // Rediriger vers la page de connexion avec returnUrl
        this.snackBar.open('Vous devez vous connecter pour accéder aux offres', 'Se connecter', {
          duration: 5000,
          panelClass: ['warning-snackbar']
        }).onAction().subscribe(() => {
          this.router.navigate(['/login'], { queryParams: { returnUrl: '/offres' } });
        });
        return;
      }
    });
    
    this.loadAllOffres();
    // Charger la préférence de vue depuis le localStorage
    const savedViewMode = localStorage.getItem('offres-view-mode');
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      this.viewMode = savedViewMode;
    }
  }

  loadAllOffres(): void {
    this.loading = true;
    this.error = null;
    
    console.log('Chargement de toutes les offres...');
    
    this.offreStageService.getAllOffres().subscribe({
      next: (offres) => {
        console.log('Toutes les offres chargées avec succès:', offres);
        this.offres = offres;
        this.initializeFilters();
        this.applyFiltersAndSort();
        this.loading = false;
        
        if (offres.length === 0) {
          console.log('Aucune offre trouvée');
          this.snackBar.open('Aucune offre disponible pour le moment', 'Fermer', {
            duration: 5000,
            panelClass: ['info-snackbar']
          });
        } else {
          this.snackBar.open(`${offres.length} offre(s) chargée(s) avec succès`, 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des offres:', error);
        
        this.error = error.message || 'Impossible de charger les offres';
        this.loading = false;
        
        this.snackBar.open('Erreur lors du chargement des offres', 'Fermer', {
          duration: 10000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Initialiser les options de filtrage
  initializeFilters(): void {
    // Créer les options de localisation
    const locations = [...new Set(this.offres.map(offre => offre.localisation))];
    this.locationOptions = [
      { value: 'all', label: 'Toutes les localisations' },
      ...locations.map(location => ({ value: location, label: location }))
    ];
  }

  // Appliquer les filtres et le tri
  applyFiltersAndSort(): void {
    let filtered = [...this.offres];

    // Filtrage par localisation
    if (this.selectedLocation !== 'all') {
      filtered = filtered.filter(offre => offre.localisation === this.selectedLocation);
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'date':
          comparison = new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime();
          break;
        case 'title':
          comparison = a.titre.localeCompare(b.titre);
          break;
        case 'duration':
          comparison = a.duree - b.duree;
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.offresFiltrees = filtered;
  }

  // Changer le mode de vue
  changeViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    // Sauvegarder la préférence dans le localStorage
    localStorage.setItem('offres-view-mode', mode);
  }

  // Changer le filtre de localisation
  changeLocationFilter(location: string): void {
    this.selectedLocation = location;
    this.applyFiltersAndSort();
  }

  // Méthode alternative pour changer le tri sans problème de typage
  handleSortChange(sortValue: string): void {
    const validSortValues: ('date' | 'title' | 'duration')[] = ['date', 'title', 'duration'];
    
    if (validSortValues.includes(sortValue as 'date' | 'title' | 'duration')) {
      const typedSortValue = sortValue as 'date' | 'title' | 'duration';
      
      if (this.sortBy === typedSortValue) {
        // Si c'est le même tri, inverser l'ordre
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // Nouveau tri, commencer par ordre descendant
        this.sortBy = typedSortValue;
        this.sortOrder = 'desc';
      }
      
      this.applyFiltersAndSort();
    }
  }

  // Réinitialiser tous les filtres
  resetFilters(): void {
    this.selectedLocation = 'all';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.applyFiltersAndSort();
    
    this.snackBar.open('Filtres réinitialisés', 'Fermer', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  retourAccueil(): void {
    this.router.navigate(['/']);
  }

  // Méthodes pour les filtres avancés

  // Méthode pour obtenir l'icône appropriée selon la localisation
  getLocationIcon(location: string): string {
    if (location === 'all') return 'public';
    
    // Mapper les localisations avec des icônes appropriées
    const locationIcons: { [key: string]: string } = {
      'Rabat': 'location_city',
      'Casablanca': 'business',
      'Marrakech': 'terrain',
      'Fès': 'account_balance',
      'Tanger': 'sailing',
      'Agadir': 'beach_access',
      'Meknès': 'castle',
      'Oujda': 'map',
      'Tétouan': 'landscape',
      'Kénitra': 'factory'
    };
    
    return locationIcons[location] || 'place';
  }

  // Méthode pour obtenir le nombre d'offres par localisation
  getLocationCount(location: string): number {
    if (location === 'all') return this.offres.length;
    return this.offres.filter(offre => offre.localisation === location).length;
  }

  // Méthode pour obtenir l'icône appropriée selon l'option de tri
  getSortOptionIcon(sortValue: string): string {
    const sortIcons: { [key: string]: string } = {
      'date': 'calendar_today',
      'title': 'sort_by_alpha',
      'duration': 'timer',
      'localisation': 'location_on'
    };
    
    return sortIcons[sortValue] || 'sort';
  }

  // Méthode pour vérifier s'il y a des filtres actifs
  hasActiveFilters(): boolean {
    return this.selectedLocation !== 'all' || this.sortBy !== 'date';
  }

  // Méthodes pour l'affichage et les statuts

  // Méthode pour obtenir le label du statut
  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'en_cours':
        return 'Ouvert aux candidatures';
      case 'fermee':
        return 'Offre fermée';
      case 'archivee':
        return 'Offre archivée';
      default:
        return statut;
    }
  }

  // Méthode pour vérifier si l'offre est active
  isOffreActive(statut: string): boolean {
    return statut === 'en_cours';
  }

  // Méthode pour obtenir la classe CSS du statut
  getStatusClass(statut: string): string {
    switch (statut) {
      case 'en_cours':
        return 'status-active';
      case 'fermee':
        return 'status-closed';
      case 'archivee':
        return 'status-archived';
      default:
        return 'status-default';
    }
  }

  // Méthode pour diviser les compétences en tableau
  getCompetences(competencesString: string): string[] {
    return competencesString.split(',').map(comp => comp.trim());
  }

  // Méthode pour optimiser les performances de la boucle *ngFor
  trackByOffre(index: number, offre: OffreStage): number {
    return offre.id || index;
  }

  // Méthode pour obtenir le label du tri actuel
  getSortLabel(): string {
    const sortOption = this.sortOptions.find(option => option.value === this.sortBy);
    const label = sortOption ? sortOption.label : 'Trier par';
    const orderLabel = this.sortOrder === 'asc' ? '↑' : '↓';
    return `${label} ${orderLabel}`;
  }

  // Méthode pour obtenir l'icône du tri
  getSortIcon(): string {
    return this.sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  // Méthode pour obtenir le label de localisation
  getLocationLabel(): string {
    const locationOption = this.locationOptions.find(option => option.value === this.selectedLocation);
    return locationOption ? locationOption.label : '';
  }

  // Méthode pour basculer l'affichage des filtres
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Méthode pour basculer le menu de tri (pour l'instant, on utilise le panneau de filtres)
  toggleSortMenu(): void {
    this.showFilters = !this.showFilters;
  }
}
