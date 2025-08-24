import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  createUtilisateur(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, {
      headers: this.authService.getAuthHeaders()
    });
  }
  private apiUrl = '/api/utilisateurs';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateStatut(id: number, statut: 'active' | 'archive'): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/statut`, { statut }, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
