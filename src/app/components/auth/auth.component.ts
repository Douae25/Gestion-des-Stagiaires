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
import { AuthService, LoginCredentials } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
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
    MatSnackBarModule
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  
  isLoading = false;
  hidePassword = true;
  currentView: 'login' | 'forgot-password' = 'login';
  
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Rediriger si déjà connecté
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.redirectToDashboard();
      }
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    const credentials: LoginCredentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showSuccessMessage('Connexion réussie !');
        this.redirectToDashboard();
      },
      error: (error) => {
        this.isLoading = false;
        // Si le message d'erreur est celui du compte bloqué
        if (typeof error === 'string' && error.includes('bloqué')) {
          this.showErrorMessage(error);
        } else {
          this.showErrorMessage(error || 'Erreur de connexion');
        }
      }
    });
  }

  onForgotPassword(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm);
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showSuccessMessage('Instructions envoyées par email');
        this.currentView = 'login';
      },
      error: (error) => {
        this.isLoading = false;
        this.showErrorMessage('Erreur lors de l\'envoi des instructions');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  switchToForgotPassword(): void {
    this.currentView = 'forgot-password';
    this.forgotPasswordForm.reset();
  }

  switchToLogin(): void {
    this.currentView = 'login';
    this.loginForm.reset();
  }

  switchToRegisterMode(): void {
    // Pour l'instant, on peut rediriger vers une page d'inscription
    // ou transformer cette page en mode inscription
    this.showSuccessMessage('Fonctionnalité d\'inscription à venir');
    // Optionnel: Redirection vers une page d'inscription dédiée
    // this.router.navigate(['/register']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  private redirectToDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      switch (user.role) {
        case 'stagiaire':
          this.router.navigate(['/stagiaire/dashboard']);
          break;
        case 'rh':
          this.router.navigate(['/rh/dashboard']);
          break;
        case 'admin':
          this.router.navigate(['/admin/dashboard']);
          break;
        case 'encadrant':
          this.router.navigate(['/encadrant/dashboard']);
          break;
        default:
          this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Getters pour le template
  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('mot_de_passe'); }
  get forgotEmailControl() { return this.forgotPasswordForm.get('email'); }

  getEmailErrorMessage(): string {
    const emailControl = this.currentView === 'login' ? this.emailControl : this.forgotEmailControl;
    if (emailControl?.hasError('required')) {
      return 'L\'email est requis';
    }
    if (emailControl?.hasError('email')) {
      return 'Format d\'email invalide';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.passwordControl?.hasError('required')) {
      return 'Le mot de passe est requis';
    }
    if (this.passwordControl?.hasError('minlength')) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return '';
  }
}
