import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';

@Component({
	selector: 'app-admin-profil',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './admin-profil.component.html',
	styleUrls: ['./admin-profil.component.scss']
})
export class AdminProfilComponent {
	allUser: User | null = null;
	profileForm: FormGroup;
	passwordForm: FormGroup;
	editMode = false;
	showPasswordForm = false;
	user: User | null = null;

	constructor(private fb: FormBuilder, private authService: AuthService) {
		this.profileForm = this.fb.group({
			nom: [{value: '', disabled: true}, Validators.required],
			prenom: [{value: '', disabled: true}, Validators.required],
			email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
			telephone: [{value: '', disabled: true}, Validators.required],
			// departement: [{value: '', disabled: true}, Validators.required],
			currentPassword: ['']
		});
		this.passwordForm = this.fb.group({
			oldPassword: ['', Validators.required],
			newPassword: ['', Validators.required],
			confirmPassword: ['', Validators.required]
		});
	}

	ngOnInit() {
		this.authService.getUserProfile().subscribe({
			next: (user: User) => {
				this.allUser = user;
				this.user = user;
				this.profileForm.patchValue({
					nom: user.nom || '',
					prenom: user.prenom || '',
					email: user.email || '',
					telephone: user.numero_telephone || '',
					  // departement: (user as any).departement || ''
				});
			},
			error: (err: any) => {
				console.error('Erreur chargement profil:', err);
			}
		});
	}

	cancelEdit() {
		this.editMode = false;
		this.profileForm.patchValue({ currentPassword: '' });
		this.profileForm.get('nom')?.disable();
		this.profileForm.get('prenom')?.disable();
		this.profileForm.get('email')?.disable();
		this.profileForm.get('telephone')?.disable();
		this.profileForm.get('departement')?.disable();
	}

	ngDoCheck() {
		if (this.editMode) {
			this.profileForm.get('nom')?.enable();
			this.profileForm.get('prenom')?.enable();
			this.profileForm.get('email')?.enable();
			this.profileForm.get('telephone')?.enable();
			this.profileForm.get('departement')?.enable();
		}
	}

	public saveProfile(): void {
		if (!this.user) return;
		const updatedData = {
			nom: this.profileForm.get('nom')?.value,
			prenom: this.profileForm.get('prenom')?.value,
			email: this.profileForm.get('email')?.value,
			numero_telephone: this.profileForm.get('telephone')?.value,
			// departement: this.profileForm.get('departement')?.value,
			type: this.user?.role || 'admin',
			mot_de_passe: this.profileForm.get('currentPassword')?.value || '',
			admin_info: {
				id_admin: this.user?.id,
			// departement: this.profileForm.get('departement')?.value
			}
		};
		console.log('Payload envoyé au backend:', updatedData);
		this.authService.updateUserProfile(this.user.id!, updatedData).subscribe({
			next: (res: any) => {
				this.editMode = false;
				this.profileForm.patchValue(updatedData);
				this.profileForm.get('nom')?.disable();
				this.profileForm.get('prenom')?.disable();
				this.profileForm.get('email')?.disable();
				this.profileForm.get('telephone')?.disable();
				this.profileForm.get('departement')?.disable();
			},
			error: (err: any) => {
				console.error('Erreur lors de la mise à jour du profil:', err);
			}
		});
	}

	public changePassword(): void {
		if (!this.user) return;
		const passwordPayload = {
			nom: this.user.nom,
			prenom: this.user.prenom,
			email: this.user.email,
			numero_telephone: this.user.numero_telephone,
			// departement: (this.user as any).departement,
			type: this.user.role || 'admin',
			mot_de_passe: this.passwordForm.get('newPassword')?.value,
			admin_info: {
				id_admin: this.user.id,
			// departement: (this.user as any).departement
			}
		};
		console.log('Payload changement mot de passe:', passwordPayload);
		this.authService.updateUserProfile(this.user.id!, passwordPayload).subscribe({
			next: (res: any) => {
				this.showPasswordForm = false;
				this.passwordForm.reset();
			},
			error: (err: any) => {
				console.error('Erreur lors du changement de mot de passe:', err);
			}
		});
	}
}
