import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmCancelData {
  titre: string;
  statut: string;
}

@Component({
  selector: 'app-confirm-cancel-dialog',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>Confirmer l'annulation</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p>Êtes-vous sûr de vouloir annuler votre candidature pour :</p>
        <div class="candidature-info">
          <strong>{{ data.titre }}</strong>
        </div>
        <p class="warning-text">
          <mat-icon>info</mat-icon>
          Cette action est irréversible. Vous devrez postuler à nouveau si vous changez d'avis.
        </p>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          Annuler
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()" class="confirm-btn">
          <mat-icon>delete</mat-icon>
          Confirmer l'annulation
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      max-width: 400px;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .warning-icon {
      color: #ff9800;
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }
    
    .dialog-content {
      margin-bottom: 1rem;
    }
    
    .candidature-info {
      background: #f5f5f5;
      padding: 0.75rem;
      border-radius: 8px;
      margin: 1rem 0;
      border-left: 4px solid #2196f3;
    }
    
    .warning-text {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      color: #666;
      font-size: 0.9rem;
      margin-top: 1rem;
      padding: 0.75rem;
      background: #fff3cd;
      border-radius: 8px;
      border-left: 4px solid #ffc107;
    }
    
    .warning-text mat-icon {
      color: #ff9800;
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
      margin-top: 0.1rem;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1rem 0 0 0;
    }
    
    .cancel-btn {
      color: #666;
    }
    
    .confirm-btn {
      background: #f44336;
      color: white;
    }
    
    .confirm-btn:hover {
      background: #d32f2f;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ConfirmCancelDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmCancelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmCancelData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
