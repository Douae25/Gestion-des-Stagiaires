import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RhSearchService {
  private searchQuerySubject = new BehaviorSubject<string>('');
  public searchQuery$: Observable<string> = this.searchQuerySubject.asObservable();

  constructor() {}

  updateSearchQuery(query: string): void {
    console.log('🔍 Service de recherche RH - Nouvelle recherche:', query);
    this.searchQuerySubject.next(query);
  }

  getCurrentSearchQuery(): string {
    return this.searchQuerySubject.value;
  }

  clearSearch(): void {
    console.log('🧹 Service de recherche RH - Effacement de la recherche');
    this.searchQuerySubject.next('');
  }

  // Méthode pour filtrer les offres basée sur la recherche
  filterOffres(offres: any[], searchTerm: string): any[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return offres;
    }

    const term = searchTerm.toLowerCase().trim();
    console.log('🔍 Filtrage des offres avec le terme:', term);

    return offres.filter(offre => {
      return (
        offre.titre?.toLowerCase().includes(term) ||
        offre.description?.toLowerCase().includes(term) ||
        offre.localisation?.toLowerCase().includes(term) ||
        offre.competence_requise?.toLowerCase().includes(term) ||
        offre.statut?.toLowerCase().includes(term)
      );
    });
  }

  // Méthode pour filtrer les candidatures basée sur la recherche
  filterCandidatures(candidatures: any[], searchTerm: string): any[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return candidatures;
    }

    const term = searchTerm.toLowerCase().trim();
    console.log('🔍 Filtrage des candidatures avec le terme:', term);

    return candidatures.filter(candidature => {
      return (
        candidature.nom?.toLowerCase().includes(term) ||
        candidature.prenom?.toLowerCase().includes(term) ||
        candidature.email?.toLowerCase().includes(term) ||
        candidature.statut?.toLowerCase().includes(term) ||
        candidature.offre_titre?.toLowerCase().includes(term)
      );
    });
  }

  // Méthode pour filtrer les stagiaires basée sur la recherche
  filterStagiaires(stagiaires: any[], searchTerm: string): any[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return stagiaires;
    }

    const term = searchTerm.toLowerCase().trim();
    console.log('🔍 Filtrage des stagiaires avec le terme:', term);

    return stagiaires.filter(stagiaire => {
      return (
        stagiaire.nom?.toLowerCase().includes(term) ||
        stagiaire.prenom?.toLowerCase().includes(term) ||
        stagiaire.email?.toLowerCase().includes(term) ||
        stagiaire.niveau_etude?.toLowerCase().includes(term) ||
        stagiaire.specialite?.toLowerCase().includes(term)
      );
    });
  }
}
