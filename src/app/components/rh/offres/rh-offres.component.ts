
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OffreStage } from '../../../models/offre-stage';
import { AuthService, User } from '../../../services/auth.service';
import { OffreStageService } from '../../../services/offre-stage.service';
import { RhSearchService } from '../../../services/rh-search.service';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rh-offres',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './rh-offres.component.html',
  styleUrls: ['./rh-offres.component.scss']
})
export class RhOffresComponent implements OnInit, OnDestroy {
  offres: any[] = [];
  filteredOffres: any[] = [];
  allOffres: any[] = []; // Stockage de toutes les offres pour la recherche
  loading = false;
  error: string | null = null;
  mode: 'mes' | 'toutes' = 'mes';
  statusFilter: 'tous' | 'en_cours' | 'archivee' = 'tous'; // Nouveau filtre par statut
  currentUser: User | null = null;
  currentSearchQuery: string = '';
  private searchSubscription: Subscription = new Subscription();
  
  // Variables pour le modal d'édition
  showEditModal = false;
  editingOffre: any = {};
  
  // Variable pour l'input des compétences en édition
  editCompetenceInput: string = '';

  // Variables pour le modal d'ajout
  showAddModal = false;
  newOffre: any = {
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    localisation: '',
    competence_requise: '',
    competencesList: [], // Array pour gérer les compétences
    duree_candidature: null,
    nombre_limite_candidature: null
  };
  
  // Variable pour l'input des compétences
  newCompetenceInput: string = '';

  // Pour utiliser Math dans le template
  Math = Math;

  // Calcule la durée en mois entre deux dates
  calculateDurationInMonths(dateDebut: string, dateFin: string): number {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    const annees = fin.getFullYear() - debut.getFullYear();
    const mois = fin.getMonth() - debut.getMonth();
    
    return Math.max(1, annees * 12 + mois + (fin.getDate() >= debut.getDate() ? 1 : 0));
  }

  constructor(
    private authService: AuthService,
    private offreStageService: OffreStageService,
    private rhSearchService: RhSearchService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadOffres();
    
    // S'abonner aux changements de recherche
    this.searchSubscription = this.rhSearchService.searchQuery$.subscribe(
      (query: string) => {
        console.log('🔍 Offres - Nouvelle recherche reçue:', query);
        this.currentSearchQuery = query;
        this.applyFilters();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  private applyFilters(): void {
    let filtered = this.allOffres;
    
    // Appliquer le filtre par statut
    if (this.statusFilter !== 'tous') {
      filtered = filtered.filter(offre => offre.statut === this.statusFilter);
      console.log('🔍 Offres filtrées par statut:', this.statusFilter, ':', filtered.length, 'résultats');
    }
    
    // Appliquer le filtre de recherche
    if (this.currentSearchQuery && this.currentSearchQuery.trim() !== '') {
      filtered = this.rhSearchService.filterOffres(filtered, this.currentSearchQuery);
      console.log('🔍 Offres filtrées par recherche:', filtered.length, 'résultats');
    }
    
    this.filteredOffres = filtered;
  }

  switchStatusFilter(status: 'tous' | 'en_cours' | 'archivee'): void {
    if (this.statusFilter !== status) {
      this.statusFilter = status;
      console.log('🎯 Changement de filtre statut vers:', status);
      this.applyFilters();
    }
  }

  getOffreCountByStatus(status: 'tous' | 'en_cours' | 'archivee'): number {
    if (status === 'tous') {
      return this.allOffres.length;
    }
    return this.allOffres.filter(offre => offre.statut === status).length;
  }

  switchMode(mode: 'mes' | 'toutes') {
    if (this.mode !== mode) {
      this.mode = mode;
      this.loadOffres();
    }
  }

  loadOffres() {
    this.loading = true;
    this.error = null;
    const filterAndSortOffres = (list: any[]) => {
      // Filtrer les offres par statut
      const filteredList = list.filter(offre => offre.statut === 'en_cours' || offre.statut === 'archivee');
      
      // Trier par date de publication (la plus récente en premier)
      return filteredList.sort((a, b) => {
        const dateA = new Date(a.date_publication || a.created_at || 0);
        const dateB = new Date(b.date_publication || b.created_at || 0);
        return dateB.getTime() - dateA.getTime(); // Tri décroissant (plus récent en premier)
      });
    };
    
    if (this.mode === 'mes' && this.currentUser?.id) {
      this.offreStageService.getOffresByRh(this.currentUser.id).subscribe({
        next: (data: any[]) => {
          this.offres = data;
          this.allOffres = filterAndSortOffres(data); // Stocker toutes les offres
          this.applyFilters(); // Appliquer les filtres (y compris la recherche)
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.message || 'Erreur lors du chargement des offres.';
          this.loading = false;
        }
      });
    } else {
      this.offreStageService.getAllOffres().subscribe({
        next: (data: any[]) => {
          this.offres = data;
          this.allOffres = filterAndSortOffres(data); // Stocker toutes les offres
          this.applyFilters(); // Appliquer les filtres (y compris la recherche)
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.message || 'Erreur lors du chargement des offres.';
          this.loading = false;
        }
      });
    }
  }

  getRhLabel(offre: any): string {
    if (!offre.rh_info) return '';
    if (this.currentUser && offre.rh_info.email === this.currentUser.email) {
      return 'moi';
    }
    return `${offre.rh_info.nom} ${offre.rh_info.prenom}`;
  }

  canShowAction(offre: any): boolean {
    return this.currentUser && offre.rh_info && offre.rh_info.email === this.currentUser.email;
  }

  getActionLabel(offre: any): string {
    if (offre.statut === 'en_cours') return 'Archiver';
    if (offre.statut === 'archivee') return 'Activer';
    return '';
  }

  changeStatut(offre: any) {
    if (!offre.id) return;
    this.loading = true;
    const value = offre.statut === 'en_cours' ? 'archivee' : 'en_cours';
    this.offreStageService.changeStatut(offre.id, value).subscribe({
      next: () => {
        this.loadOffres();
      },
      error: (err: any) => {
        this.error = err.message || 'Erreur lors du changement de statut.';
        this.loading = false;
      }
    });
  }

  // Ouvre le modale d'édition pour une offre
  openEditModal(offre: any) {
    this.editingOffre = { ...offre }; // Copie de l'offre pour édition
    
    // Convertir les compétences de string vers array pour l'édition
    if (this.editingOffre.competence_requise) {
      this.editingOffre.competencesList = this.editingOffre.competence_requise
        .split(',')
        .map((comp: string) => comp.trim())
        .filter((comp: string) => comp.length > 0);
    } else {
      this.editingOffre.competencesList = [];
    }
    
    this.editCompetenceInput = '';
    this.showEditModal = true;
  }

  // Ferme le modale d'édition
  closeEditModal() {
    this.showEditModal = false;
    this.editingOffre = {};
    this.editCompetenceInput = '';
  }

  // Ouvre le modal d'ajout d'offre
  openAddModal() {
    this.newOffre = {
      titre: '',
      description: '',
      date_debut: '',
      date_fin: '',
      localisation: '',
      competence_requise: '',
      competencesList: [],
      duree_candidature: null,
      nombre_limite_candidature: null
    };
    this.newCompetenceInput = '';
    this.showAddModal = true;
  }

  // Ferme le modal d'ajout
  closeAddModal() {
    this.showAddModal = false;
    this.newOffre = {
      titre: '',
      description: '',
      date_debut: '',
      date_fin: '',
      localisation: '',
      competence_requise: '',
      competencesList: [],
      duree_candidature: null,
      nombre_limite_candidature: null
    };
    this.newCompetenceInput = '';
  }

  // Ajoute une compétence (avec la touche Entrée)
  addCompetence(event: Event) {
    event.preventDefault();
    this.addCompetenceToList();
  }

  // Ajoute une compétence (avec le bouton)
  addCompetenceButton() {
    this.addCompetenceToList();
  }

  // Logique commune pour ajouter une compétence
  private addCompetenceToList() {
    const competence = this.newCompetenceInput.trim();
    if (competence && !this.newOffre.competencesList.includes(competence)) {
      this.newOffre.competencesList.push(competence);
      this.newCompetenceInput = '';
    }
  }

  // Supprime une compétence
  removeCompetence(index: number) {
    this.newOffre.competencesList.splice(index, 1);
  }

  // Méthodes pour les compétences en édition
  addEditCompetence(event: Event) {
    event.preventDefault();
    this.addEditCompetenceToList();
  }

  addEditCompetenceButton() {
    this.addEditCompetenceToList();
  }

  private addEditCompetenceToList() {
    const competence = this.editCompetenceInput.trim();
    if (competence && !this.editingOffre.competencesList.includes(competence)) {
      this.editingOffre.competencesList.push(competence);
      this.editCompetenceInput = '';
    }
  }

  removeEditCompetence(index: number) {
    this.editingOffre.competencesList.splice(index, 1);
  }

  // Ajoute une nouvelle offre via l'API
  addOffre() {
    this.loading = true;
    this.error = null;
    
    // Calculer la durée en jours entre date_debut et date_fin
    const dateDebut = new Date(this.newOffre.date_debut);
    const dateFin = new Date(this.newOffre.date_fin);
    const dureeEnJours = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24));
    
    // Convertir la liste de compétences en chaîne séparée par des virgules
    const competencesString = this.newOffre.competencesList.join(', ');
    
    // Préparer les données selon le format API attendu
    const offreDataForAPI = {
      id_rh: this.currentUser?.id, // ID du RH connecté
      titre: this.newOffre.titre,
      description: this.newOffre.description,
      date_debut: this.newOffre.date_debut,
      date_fin: this.newOffre.date_fin,
      duree: dureeEnJours, // Durée calculée en jours
      statut: "en_cours", // Statut par défaut
      localisation: this.newOffre.localisation,
      competence_requise: competencesString, // Compétences sous forme de chaîne
      duree_candidature: this.newOffre.duree_candidature,
      nombre_limite_candidature: this.newOffre.nombre_limite_candidature
    };
    
    // Logs pour déboguer
    console.log('📝 Tentative de création d\'offre');
    console.log('📊 Données du formulaire:', this.newOffre);
    console.log('🏷️ Compétences (array):', this.newOffre.competencesList);
    console.log('🏷️ Compétences (string):', competencesString);
    console.log('📊 Données formatées pour l\'API:', offreDataForAPI);
    console.log('👤 Utilisateur connecté:', this.currentUser);
    console.log('🆔 ID du RH:', this.currentUser?.id);
    console.log('⏱️ Durée calculée:', dureeEnJours, 'jours');
    console.log('🔐 Token disponible:', !!this.authService.getToken());
    
    this.offreStageService.createOffre(offreDataForAPI).subscribe({
      next: (response: any) => {
        console.log('✅ Offre créée avec succès:', response);
        this.loading = false;
        this.closeAddModal();
        this.loadOffres(); // Recharger la liste
      },
      error: (err: any) => {
        console.error('❌ Erreur lors de la création:', err);
        this.error = err.message || 'Erreur lors de la création de l\'offre.';
        this.loading = false;
      }
    });
  }

  // Met à jour l'offre via l'API
  updateOffre() {
    if (!this.editingOffre.id) return;
    
    this.loading = true;
    this.error = null;
    
    // Convertir la liste de compétences en chaîne séparée par des virgules
    const competencesString = this.editingOffre.competencesList.join(', ');
    
    // Préparer les données pour l'API
    const offreDataForUpdate = {
      ...this.editingOffre,
      competence_requise: competencesString
    };
    
    // Supprimer le champ competencesList des données envoyées
    delete offreDataForUpdate.competencesList;
    
    console.log('📝 Mise à jour d\'offre');
    console.log('🏷️ Compétences (array):', this.editingOffre.competencesList);
    console.log('🏷️ Compétences (string):', competencesString);
    console.log('📊 Données envoyées:', offreDataForUpdate);
    
    this.offreStageService.updateOffre(this.editingOffre.id, offreDataForUpdate).subscribe({
      next: (response: any) => {
        console.log('✅ Offre mise à jour avec succès:', response);
        this.loading = false;
        this.closeEditModal();
        this.loadOffres(); // Recharger la liste
      },
      error: (err: any) => {
        console.error('❌ Erreur lors de la mise à jour:', err);
        this.error = err.message || 'Erreur lors de la mise à jour de l\'offre.';
        this.loading = false;
      }
    });
  }
}
