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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { PostulerComponent } from '../stagiaire/postuler/postuler.component';

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
    MatSnackBarModule,
    MatDialogModule
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
  sortBy: 'date' | 'title' | 'duration' | 'urgency' = 'urgency';
  sortOrder: 'asc' | 'desc' = 'asc';
  showFilters: boolean = false;

  locationOptions: { value: string; label: string }[] = [];
  sortOptions = [
    { value: 'urgency', label: 'Urgence (Date limite)' },
    { value: 'date', label: 'Date de début' },
    { value: 'title', label: 'Titre' },
    { value: 'duration', label: 'Durée' }
  ];

  constructor(
    private offreStageService: OffreStageService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
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
        case 'urgency':
          // Tri par urgence : les offres qui expirent bientôt en premier
          const dateA = this.getDateLimiteCandidature(a);
          const dateB = this.getDateLimiteCandidature(b);
          
          // Si une offre est expirée, elle va à la fin
          const expiredA = this.isOffreExpiree(a);
          const expiredB = this.isOffreExpiree(b);
          
          if (expiredA && !expiredB) return 1;
          if (!expiredA && expiredB) return -1;
          if (expiredA && expiredB) return 0;
          
          // Pour les offres non expirées, trier par date limite croissante
          comparison = dateA.getTime() - dateB.getTime();
          break;
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
    const validSortValues: ('date' | 'title' | 'duration' | 'urgency')[] = ['date', 'title', 'duration', 'urgency'];
    
    if (validSortValues.includes(sortValue as 'date' | 'title' | 'duration' | 'urgency')) {
      const typedSortValue = sortValue as 'date' | 'title' | 'duration' | 'urgency';
      
      if (this.sortBy === typedSortValue) {
        // Si c'est le même tri, inverser l'ordre
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // Nouveau tri, commencer par ordre approprié
        if (typedSortValue === 'urgency') {
          // Pour l'urgence, commencer par ordre croissant (plus urgent en premier)
          this.sortOrder = 'asc';
        } else {
          // Pour les autres, commencer par ordre descendant
          this.sortOrder = 'desc';
        }
        this.sortBy = typedSortValue;
      }
      
      this.applyFiltersAndSort();
    }
  }

  // Réinitialiser tous les filtres
  resetFilters(): void {
    this.selectedLocation = 'all';
    this.sortBy = 'urgency';
    this.sortOrder = 'asc';
    this.applyFiltersAndSort();
    
    this.snackBar.open('Filtres réinitialisés', 'Fermer', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  retourAccueil(): void {
    this.router.navigate(['/']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/offres' } });
  }

  // Méthodes pour les nouvelles fonctionnalités

  // Calculer la date limite de candidature
  getDateLimiteCandidature(offre: OffreStage): Date {
    const datePublication = new Date(offre.date_publication);
    const dateLimite = new Date(datePublication);
    dateLimite.setDate(dateLimite.getDate() + offre.duree_candidature);
    return dateLimite;
  }

  // Calculer le temps restant pour postuler
  getTempsRestant(offre: OffreStage): { jours: number; heures: number; expire: boolean } {
    const maintenant = new Date();
    const dateLimite = this.getDateLimiteCandidature(offre);
    const diffMs = dateLimite.getTime() - maintenant.getTime();
    
    if (diffMs <= 0) {
      return { jours: 0, heures: 0, expire: true };
    }
    
    const jours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const heures = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { jours, heures, expire: false };
  }

  // Formater le temps restant en texte
  formatTempsRestant(offre: OffreStage): string {
    const temps = this.getTempsRestant(offre);
    
    if (temps.expire) {
      return 'Candidatures fermées';
    }
    
    if (temps.jours > 0) {
      return `${temps.jours} jour${temps.jours > 1 ? 's' : ''} restant${temps.jours > 1 ? 's' : ''}`;
    } else if (temps.heures > 0) {
      return `${temps.heures} heure${temps.heures > 1 ? 's' : ''} restante${temps.heures > 1 ? 's' : ''}`;
    } else {
      return 'Expire bientôt';
    }
  }

  // Vérifier si l'offre a expiré
  isOffreExpiree(offre: OffreStage): boolean {
    return this.getTempsRestant(offre).expire;
  }

  // Calculer le nombre de candidatures restantes
  getCandidaturesRestantes(offre: OffreStage): number | null {
    if (!offre.nombre_limite_candidature) {
      return null; // Pas de limite
    }
    
    const actuelles = offre.nombre_candidatures_actuelles || 0;
    const restantes = offre.nombre_limite_candidature - actuelles;
    return Math.max(0, restantes);
  }

  // Formater l'affichage des candidatures
  formatCandidatures(offre: OffreStage): string {
    const restantes = this.getCandidaturesRestantes(offre);
    
    if (restantes === null) {
      return 'Candidatures illimitées';
    }
    
    if (restantes === 0) {
      return 'Plus de places disponibles';
    }
    
    return `${restantes} place${restantes > 1 ? 's' : ''} restante${restantes > 1 ? 's' : ''}`;
  }

  // Vérifier si les candidatures sont complètes
  isCandidaturesCompletes(offre: OffreStage): boolean {
    const restantes = this.getCandidaturesRestantes(offre);
    return restantes === 0;
  }

  // Obtenir la classe CSS pour le statut de l'offre
  getOffreStatusClass(offre: OffreStage): string {
    if (this.isOffreExpiree(offre)) {
      return 'status-expired';
    }
    
    if (this.isCandidaturesCompletes(offre)) {
      return 'status-full';
    }
    
    const temps = this.getTempsRestant(offre);
    if (temps.jours <= 1) {
      return 'status-urgent';
    }
    
    if (temps.jours <= 3) {
      return 'status-warning';
    }
    
    return 'status-active';
  }

  // Vérifier si on peut postuler à l'offre
  canPostuler(offre: OffreStage): boolean {
    return this.isOffreActive(offre.statut) && 
           !this.isOffreExpiree(offre) && 
           !this.isCandidaturesCompletes(offre);
  }

  // Formater la date de publication
  formatDatePublication(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
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

  // Ouvrir le dialog de candidature
  ouvrirDialogPostuler(offre: OffreStage): void {
    // Vérifier que l'utilisateur est connecté et est un stagiaire
    if (!this.currentUser) {
      this.snackBar.open('Vous devez vous connecter pour postuler', 'Se connecter', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      }).onAction().subscribe(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/offres' } });
      });
      return;
    }

    if (this.currentUser.role !== 'stagiaire') {
      this.snackBar.open('Seuls les stagiaires peuvent postuler aux offres', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Vérifier que l'offre est active
    if (!this.isOffreActive(offre.statut)) {
      this.snackBar.open('Cette offre n\'est plus disponible', 'Fermer', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Vérifier que l'offre n'a pas expiré
    if (this.isOffreExpiree(offre)) {
      this.snackBar.open('La période de candidature pour cette offre est terminée', 'Fermer', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Vérifier qu'il reste des places
    if (this.isCandidaturesCompletes(offre)) {
      this.snackBar.open('Cette offre a atteint le nombre maximum de candidatures', 'Fermer', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Ouvrir le dialog
    const dialogRef = this.dialog.open(PostulerComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { offre: offre },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Candidature envoyée avec succès
        this.snackBar.open('Candidature envoyée avec succès!', 'Voir mes candidatures', {
          duration: 5000,
          panelClass: ['success-snackbar']
        }).onAction().subscribe(() => {
          this.router.navigate(['/stagiaire/candidatures']);
        });
        
        // Recharger les offres pour mettre à jour les compteurs
        this.loadAllOffres();
      }
    });
  }
}
