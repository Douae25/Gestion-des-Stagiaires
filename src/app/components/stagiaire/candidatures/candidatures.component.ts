
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { StagiaireService, Candidature } from '../../../services/stagiaire.service';
import { ConfirmCancelDialogComponent } from './confirm-cancel-dialog.component';

@Component({
  selector: 'app-candidatures',
  templateUrl: './candidatures.component.html',
  styleUrls: ['./candidatures.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    MatInputModule
  ]
})
export class CandidaturesComponent implements OnInit {
  // Calcule la durée en mois entre deux dates
  getDureeEnMois(dateDebut: string, dateFin: string): string {
    if (!dateDebut || !dateFin) return 'Non spécifié';
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    let mois = (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());
    // Si le jour de fin est supérieur ou égal au jour de début, on ajoute 1 mois
    if (fin.getDate() >= debut.getDate()) {
      mois += 1;
    }
    return mois <= 1 ? '1 mois' : `${mois} mois`;
  }
  // Convertit une durée en jours en mois arrondi
  formatDureeEnMois(dureeJours: number): string {
    if (!dureeJours || isNaN(dureeJours)) return 'Non spécifié';
    const mois = Math.round(dureeJours / 30);
    return mois <= 1 ? '1 mois' : `${mois} mois`;
  }
  currentUser: User | null = null;
  candidatures: Candidature[] = []; // Toujours initialisé comme tableau vide
  candidaturesFiltrees: Candidature[] = []; // Candidatures filtrées
  loading = false;
  error: string | null = null;

  // Propriétés pour le filtrage et tri
  selectedStatut: string = 'all';
  sortBy: 'date' | 'statut' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  showFilters: boolean = false;
  searchQuery: string = '';

  statutOptions = [
    { value: 'all', label: 'Tous les statuts', count: 0 },
    { value: 'en_attente', label: 'En attente', count: 0 },
    { value: 'acceptee', label: 'Acceptées', count: 0 },
    { value: 'refusee', label: 'Refusées', count: 0 }
  ];

  sortOptions = [
    { value: 'date', label: 'Date de candidature' },
    { value: 'statut', label: 'Statut' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private stagiaireService: StagiaireService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // S'assurer que candidatures est toujours un tableau
    this.candidatures = [];
    
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user || user.role !== 'stagiaire') {
        this.router.navigate(['/login']);
      } else {
        this.loadCandidatures();
      }
    });
  }

  loadCandidatures(): void {
    this.loading = true;
    this.error = null;
    
    this.stagiaireService.getCandidatures().subscribe({
      next: (response: Candidature[]) => {
        console.log('Réponse complète du backend:', response);
        
        // Le backend retourne directement un tableau
        this.candidatures = response || [];
        this.updateStatutCounts();
        this.applyFiltersAndSort();
        
        this.loading = false;
        console.log('Candidatures assignées:', this.candidatures);
        console.log('Nombre de candidatures:', this.candidatures.length);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des candidatures:', error);
        this.error = 'Erreur lors du chargement des candidatures';
        this.loading = false;
        // S'assurer qu'on a toujours un tableau même en cas d'erreur
        this.candidatures = [];
        this.candidaturesFiltrees = [];
      }
    });
  }

  viewCandidature(candidature: Candidature): void {
    // Passer les données de la candidature via l'état de navigation
    // pour éviter un appel API supplémentaire
    this.router.navigate(['/stagiaire/candidatures', candidature.id], {
      state: { candidature: candidature }
    });
  }

  getStatusColor(statut: string): 'primary' | 'accent' | 'warn' {
    switch (statut) {
      case 'acceptee': return 'primary';
      case 'en_cours_evaluation': return 'accent';
      case 'refusee': return 'warn';
      default: return 'accent';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'acceptee': return 'Acceptée';
      case 'refusee': return 'Refusée';
      case 'en_cours_evaluation': return 'En évaluation';
      default: return statut;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  // Vérifier si une candidature peut être annulée
  canCancelCandidature(candidature: Candidature): boolean {
    // On peut annuler seulement les candidatures en attente
    return candidature.statut === 'en_attente';
  }

  // Annuler une candidature
  cancelCandidature(candidature: Candidature, event: Event): void {
    event.stopPropagation(); // Empêcher la navigation vers les détails
    
    // Créer et ouvrir le dialog de confirmation
    const dialogRef = this.dialog.open(ConfirmCancelDialogComponent, {
      width: '400px',
      data: {
        titre: candidature.offre_info.titre || 'Offre de stage',
        statut: candidature.statut
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // L'utilisateur a confirmé l'annulation
        this.performCancelCandidature(candidature.id);
      }
    });
  }

  // Effectuer l'annulation de la candidature
  private performCancelCandidature(candidatureId: number): void {
    this.stagiaireService.cancelCandidature(candidatureId).subscribe({
      next: () => {
        this.snackBar.open('Candidature annulée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Recharger la liste des candidatures
        this.loadCandidatures();
      },
      error: (error) => {
        console.error('Erreur lors de l\'annulation:', error);
        this.snackBar.open(error.message || 'Erreur lors de l\'annulation de la candidature', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Mettre à jour les compteurs de statuts
  updateStatutCounts(): void {
    this.statutOptions.forEach(option => {
      if (option.value === 'all') {
        option.count = this.candidatures.length;
      } else {
        option.count = this.candidatures.filter(c => c.statut === option.value).length;
      }
    });
  }

  // Appliquer les filtres et le tri
  applyFiltersAndSort(): void {
    let filtered = [...this.candidatures];

    // Filtrage par statut
    if (this.selectedStatut !== 'all') {
      filtered = filtered.filter(candidature => candidature.statut === this.selectedStatut);
    }

    // Filtrage par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(candidature => {
        const titre = candidature.offre_info?.titre?.toLowerCase() || '';
        const localisation = candidature.offre_info?.localisation?.toLowerCase() || '';
        const statut = this.getStatusLabel(candidature.statut).toLowerCase();
        
        return titre.includes(query) || 
               localisation.includes(query) || 
               statut.includes(query);
      });
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'date':
          // Tri par date de soumission (plus récentes en premier par défaut)
          comparison = new Date(a.date_soumission).getTime() - new Date(b.date_soumission).getTime();
          break;
        case 'statut':
          comparison = a.statut.localeCompare(b.statut);
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.candidaturesFiltrees = filtered;
  }

  // Changer le filtre de statut
  changeStatutFilter(statut: string): void {
    this.selectedStatut = statut;
    this.applyFiltersAndSort();
  }

  // Gérer la recherche
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFiltersAndSort();
  }

  // Effacer la recherche
  clearSearch(): void {
    this.searchQuery = '';
    this.applyFiltersAndSort();
  }

  // Changer le tri
  changeSortBy(sortBy: string): void {
    const validSortValues: ('date' | 'statut')[] = ['date', 'statut'];
    
    if (validSortValues.includes(sortBy as 'date' | 'statut')) {
      const typedSortValue = sortBy as 'date' | 'statut';
      
      if (this.sortBy === typedSortValue) {
        // Si c'est le même tri, inverser l'ordre
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // Nouveau tri, commencer par ordre descendant (sauf pour date qui commence par desc pour avoir les plus récentes)
        this.sortBy = typedSortValue;
        this.sortOrder = typedSortValue === 'date' ? 'desc' : 'asc';
      }
      this.applyFiltersAndSort();
    }
  }

  // Basculer l'affichage des filtres
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.selectedStatut = 'all';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.searchQuery = '';
    this.applyFiltersAndSort();
  }

  // Obtenir le label du tri actuel
  getSortLabel(): string {
    const sortOption = this.sortOptions.find(option => option.value === this.sortBy);
    const label = sortOption ? sortOption.label : 'Trier par';
    const orderLabel = this.sortOrder === 'asc' ? '↑' : '↓';
    return `${label} ${orderLabel}`;
  }

  // Obtenir le nombre de candidatures pour un statut
  getStatutCount(statut: string): number {
    const option = this.statutOptions.find(opt => opt.value === statut);
    return option ? option.count : 0;
  }

  // Calculer le temps de réponse entre soumission et réponse
  getResponseTime(dateSubmission: string, dateResponse: string): string {
    const submission = new Date(dateSubmission);
    const response = new Date(dateResponse);
    const diffTime = Math.abs(response.getTime() - submission.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 jour';
    } else if (diffDays < 7) {
      return `${diffDays} jours`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 semaine' : `${weeks} semaines`;
    } else {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 mois' : `${months} mois`;
    }
  }

  // Obtenir l'icône appropriée pour le statut
  getStatusIcon(statut: string): string {
    switch (statut) {
      case 'en_attente':
        return 'hourglass_empty';
      case 'acceptee':
        return 'check_circle';
      case 'refusee':
        return 'cancel';
      default:
        return 'help_outline';
    }
  }

  // Vérifier si la candidature a des documents
  hasDocuments(candidature: Candidature): boolean {
    return !!(candidature.cv || candidature.lettre_motivation);
  }

  // Obtenir la liste des documents disponibles
  getDocumentsList(candidature: Candidature): string[] {
    const documents: string[] = [];
    if (candidature.cv) documents.push('CV');
    if (candidature.lettre_motivation) documents.push('Lettre de motivation');
    if (candidature.convention_stage) documents.push('Convention de stage');
    if (candidature.convention_signee) documents.push('Convention signée');
    if (candidature.attestation || candidature.attestation_stage) documents.push('Attestation');
    return documents;
  }

  // Calculer les jours depuis la soumission
  getDaysSinceSubmission(dateSubmission: string): number {
    const submission = new Date(dateSubmission);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - submission.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Obtenir le texte de progression basé sur le statut
  getProgressText(candidature: Candidature): string {
    switch (candidature.statut) {
      case 'en_attente':
        const days = this.getDaysSinceSubmission(candidature.date_soumission);
        return `En attente depuis ${days} jour${days > 1 ? 's' : ''}`;
      case 'acceptee':
        return 'Candidature acceptée';
      case 'refusee':
        return 'Candidature refusée';
      default:
        return 'Statut inconnu';
    }
  }

  // Vérifier si l'encadrant est assigné
  hasEncadrant(candidature: Candidature): boolean {
    return candidature.statut === 'acceptee' && !!candidature.encadrant_info;
  }

  // Obtenir la couleur de progression basée sur le statut
  getProgressColor(candidature: Candidature): string {
    switch (candidature.statut) {
      case 'en_attente':
        return 'warn';
      case 'acceptee':
        return 'primary';
      case 'refusee':
        return '';
      default:
        return '';
    }
  }

  // Télécharger un document
  downloadDocument(documentPath: string, documentName: string): void {
    if (!documentPath) {
      this.snackBar.open('Document non disponible', 'Fermer', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Afficher un indicateur de chargement
    this.snackBar.open('Téléchargement en cours...', '', { 
      duration: 1000,
      panelClass: ['info-snackbar']
    });

    try {
      // Si le documentPath est une URL complète, l'ouvrir directement
      if (documentPath.startsWith('http')) {
        window.open(documentPath, '_blank');
        this.snackBar.open(`${documentName} ouvert avec succès`, 'Fermer', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } else {
        // Sinon, construire l'URL complète avec l'API backend
        const baseUrl = 'http://localhost:8000/api'; // À ajuster selon votre configuration
        const documentUrl = `${baseUrl}/documents/download-file?path=${encodeURIComponent(documentPath)}`;
        window.open(documentUrl, '_blank');
        
        this.snackBar.open(`${documentName} ouvert avec succès`, 'Fermer', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du document:', error);
      this.snackBar.open('Erreur lors de l\'ouverture du document', 'Fermer', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // Télécharger la convention signée via l'API spécifique
  downloadConventionSignee(candidature: Candidature): void {
    this.snackBar.open('Téléchargement de la convention en cours...', '', { 
      duration: 2000,
      panelClass: ['info-snackbar']
    });

    // Utiliser la méthode spécifique pour la convention signée
    this.stagiaireService.telechargerConventionSigneeCandidature(candidature.id).subscribe({
      next: (blob) => {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Convention_signee_${candidature.offre_info.titre.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Convention téléchargée avec succès', 'Fermer', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement de la convention:', error);
        let errorMessage = 'Erreur lors du téléchargement de la convention';
        
        if (error.message && error.message.includes('Convention signée non disponible')) {
          errorMessage = 'Convention signée non encore disponible';
        } else if (error.status === 404) {
          errorMessage = 'Convention non trouvée';
        } else if (error.status === 403) {
          errorMessage = 'Accès non autorisé à ce document';
        }
        
        this.snackBar.open(errorMessage, 'Fermer', { 
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Modifier une candidature (pour les candidatures en attente)
  editCandidature(candidature: Candidature): void {
    // Naviguer vers la page d'édition de candidature
    this.router.navigate(['/stagiaire/edit-candidature', candidature.id]);
  }

  // Afficher les détails du motif de refus
  showRefusalReason(candidature: Candidature): void {
    if (candidature.commentaire_rh) {
      // Ouvrir un dialog avec le motif de refus
      this.snackBar.open(candidature.commentaire_rh, 'Fermer', { 
        duration: 5000,
        panelClass: ['info-snackbar']
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/stagiaire/dashboard']);
  }


    // Télécharger l'attestation de stage via l'API
  downloadAttestation(candidature: Candidature): void {
    this.snackBar.open('Téléchargement de l\'attestation en cours...', '', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });

    this.stagiaireService.telechargerAttestation(candidature.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Attestation_stage_${candidature.offre_info.titre.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.snackBar.open('Attestation téléchargée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement de l\'attestation:', error);
        let errorMessage = 'Erreur lors du téléchargement de l\'attestation';
        if (error.message && error.message.includes('Attestation non disponible')) {
          errorMessage = 'Attestation non encore disponible';
        } else if (error.status === 404) {
          errorMessage = 'Attestation non trouvée';
        } else if (error.status === 403) {
          errorMessage = 'Accès non autorisé à ce document';
        }
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
