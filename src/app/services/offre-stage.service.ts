import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { OffreStage } from '../models/offre-stage';

@Injectable({
  providedIn: 'root'
})
export class OffreStageService {
  private apiUrl = '/api/offres/actives';

  constructor(private http: HttpClient) { }

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
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
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
  getAllOffres(): Observable<OffreStage[]> {
    return this.http.get<OffreStage[]>(`${this.apiUrl}`, {
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
}
