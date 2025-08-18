import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { StagiaireService } from '../../../services/stagiaire.service';

export interface PostulerDialogData {
  offre: any;
}

@Component({
  selector: 'app-postuler',
  templateUrl: './postuler.component.html',
  styleUrls: ['./postuler.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ]
})
export class PostulerComponent implements OnInit {
  candidatureForm!: FormGroup;
  loading = false;
  selectedCvFile: File | null = null;
  selectedLettreFile: File | null = null;
  offre: any = null;
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private stagiaireService: StagiaireService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<PostulerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PostulerDialogData
  ) {
    this.offre = data.offre;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'stagiaire') {
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();
  }

  initForm(): void {
    this.candidatureForm = this.fb.group({
      cv: ['', Validators.required],
      lettre_motivation_file: ['', Validators.required]
    });
  }

  onCvFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('Veuillez sélectionner un fichier PDF ou Word', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Le fichier CV ne doit pas dépasser 5MB', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.selectedCvFile = file;
      this.candidatureForm.patchValue({ cv: file.name });
    }
  }

  onLettreFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('Veuillez sélectionner un fichier PDF ou Word', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Le fichier de lettre de motivation ne doit pas dépasser 5MB', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.selectedLettreFile = file;
      this.candidatureForm.patchValue({ lettre_motivation_file: file.name });
    }
  }

  onSubmit(): void {
    if (this.candidatureForm.valid && this.selectedCvFile && this.selectedLettreFile) {
      this.loading = true;

      // Créer FormData pour l'envoi des fichiers
      const formData = new FormData();
      formData.append('id_utilisateur', this.currentUser.id.toString()); // Corrigé: id_utilisateur au lieu de id_stagiaire
      formData.append('id_offre', this.offre.id.toString());
      formData.append('statut', 'en_attente');
      // Format de date pour le backend (LocalDate) : YYYY-MM-DD
      formData.append('date_soumission', new Date().toISOString().split('T')[0]);
      formData.append('cv', this.selectedCvFile);
      formData.append('lettre_motivation', this.selectedLettreFile); // Nom corrigé

      console.log('Envoi de la candidature avec les données:', {
        id_utilisateur: this.currentUser.id, // Corrigé dans le log aussi
        id_offre: this.offre.id,
        date_soumission: new Date().toISOString().split('T')[0],
        cv_name: this.selectedCvFile.name,
        lettre_motivation_name: this.selectedLettreFile.name
      });

      // Debug : vérifier l'utilisateur actuel et son rôle
      console.log('Utilisateur actuel complet:', this.currentUser);
      console.log('Token JWT:', this.authService.getToken());

      this.stagiaireService.postulerOffre(formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Candidature envoyée avec succès!', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur lors de l\'envoi de la candidature:', error);
          console.error('Status:', error.status);
          console.error('Error details:', error.error);
          
          let errorMessage = 'Une erreur est survenue lors de l\'envoi de la candidature';
          
          if (error.status === 400) {
            errorMessage = 'Données de candidature invalides';
          } else if (error.status === 403) {
            errorMessage = 'Accès refusé. Vérifiez que vous êtes bien connecté en tant que stagiaire.';
            console.error('Erreur 403 - Token JWT:', this.authService.getToken());
            console.error('Utilisateur actuel:', this.authService.getCurrentUser());
          } else if (error.status === 409) {
            errorMessage = 'Vous avez déjà postulé pour cette offre';
          } else if (error.status === 500) {
            // Vérifier si c'est une erreur de contrainte de clé étrangère
            if (error.error && typeof error.error === 'string' && 
                error.error.includes('foreign key constraint fails')) {
              errorMessage = 'Erreur de base de données : Votre profil stagiaire n\'est pas correctement configuré. Contactez l\'administrateur.';
            } else if (error.error?.message?.includes('foreign key') || 
                       error.error?.message?.includes('constraint')) {
              errorMessage = 'Erreur de base de données : Votre profil stagiaire n\'est pas correctement configuré. Contactez l\'administrateur.';
            } else {
              errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
            }
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.candidatureForm.controls).forEach(key => {
      this.candidatureForm.get(key)?.markAsTouched();
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.candidatureForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} est requis`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'cv': 'Le CV',
      'lettre_motivation_file': 'Le fichier de lettre de motivation'
    };
    return labels[fieldName] || fieldName;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
