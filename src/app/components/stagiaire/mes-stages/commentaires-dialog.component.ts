import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-commentaires-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Commentaires du rapport</h2>
    <mat-dialog-content>
      <div *ngIf="data.commentaires && data.commentaires.length > 0; else noComments">
        <div *ngFor="let commentaire of data.commentaires" class="comment-item" style="margin-bottom:16px; padding:12px; border-radius:8px; background:#f8fafd; border:1px solid #e0e0e0;">
          <mat-icon style="vertical-align:middle; color:#1976d2; margin-right:8px;">comment</mat-icon>
          <span style="font-weight:500;">
            {{ commentaire.auteur ? commentaire.auteur : (data.rapport.encadrant?.nom && data.rapport.encadrant?.prenom ? (data.rapport.encadrant.nom + ' ' + data.rapport.encadrant.prenom) : 'Auteur inconnu') }}
          </span>
          <div style="margin-top:6px; color:#333;">{{ commentaire.contenu || commentaire.texte }}</div>
          <div style="font-size:12px; color:#888; margin-top:4px;">{{ commentaire.date_creation | date:'dd/MM/yyyy HH:mm' }}</div>
        </div>
      </div>
      <ng-template #noComments>
        <div style="text-align:center; color:#c00; padding:24px;">
          <mat-icon>info</mat-icon>
          Aucun commentaire pour ce rapport.
        </div>
      </ng-template>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="dialogRef.close()">Fermer</button>
    </mat-dialog-actions>
  `
})
export class CommentairesDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CommentairesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { commentaires: any[], rapport: any }
  ) {}
}
