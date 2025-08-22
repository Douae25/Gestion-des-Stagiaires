import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-encadrant-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class EncadrantProfileComponent {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  editMode = false;
  showPasswordForm = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      nom: [{value: 'Dupont', disabled: true}, Validators.required],
      prenom: [{value: 'Jean', disabled: true}, Validators.required],
      email: [{value: 'jean.dupont@email.com', disabled: true}, [Validators.required, Validators.email]],
      telephone: [{value: '0612345678', disabled: true}, Validators.required],
      departement: [{value: 'Informatique', disabled: true}, Validators.required],
      currentPassword: ['']
    });
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
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

  // When editMode is enabled, enable fields
  ngDoCheck() {
    if (this.editMode) {
      this.profileForm.get('nom')?.enable();
      this.profileForm.get('prenom')?.enable();
      this.profileForm.get('email')?.enable();
      this.profileForm.get('telephone')?.enable();
      this.profileForm.get('departement')?.enable();
    }
  }
}
