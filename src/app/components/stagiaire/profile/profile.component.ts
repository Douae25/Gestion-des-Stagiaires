import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { StagiaireService, StagiaireProfile } from '../../../services/stagiaire.service';
import { UtilisateurUpdateResponse } from '../../../models/utilisateur-update-response.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  loading = false;
  saving = false;
  profile: StagiaireProfile | null = null;
  
  // Visibilité des mots de passe
  hideNewPassword = true;
  hideConfirmPassword = true;

  // Options pour les niveaux d'étude (identiques à celles de l'inscription)
  niveauxEtude = [
    { value: 'bac', label: 'BAC' },
    { value: 'bac+1', label: 'BAC+1' },
    { value: 'bac+2', label: 'BAC+2 (DUT, BTS)' },
    { value: 'bac+3', label: 'BAC+3 (Licence)' },
    { value: 'bac+4', label: 'BAC+4 (Master 1)' },
    { value: 'bac+5', label: 'BAC+5 (Master 2, Ingénieur)' },
    { value: 'bac+8', label: 'BAC+8+ (Doctorat)' }
  ];

  // Méthode pour normaliser et trouver la valeur correspondante
  private findMatchingNiveauEtude(dbValue: string): string {
    if (!dbValue) return '';
    
    const normalizedDbValue = dbValue.toLowerCase().trim();
    console.log('🔍 Recherche de correspondance pour:', normalizedDbValue);
    
    // Recherche exacte d'abord
    const exactMatch = this.niveauxEtude.find(niveau => niveau.value === normalizedDbValue);
    if (exactMatch) {
      console.log('✅ Correspondance exacte trouvée:', exactMatch.value);
      return exactMatch.value;
    }
    
    // Recherche flexible (enlever espaces, tirets, etc.)
    const flexibleMatch = this.niveauxEtude.find(niveau => {
      const cleanNiveau = niveau.value.replace(/[\s\-+]/g, '').toLowerCase();
      const cleanDb = normalizedDbValue.replace(/[\s\-+]/g, '').toLowerCase();
      return cleanNiveau === cleanDb;
    });
    
    if (flexibleMatch) {
      console.log('✅ Correspondance flexible trouvée:', flexibleMatch.value);
      return flexibleMatch.value;
    }
    
    console.log('❌ Aucune correspondance trouvée pour:', dbValue);
    console.log('📋 Valeurs disponibles:', this.niveauxEtude.map(n => n.value));
    return dbValue; // Retourner la valeur originale si pas de correspondance
  }

  // Validation pour la correspondance des mots de passe
  private passwordMatchValidator(control: any): { [key: string]: any } | null {
    const newPassword = this.profileForm?.get('nouveau_mot_de_passe')?.value;
    const confirmPassword = control.value;
    
    // Si aucun nouveau mot de passe n'est saisi, pas besoin de validation
    if (!newPassword && !confirmPassword) {
      return null;
    }
    
    // Si un nouveau mot de passe est saisi, vérifier la correspondance
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    
    return null;
  }

  // Basculer la visibilité des mots de passe
  togglePasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.hideNewPassword = !this.hideNewPassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private stagiaireService: StagiaireService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      numero_telephone: [''],
      niveau_etude: [''],
      etablissement: [''],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]], // Mot de passe actuel
      nouveau_mot_de_passe: [''], // Nouveau mot de passe (optionnel)
      confirmer_mot_de_passe: [''] // Confirmation nouveau mot de passe
    });

    // Ajouter la validation pour la confirmation du mot de passe
    this.profileForm.get('confirmer_mot_de_passe')?.setValidators([
      this.passwordMatchValidator.bind(this)
    ]);

    // Ajouter la validation conditionnelle pour le nouveau mot de passe
    this.profileForm.get('nouveau_mot_de_passe')?.valueChanges.subscribe(value => {
      const confirmControl = this.profileForm.get('confirmer_mot_de_passe');
      
      if (value) {
        // Si un nouveau mot de passe est saisi, ajouter les validations
        this.profileForm.get('nouveau_mot_de_passe')?.setValidators([
          Validators.minLength(8)
        ]);
        confirmControl?.setValidators([
          Validators.required,
          this.passwordMatchValidator.bind(this)
        ]);
      } else {
        // Si pas de nouveau mot de passe, retirer les validations
        this.profileForm.get('nouveau_mot_de_passe')?.clearValidators();
        confirmControl?.setValidators([
          this.passwordMatchValidator.bind(this)
        ]);
      }
      
      this.profileForm.get('nouveau_mot_de_passe')?.updateValueAndValidity({ emitEvent: false });
      confirmControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user || user.role !== 'stagiaire') {
        this.router.navigate(['/login']);
      } else {
        this.loadProfile();
      }
    });
  }

  loadProfile(): void {
    this.loading = true;
    
    this.stagiaireService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        console.log('📋 Profil récupéré de la BD:', profile);
        console.log('🎓 Informations académiques:', profile.stagiaire_info);
        console.log('📚 Niveau d\'étude récupéré:', profile.stagiaire_info?.niveau_etude);
        console.log('🏫 Établissement récupéré:', profile.stagiaire_info?.etablissement);
        
        // Normaliser le niveau d'étude pour correspondre au dropdown
        const niveauEtudeValue = this.findMatchingNiveauEtude(profile.stagiaire_info?.niveau_etude || '');
        
        this.profileForm.patchValue({
          nom: profile.nom,
          prenom: profile.prenom,
          email: profile.email,
          numero_telephone: profile.numero_telephone || '',
          niveau_etude: niveauEtudeValue,
          etablissement: profile.stagiaire_info?.etablissement || ''
        });
        
        console.log('✅ Formulaire mis à jour avec les valeurs:');
        console.log('- Niveau d\'étude original BD:', profile.stagiaire_info?.niveau_etude);
        console.log('- Niveau d\'étude normalisé:', niveauEtudeValue);
        console.log('- Niveau d\'étude dans formulaire:', this.profileForm.get('niveau_etude')?.value);
        console.log('- Établissement dans formulaire:', this.profileForm.get('etablissement')?.value);
        
        // Vérifier si la valeur est bien dans la liste
        const isValidValue = this.niveauxEtude.some(niveau => niveau.value === niveauEtudeValue);
        console.log('🔍 Valeur valide dans dropdown:', isValidValue);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        
        // Gestion spéciale pour les erreurs 403 liées aux utilisateurs non trouvés
        if (error.status === 403) {
          this.snackBar.open('⚠️ Problème d\'authentification détecté. Reconnexion en cours...', 'Fermer', {
            duration: 8000,
            panelClass: ['error-snackbar']
          });
          // La déconnexion sera gérée automatiquement par le service
          // Attendre un peu avant de rediriger pour laisser le temps de lire le message
          setTimeout(() => {
            console.log('Redirection vers la page de connexion...');
          }, 2000);
        } else {
          this.snackBar.open('Erreur lors du chargement du profil', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.profile) {
      this.saving = true;
      const formData = this.profileForm.value;
      
      // Log détaillé des informations
      console.log('=== MISE À JOUR PROFIL - DEBUG ===');
      console.log('Valeurs du formulaire:');
      console.log('- niveau_etude:', formData.niveau_etude);
      console.log('- etablissement:', formData.etablissement);
      console.log('- Changement de mot de passe demandé:', !!formData.nouveau_mot_de_passe);
      console.log('Profile actuel - stagiaire_info:', this.profile.stagiaire_info);
      
      // Vérifier si un changement de mot de passe est demandé
      if (formData.nouveau_mot_de_passe) {
        // Utiliser le nouveau mot de passe dans les données de mise à jour
        console.log('🔐 Changement de mot de passe inclus dans la mise à jour');
        this.updateProfileWithNewPassword(formData);
      } else {
        // Seulement mettre à jour le profil avec le mot de passe actuel pour la validation
        this.updateProfileInfo(formData);
      }
    }
  }

  updateProfileWithNewPassword(formData: any): void {
    if (!this.profile) {
      console.error('Profil non chargé');
      this.saving = false;
      return;
    }
      
    const updateData: Partial<StagiaireProfile> = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      numero_telephone: formData.numero_telephone,
      type: this.profile.type || 'stagiaire',
      mot_de_passe: formData.nouveau_mot_de_passe, // Utiliser le nouveau mot de passe
      stagiaire_info: {
        ...this.profile.stagiaire_info, // Garder les autres infos existantes D'ABORD
        niveau_etude: formData.niveau_etude,     // PUIS les nouvelles valeurs
        etablissement: formData.etablissement    // qui vont écraser les anciennes
      }
    };

    console.log('🔐 Données de mise à jour avec nouveau mot de passe:', { ...updateData, mot_de_passe: '[HIDDEN]' });

    this.stagiaireService.updateProfile(updateData).subscribe({
      next: (response: UtilisateurUpdateResponse) => {
        console.log('✅ Profil et mot de passe mis à jour avec succès:', response);
        
        // Mettre à jour le profil avec les nouvelles données
        this.profile = response.utilisateur;
        
        let message = 'Profil et mot de passe mis à jour avec succès';
        
        // Réinitialiser les champs de mot de passe
        this.profileForm.patchValue({
          mot_de_passe: '',
          nouveau_mot_de_passe: '',
          confirmer_mot_de_passe: ''
        });
        
        this.saving = false;
        
        // Vérifier si l'email a changé
        if (response.emailChanged && response.newToken) {
          message += '. Votre email a été modifié et votre session a été mise à jour automatiquement.';
          this.snackBar.open(message, 'Fermer', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          // Optionnel : Recharger les données du profil pour être sûr
          setTimeout(() => {
            this.loadProfile();
          }, 1000);
        } else {
          this.snackBar.open(message, 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        
        let errorMessage = 'Erreur lors de la mise à jour du profil et du mot de passe';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 400) {
          errorMessage = 'Données invalides';
        } else if (error.status === 404) {
          errorMessage = 'Profil non trouvé';
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.saving = false;
      }
    });
  }

  private updateProfileInfo(formData: any): void {
    if (!this.profile) {
      console.error('Profil non chargé');
      this.saving = false;
      return;
    }
      
    const updateData: Partial<StagiaireProfile> = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      numero_telephone: formData.numero_telephone,
      type: this.profile.type || 'stagiaire',
      mot_de_passe: formData.mot_de_passe, // Inclure le mot de passe saisi
      stagiaire_info: {
        ...this.profile.stagiaire_info, // Garder les autres infos existantes D'ABORD
        niveau_etude: formData.niveau_etude,     // PUIS les nouvelles valeurs
        etablissement: formData.etablissement    // qui vont écraser les anciennes
      }
    };

    console.log('Données préparées pour envoi:');
    console.log('- stagiaire_info.niveau_etude:', updateData.stagiaire_info?.niveau_etude);
    console.log('- stagiaire_info.etablissement:', updateData.stagiaire_info?.etablissement);
    console.log('- Changement détecté pour établissement:', 
      formData.etablissement !== this.profile.stagiaire_info?.etablissement ? 
      `${this.profile.stagiaire_info?.etablissement} → ${formData.etablissement}` : 
      'Aucun changement');
    console.log('📤 Données complètes envoyées:', { ...updateData, mot_de_passe: '[HIDDEN]' });

    this.stagiaireService.updateProfile(updateData).subscribe({
      next: (response: UtilisateurUpdateResponse) => {
        // Mettre à jour le profil avec les nouvelles données
        this.profile = response.utilisateur;
        this.saving = false;
        
        let message = 'Profil mis à jour avec succès';
        if (formData.nouveau_mot_de_passe) {
          message = 'Profil et mot de passe mis à jour avec succès';
          // Réinitialiser les champs de mot de passe
          this.profileForm.patchValue({ 
            mot_de_passe: '',
            nouveau_mot_de_passe: '',
            confirmer_mot_de_passe: ''
          });
        } else {
          // Réinitialiser seulement le champ mot de passe actuel
          this.profileForm.patchValue({ mot_de_passe: '' });
        }
        
        // Vérifier si l'email a changé
        if (response.emailChanged && response.newToken) {
          message += '. Votre email a été modifié et votre session a été mise à jour automatiquement.';
          this.snackBar.open(message, 'Fermer', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          // Optionnel : Recharger les données du profil pour être sûr
          setTimeout(() => {
            this.loadProfile();
          }, 1000);
        } else {
          this.snackBar.open(message, 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        console.error('Détails de l\'erreur:', error.error);
        
        let errorMessage = 'Erreur lors de la mise à jour du profil';
        if (error.status === 400 && error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = 'Mot de passe incorrect';
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.saving = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/stagiaire/dashboard']);
  }
}
