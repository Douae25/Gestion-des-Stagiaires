import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-documents',
  template: `
    <div class="documents-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Mes documents</span>
      </mat-toolbar>
      
      <div class="content">
        <mat-card>
          <mat-card-content>
            <h2>Gestion des documents</h2>
            <p>Téléchargement et gestion des documents à implémenter...</p>
            <ul>
              <li>CV</li>
              <li>Lettre de motivation</li>
              <li>Attestations</li>
              <li>Relevés de notes</li>
            </ul>
            <button mat-raised-button color="primary" (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Retour au dashboard
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .documents-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .content {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
  `],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatToolbarModule]
})
export class DocumentsComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user || user.role !== 'stagiaire') {
        this.router.navigate(['/login']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/stagiaire/dashboard']);
  }
}
