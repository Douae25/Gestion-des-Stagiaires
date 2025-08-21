import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-rh-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rh-historique.component.html',
  styleUrls: ['./rh-historique.component.scss']
})
export class RhHistoriqueComponent implements OnInit {
  showOnlyMine = false;

  setShowOnlyMine(val: boolean) {
    this.showOnlyMine = val;
  }
  filteredTerminees(): any[] {
    if (this.showOnlyMine && this.currentUserEmail) {
      return this.terminees.filter(c => c.rh?.email === this.currentUserEmail);
    }
    return this.terminees;
  }
  showModal = false;
  terminees: any[] = [];
  selectedCandidature: any = null;
  lettreMotivationError = false;
  currentUserEmail: string | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    const user = this.authService.getCurrentUser();
    this.currentUserEmail = user?.email || null;
    this.http.get<any[]>('/api/candidatures/terminees', { headers }).subscribe({
      next: (data) => {
        this.terminees = data;
      },
      error: (err) => {
        console.error('Erreur chargement candidatures terminées', err);
      }
    });
  }

  openModal(candidature?: any) {
    this.selectedCandidature = candidature || null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedCandidature = null;
  }

  downloadFile(base64: string, filename: string) {
    console.log('Téléchargement demandé:', filename, base64?.slice(0, 30));
    if (!base64) return;
    // Convertir le base64 en Blob PDF
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
