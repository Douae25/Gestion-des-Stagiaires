import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService, RegisterData } from '../../services/auth.service';

// Interface pour correspondre exactement au DTO backend
export interface StagiaireInfo {
  niveau_etude: string;
  etablissement: string;
}

export interface UtilisateurCompletDTO {
  id_utilisateur?: number;
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  numero_telephone: string;
  type: 'stagiaire';
  stagiaire_info: StagiaireInfo;
  encadrant_info?: null; // Toujours null pour les stagiaires
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatStepperModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  personalInfoForm: FormGroup;
  academicInfoForm: FormGroup;
  
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  
  // Options pour les niveaux d'étude
  niveauxEtude = [
    { value: 'bac', label: 'BAC' },
    { value: 'bac+1', label: 'BAC+1' },
    { value: 'bac+2', label: 'BAC+2 (DUT, BTS)' },
    { value: 'bac+3', label: 'BAC+3 (Licence)' },
    { value: 'bac+4', label: 'BAC+4 (Master 1)' },
    { value: 'bac+5', label: 'BAC+5 (Master 2, Ingénieur)' },
    { value: 'bac+8', label: 'BAC+8+ (Doctorat)' }
  ];
  
  constructor() {
    this.personalInfoForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      numero_telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s\(\)]{10,15}$/)]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]]
    });

    this.academicInfoForm = this.fb.group({
      niveau_etude: ['', [Validators.required]],
      etablissement: ['', [Validators.required, Validators.minLength(2)]]
    });

    // Validation pour confirmer le mot de passe
    this.personalInfoForm.get('confirm_password')?.setValidators([
      Validators.required,
      this.passwordMatchValidator.bind(this)
    ]);
  }

  ngOnInit(): void {
    // Rediriger si déjà connecté
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.redirectToDashboard();
      }
    });
  }

  passwordMatchValidator(control: any): { [key: string]: any } | null {
    const password = this.personalInfoForm?.get('mot_de_passe')?.value;
    const confirmPassword = control.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onRegister(): void {
    if (this.personalInfoForm.invalid || this.academicInfoForm.invalid) {
      this.markAllFormGroupsTouched();
      this.showErrorMessage('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    this.isLoading = true;
    
    // Construire le DTO selon le format backend
    const registrationData: RegisterData = {
      nom: this.personalInfoForm.get('nom')?.value,
      prenom: this.personalInfoForm.get('prenom')?.value,
      email: this.personalInfoForm.get('email')?.value,
      mot_de_passe: this.personalInfoForm.get('mot_de_passe')?.value,
      numero_telephone: this.personalInfoForm.get('numero_telephone')?.value,
      type: 'stagiaire', // Obligatoire pour le backend
      stagiaire_info: {
        niveau_etude: this.academicInfoForm.get('niveau_etude')?.value,
        etablissement: this.academicInfoForm.get('etablissement')?.value
      }
    };

    // Appeler le service d'inscription
    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Réponse d\'inscription:', response);
        
        // Inscription réussie, rediriger vers la page de connexion
        this.showSuccessMessage('Inscription réussie ! Vous pouvez maintenant vous connecter avec vos identifiants.');
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000); // 3 secondes pour lire le message
      },
      error: (error) => {
        this.isLoading = false;
        this.showErrorMessage(error || 'Erreur lors de l\'inscription');
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private redirectToDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'stagiaire') {
      this.router.navigate(['/stagiaire/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private markAllFormGroupsTouched(): void {
    this.markFormGroupTouched(this.personalInfoForm);
    this.markFormGroupTouched(this.academicInfoForm);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Getters pour les validations
  get nomControl() { return this.personalInfoForm.get('nom'); }
  get prenomControl() { return this.personalInfoForm.get('prenom'); }
  get emailControl() { return this.personalInfoForm.get('email'); }
  get telephoneControl() { return this.personalInfoForm.get('numero_telephone'); }
  get passwordControl() { return this.personalInfoForm.get('mot_de_passe'); }
  get confirmPasswordControl() { return this.personalInfoForm.get('confirm_password'); }
  get niveauEtudeControl() { return this.academicInfoForm.get('niveau_etude'); }
  get etablissementControl() { return this.academicInfoForm.get('etablissement'); }

  // Messages d'erreur
  getFieldErrorMessage(fieldName: string): string {
    const control = this.personalInfoForm.get(fieldName) || this.academicInfoForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Format d\'email invalide';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    if (control?.hasError('pattern')) {
      return 'Format invalide';
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }
}
