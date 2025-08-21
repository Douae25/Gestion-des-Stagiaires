
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { OffreStage } from '../models/offre-stage';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OffreStageService {
  private apiUrl = '/api/offres/actives';
  private apiBase = '/api/offres';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors de la communication avec le serveur';
    
    if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
    } else if (error.status === 404) {
      errorMessage = 'La ressource demandée est introuvable.';
    } else if (error.status >= 500) {
      errorMessage = 'Le serveur rencontre actuellement des difficultés. Veuillez réessayer plus tard.';
    }
    
    console.error('Erreur API:', error);
    return throwError(() => new Error(errorMessage));
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    console.log('🔍 Construction des headers:');
    console.log('  - Token récupéré:', token ? '✅ Présent' : '❌ Absent');
    console.log('  - Token value:', token);
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('  - Header Authorization ajouté:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('  - ⚠️ Aucun token disponible pour l\'authentification');
    }
    
    console.log('  - Headers finaux:', headers);
    return headers;
  }

  /**
   * Récupère les 5 premières offres de stage actives (statut 'en_cours')
   */
  getOffresActives(): Observable<OffreStage[]> {
    return this.http.get<OffreStage[]>(`${this.apiUrl}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        // L'API retourne déjà les offres actives, on prend juste les 5 premières
        return Array.isArray(response) ? response.slice(0, 5) : [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère toutes les offres de stage
   */
  getAllOffres(): Observable<any[]> {
    return this.http.get<any[]>(`/api/offres`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les offres créées par un RH
   */
  getOffresByRh(idRh: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/offres/rh/${idRh}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Change le statut d'une offre (archive/active)
   * @param id id de l'offre
   * @param value 'archivee' ou 'en_cours'
   */
  changeStatut(id: number, value: string): Observable<string> {
    return this.http.patch(`/api/offres/${id}/statut?value=${value}`, {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour une offre
   * @param id id de l'offre
   * @param offreData données de l'offre à mettre à jour
   */
  updateOffre(id: number, offreData: any): Observable<any> {
    return this.http.put<any>(`/api/offres/${id}`, offreData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crée une nouvelle offre
   * @param offreData données de l'offre à créer
   */
  createOffre(offreData: any): Observable<any> {
    const headers = this.getHeaders();
    
    // Logs pour déboguer
    console.log('🚀 Création d\'offre - Données envoyées:', offreData);
    console.log('🔑 Headers utilisés:', headers);
    console.log('📍 URL d\'endpoint:', '/api/offres');
    console.log('👤 Token actuel:', this.authService.getToken());
    console.log('🔍 Utilisateur actuel:', this.authService.getCurrentUser());
    
    return this.http.post<any>(`/api/offres`, offreData, {
      headers: headers
    }).pipe(
      catchError((error) => {
        console.error('❌ Erreur lors de la création d\'offre:', error);
        console.error('📋 Détails de l\'erreur:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error
        });
        return this.handleError(error);
      })
    );
  }

  /**
   * Récupère les candidatures acceptées dont la convention n'est pas signée pour un RH
   */
  getConventionsNonSignees(idRh: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/candidatures/rh/${idRh}/acceptees-convention-non-signee`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les offres par statut
   */
  getOffresByStatut(statut: string): Observable<OffreStage[]> {
    return this.http.get<OffreStage[]>(`${this.apiUrl}?statut=${statut}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les offres d'un RH pour traitement des candidatures
   */
  getOffresForTraitement(idRh: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/offres/rh/${idRh}/pour-traitement`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }



// ...existing code up to getOffresForTraitement...
  /**
   * Récupère les candidatures finalisées pour la gestion des attestations de stage d'un RH
   */
  getAttestationsFinaliseesRh(idRh: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/candidatures/finalisees/rh/${idRh}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
}
