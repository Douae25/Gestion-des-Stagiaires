import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { StagiaireService, Stage, Rapport, StagesResponse } from '../../../services/stagiaire.service';
import { RapportDialogComponent, RapportDialogData, RapportDialogResult } from './rapport-dialog.component';

@Component({
  selector: 'app-mes-stages',
  templateUrl: './mes-stages.component.html',
  styleUrls: ['./mes-stages.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ]
})
export class MesStagesComponent implements OnInit {
  currentUser: User | null = null;
  stages: Stage[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private stagiaireService: StagiaireService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user || user.role !== 'stagiaire') {
        this.router.navigate(['/login']);
      } else {
        this.loadStages();
      }
    });
  }

  loadStages(): void {
    this.loading = true;
    this.error = null;
    
    this.stagiaireService.getStages().subscribe({
      next: (response: StagesResponse) => {
        console.log('Réponse stages:', response);
        this.stages = response.stages || [];
        this.loading = false;
        console.log('Stages assignés:', this.stages);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stages:', error);
        this.error = 'Erreur lors du chargement des stages';
        this.loading = false;
        this.stages = [];
      }
    });
  }

  getStatutColor(statut: string): 'primary' | 'accent' | 'warn' {
    switch (statut) {
      case 'en_cours': return 'primary';
      case 'termine': return 'accent';
      case 'interrompu': return 'warn';
      default: return 'accent';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'interrompu': return 'Interrompu';
      default: return statut;
    }
  }

  getStatutRapport(statut: string): 'primary' | 'accent' | 'warn' {
    switch (statut) {
      case 'valide': return 'primary';
      case 'en_attente': return 'accent';
      case 'refuse': return 'warn';
      case 'a_corriger': return 'warn';
      default: return 'accent';
    }
  }

  getStatutRapportLabel(statut: string): string {
    switch (statut) {
      case 'valide': return 'Validé';
      case 'en_attente': return 'En attente';
      case 'refuse': return 'Refusé';
      case 'a_corriger': return 'À corriger';
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

  isStageEnCours(stage: Stage): boolean {
    const aujourdhui = new Date();
    const dateFin = new Date(stage.date_fin);
    return stage.statut === 'en_cours' && aujourdhui <= dateFin;
  }

  canDepositRapportFinal(stage: Stage): boolean {
    const aujourdhui = new Date();
    const dateFin = new Date(stage.date_fin);
    return stage.statut === 'en_cours' && aujourdhui >= dateFin && !stage.rapport_final_soumis;
  }

  onButtonClick(inputElement: HTMLInputElement): void {
    inputElement.click();
  }

  onFileSelected(event: any, action: string, stage: Stage): void {
    const file = event.target.files[0];
    if (file) {
      if (action === 'convention') {
        this.deposerConvention(stage, file);
      } else if (action === 'rapport') {
        this.openRapportDialog(stage, file);
      }
    }
  }

  deposerConvention(stage: Stage, file: File): void {
    this.stagiaireService.deposerConventionStage(stage.candidature_id, file).subscribe({
      next: (response) => {
        console.log('✅ Convention déposée avec succès:', response);
        
        // Approche plus robuste : recréer complètement le tableau
        this.stages = this.stages.map(s => {
          if (s.id === stage.id) {
            return {
              ...s,
              convention_deposee: true,
              date_depot_convention: new Date().toISOString()
            };
          }
          return s;
        });
        
        console.log('🎯 Nouveau tableau stages:', this.stages);
        
        // Afficher une notification de succès
        this.snackBar.open('✅ Convention déposée avec succès ! Vous pouvez maintenant la consulter.', 'Fermer', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        
        // Ne plus recharger automatiquement - garder l'état local
        // L'utilisateur peut rafraîchir manuellement si nécessaire
      },
      error: (error) => {
        console.error('❌ Erreur lors du dépôt de la convention:', error);
        this.snackBar.open('❌ Erreur lors du dépôt de la convention. Veuillez réessayer.', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  openRapportDialog(stage: Stage, file: File): void {
    const dialogData: RapportDialogData = {
      stageId: stage.id,
      stageTitre: stage.titre
    };

    const dialogRef = this.dialog.open(RapportDialogComponent, {
      width: '500px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: RapportDialogResult) => {
      if (result) {
        this.deposerRapport(stage, file, result.type, result.titre);
      }
    });
  }

  deposerRapport(stage: Stage, file: File, type: 'hebdomadaire' | 'mensuel' | 'final', titre: string): void {
    this.stagiaireService.deposerRapport(stage.id, file, type, titre).subscribe({
      next: (rapport) => {
        this.snackBar.open('Rapport déposé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadStages(); // Recharger les stages
      },
      error: (error) => {
        console.error('Erreur lors du dépôt du rapport:', error);
        this.snackBar.open('Erreur lors du dépôt du rapport', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  telechargerAttestation(stage: Stage): void {
    this.stagiaireService.telechargerAttestation(stage.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Attestation_Stage_${stage.titre}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Attestation téléchargée', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        this.snackBar.open('Erreur lors du téléchargement de l\'attestation', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  telechargerRapport(rapport: Rapport): void {
    this.stagiaireService.telechargerRapport(rapport.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${rapport.nom_fichier || rapport.titre}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Rapport téléchargé', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        this.snackBar.open('Erreur lors du téléchargement du rapport', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Nouvelles méthodes pour la gestion des conventions
  telechargerModeleConvention(stage: Stage): void {
    this.stagiaireService.telechargerModeleConvention(stage.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Modele_Convention_Stage_${stage.titre}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Modèle de convention téléchargé', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error: any) => {
        console.error('Erreur lors du téléchargement du modèle:', error);
        this.snackBar.open('Erreur lors du téléchargement du modèle de convention', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  telechargerConvention(stage: Stage): void {
    // Utiliser l'ID de candidature au lieu de l'ID de stage
    this.stagiaireService.telechargerConventionCandidature(stage.candidature_id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ma_Convention_Stage_${stage.titre}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Ma convention téléchargée', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error: any) => {
        console.error('Erreur lors du téléchargement de ma convention:', error);
        this.snackBar.open('Erreur lors du téléchargement de ma convention', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  telechargerConventionSignee(stage: Stage): void {
    // Utiliser l'ID de candidature pour télécharger la convention signée
    this.stagiaireService.telechargerConventionSignee(stage.candidature_id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Convention_Signee_${stage.titre}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Convention signée téléchargée', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error: any) => {
        console.error('Erreur lors du téléchargement de la convention signée:', error);
        this.snackBar.open('Erreur lors du téléchargement de la convention signée', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/stagiaire/dashboard']);
  }
}
