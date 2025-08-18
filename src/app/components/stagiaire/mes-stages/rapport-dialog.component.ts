import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

export interface RapportDialogData {
  stageId: number;
  stageTitre: string;
}

export interface RapportDialogResult {
  type: 'hebdomadaire' | 'mensuel' | 'final';
  titre: string;
}

@Component({
  selector: 'app-rapport-dialog',
  template: `
    <h2 mat-dialog-title>Déposer un rapport de stage</h2>
    
    <mat-dialog-content>
      <p class="stage-info">Stage: <strong>{{ data.stageTitre }}</strong></p>
      
      <form [formGroup]="rapportForm" class="rapport-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Type de rapport</mat-label>
          <mat-select formControlName="type" required>
            <mat-option value="hebdomadaire">Rapport hebdomadaire</mat-option>
            <mat-option value="mensuel">Rapport mensuel</mat-option>
            <mat-option value="final">Rapport final</mat-option>
          </mat-select>
          <mat-error *ngIf="rapportForm.get('type')?.hasError('required')">
            Le type de rapport est requis
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Titre du rapport</mat-label>
          <input matInput formControlName="titre" required 
                 placeholder="Ex: Rapport hebdomadaire - Semaine 1">
          <mat-error *ngIf="rapportForm.get('titre')?.hasError('required')">
            Le titre est requis
          </mat-error>
          <mat-error *ngIf="rapportForm.get('titre')?.hasError('minlength')">
            Le titre doit contenir au moins 5 caractères
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" 
              (click)="onSubmit()" 
              [disabled]="rapportForm.invalid">
        Confirmer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .rapport-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .stage-info {
      margin-bottom: 16px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      border-left: 4px solid #3f51b5;
    }

    mat-dialog-content {
      min-width: 400px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule
  ]
})
export class RapportDialogComponent {
  rapportForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RapportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RapportDialogData,
    private fb: FormBuilder
  ) {
    this.rapportForm = this.fb.group({
      type: ['', Validators.required],
      titre: ['', [Validators.required, Validators.minLength(5)]]
    });

    // Mise à jour automatique du titre en fonction du type
    this.rapportForm.get('type')?.valueChanges.subscribe(type => {
      if (type && !this.rapportForm.get('titre')?.value) {
        let defaultTitle = '';
        switch (type) {
          case 'hebdomadaire':
            defaultTitle = 'Rapport hebdomadaire';
            break;
          case 'mensuel':
            defaultTitle = 'Rapport mensuel';
            break;
          case 'final':
            defaultTitle = 'Rapport final de stage';
            break;
        }
        this.rapportForm.patchValue({ titre: defaultTitle });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.rapportForm.valid) {
      const result: RapportDialogResult = {
        type: this.rapportForm.value.type,
        titre: this.rapportForm.value.titre
      };
      this.dialogRef.close(result);
    }
  }
}
