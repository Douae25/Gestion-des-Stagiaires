
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { StagiaireService, Candidature } from '../../../services/stagiaire.service';

@Component({
  selector: 'app-candidature-detail',
  templateUrl: './candidature-detail.component.html',
  styleUrls: ['./candidature-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatToolbarModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class CandidatureDetailComponent implements OnInit {
  currentUser: User | null = null;
  candidature: Candidature | null = null;
  loading = true;
  error: string | null = null;
  candidatureId: number;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private stagiaireService: StagiaireService,
    private snackBar: MatSnackBar
  ) {
    this.candidatureId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user || user.role !== 'stagiaire') {
        this.router.navigate(['/login']);
      } else {
        // Vérifier d'abord s'il y a des données dans l'état de navigation
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state || history.state;
        
        if (state?.candidature) {
          // Utiliser les données passées via la navigation
          this.candidature = state.candidature;
          this.loading = false;
          console.log('Données candidature récupérées depuis la navigation:', this.candidature);
        } else {
          // Sinon, charger depuis l'API
          this.loadCandidatureDetail();
        }
      }
    });
  }

  loadCandidatureDetail(): void {
    this.loading = true;
    this.error = null;
    
    // D'abord, essayons de récupérer toutes les candidatures de l'utilisateur
    // puis filtrer par ID pour éviter l'erreur 403
    this.stagiaireService.getCandidatures().subscribe({
      next: (candidatures: Candidature[]) => {
        const foundCandidature = candidatures.find(c => c.id === this.candidatureId);
        
        if (foundCandidature) {
          this.candidature = foundCandidature;
          this.loading = false;
          console.log('Détails candidature trouvés dans la liste:', foundCandidature);
        } else {
          // Si pas trouvée dans la liste, essayer l'API directe
          this.loadFromAPI();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la liste des candidatures:', error);
        // En cas d'erreur, essayer quand même l'API directe
        this.loadFromAPI();
      }
    });
  }

  private loadFromAPI(): void {
    this.stagiaireService.getCandidatureDetail(this.candidatureId).subscribe({
      next: (candidature) => {
        this.candidature = candidature;
        this.loading = false;
        console.log('Détails candidature chargés depuis l\'API:', candidature);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        if (error.status === 403) {
          this.error = 'Accès non autorisé à cette candidature. Vous ne pouvez voir que vos propres candidatures.';
        } else {
          this.error = 'Erreur lors du chargement des détails de la candidature';
        }
        this.loading = false;
      }
    });
  }

  getStatusColor(statut: string): 'primary' | 'accent' | 'warn' {
    if (!statut) return 'accent';
    switch (statut) {
      case 'acceptee': return 'primary';
      case 'en_cours_evaluation': return 'accent';
      case 'refusee': return 'warn';
      default: return 'accent';
    }
  }

  getStatusLabel(statut: string): string {
    if (!statut) return 'Statut inconnu';
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'acceptee': return 'Acceptée';
      case 'refusee': return 'Refusée';
      case 'en_cours_evaluation': return 'En évaluation';
      default: return statut;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date non disponible';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  downloadCV(): void {
    if (this.candidature?.cv) {
      console.log('Téléchargement CV:', this.candidature.cv.substring(0, 100) + '...');
      this.downloadBase64File(this.candidature.cv, 'CV.pdf', 'application/pdf');
    } else {
      console.warn('Aucun CV disponible pour le téléchargement');
      this.snackBar.open('Aucun CV disponible pour le téléchargement', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  downloadLettreMotivation(): void {
    if (this.candidature?.lettre_motivation) {
      console.log('Téléchargement lettre:', this.candidature.lettre_motivation.substring(0, 100) + '...');
      this.downloadBase64File(this.candidature.lettre_motivation, 'Lettre_de_motivation.pdf', 'application/pdf');
    } else {
      console.warn('Aucune lettre de motivation disponible pour le téléchargement');
      this.snackBar.open('Aucune lettre de motivation disponible pour le téléchargement', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  // Méthode utilitaire pour télécharger un fichier base64
  private downloadBase64File(base64Data: string, fileName: string, mimeType: string): void {
    try {
      // Nettoyer les données base64 (enlever les préfixes si présents)
      let cleanBase64 = base64Data;
      if (base64Data.includes(',')) {
        cleanBase64 = base64Data.split(',')[1];
      }

      // Convertir base64 en bytes
      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Créer un lien de téléchargement temporaire
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL créée
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Téléchargement de ${fileName} initié avec succès`);
      this.snackBar.open(`${fileName} téléchargé avec succès`, 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      this.snackBar.open('Erreur lors du téléchargement du fichier', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  retirerCandidature(): void {
    if (this.candidature && confirm('Êtes-vous sûr de vouloir retirer cette candidature ?')) {
      this.stagiaireService.retirerCandidature(this.candidature.id).subscribe({
        next: (response) => {
          console.log('Réponse de suppression:', response);
          
          // Vérifier si la suppression est réussie
          if (response?.success || response?.message) {
            console.log('Candidature retirée avec succès');
            alert('Candidature retirée avec succès !');
            this.router.navigate(['/stagiaire/candidatures']);
          } else {
            // Même sans message explicite, si on arrive ici c'est que ça a marché
            console.log('Candidature retirée (pas de message de confirmation)');
            alert('Candidature retirée avec succès !');
            this.router.navigate(['/stagiaire/candidatures']);
          }
        },
        error: (error) => {
          console.error('Erreur lors du retrait:', error);
          console.log('Status de l\'erreur:', error.status);
          
          // Traiter les statuts de succès qui sont parfois traités comme erreurs
          if (error.status === 200 || error.status === 204) {
            console.log('Suppression réussie (status', error.status, 'traité comme erreur)');
            alert('Candidature retirée avec succès !');
            this.router.navigate(['/stagiaire/candidatures']);
            return;
          }
          
          // Vraies erreurs
          if (error.status === 403) {
            this.error = 'Vous n\'êtes pas autorisé à retirer cette candidature.';
          } else if (error.status === 404) {
            this.error = 'Cette candidature n\'existe plus ou a déjà été supprimée.';
          } else if (error.status === 0) {
            this.error = 'Problème de connexion. Vérifiez votre connexion internet.';
          } else {
            this.error = `Erreur lors du retrait de la candidature (${error.status}). Veuillez réessayer.`;
          }
        }
      });
    }
  }


  downloadAttestation(): void {
    if (!this.candidature || !this.candidature.id) {
      this.snackBar.open('Candidature non trouvée', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }
    this.stagiaireService.telechargerAttestation(this.candidature.id).subscribe({
      next: (blob: Blob) => {
        if (!blob) {
          this.snackBar.open('Aucune attestation disponible', 'Fermer', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
          return;
        }
        // Créer un lien de téléchargement pour le blob
  const fileName = `Attestation_${this.candidature?.id ?? ''}.pdf`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.snackBar.open(`${fileName} téléchargé avec succès`, 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err: any) => {
        this.snackBar.open('Erreur lors de la récupération de l\'attestation', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        console.error('Erreur récupération attestation:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/stagiaire/candidatures']);
  }
}
