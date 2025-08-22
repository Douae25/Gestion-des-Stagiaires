import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CandidatureService {
  getCandidaturesEvaluees(idUtilisateur: number): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.get<any[]>(`/api/candidatures/acceptees/evaluees/${idUtilisateur}`, { headers });
  }
  addEvaluation(evaluation: { note: number, commentaire: string, dateEvaluation: string, id_utilisateur_encadrant: number, id_utilisateur_stagiaire: number }): Observable<any> {
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.post<any>('/api/evaluations', evaluation, { headers });
  }
  getRapportsFinaux(idUtilisateur: number): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.get<any[]>(`/api/candidatures/acceptees/rapport-final/${idUtilisateur}`, { headers });
  }
  addCommentToReport(reportId: number, contenu: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.post<any>('/api/commentaires', {
      idRapport: reportId,
      contenu: contenu
    }, { headers });
  }
  constructor(private http: HttpClient, private authService: AuthService) {}

  getCandidaturesAcceptees(idUtilisateur: number): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.get<any[]>(`/api/candidatures/acceptees/${idUtilisateur}`, { headers });
  }
}
