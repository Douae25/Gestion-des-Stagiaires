import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="unauthorized-container">
      <mat-card class="error-card">
        <mat-card-content>
          <div class="error-icon">
            <mat-icon>block</mat-icon>
          </div>
          <h1>Accès non autorisé</h1>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <div class="actions">
            <button mat-flat-button color="primary" routerLink="/login">
              <mat-icon>login</mat-icon>
              Se connecter
            </button>
            <button mat-button routerLink="/">
              <mat-icon>home</mat-icon>
              Retour à l'accueil
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .error-card {
      max-width: 400px;
      text-align: center;
      padding: 2rem;
    }

    .error-icon {
      margin-bottom: 1rem;
      
      mat-icon {
        font-size: 4rem;
        height: 4rem;
        width: 4rem;
        color: #f44336;
      }
    }

    h1 {
      color: #333;
      margin-bottom: 1rem;
    }

    p {
      color: #666;
      margin-bottom: 2rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      
      button {
        min-width: 120px;
        
        mat-icon {
          margin-right: 0.5rem;
        }
      }
    }
  `]
})
export class UnauthorizedComponent {}
