
import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-admin-navbar',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	templateUrl: './admin-navbar.component.html',
	styleUrls: ['./admin-navbar.component.scss']
})
export class AdminNavbarComponent {
	searchQuery: string = '';
	showProfileMenu: boolean = false;
	user: User | null = null;

	@Output() search = new EventEmitter<string>();

	constructor(private authService: AuthService) {
		this.user = this.authService.getCurrentUser();
		// Mettre à jour l'utilisateur si le profil change
		this.authService.currentUser$.subscribe(u => {
			this.user = u;
		});
	}

	onSearch() {
		this.search.emit(this.searchQuery);
	}

	toggleProfileMenu() {
		this.showProfileMenu = !this.showProfileMenu;
	}

	closeProfileMenu() {
		this.showProfileMenu = false;
	}
	getUserName(): string {
		if (this.user) {
			if (this.user.nom) return this.user.nom;
			if (this.user.email) return this.user.email;
		}
		return 'Admin';
	}

	getUserRole(): string {
		if (this.user && this.user.role) return this.user.role;
		return 'Admin';
	}

	getUserEmail(): string {
		if (this.user && this.user.email) return this.user.email;
		return '';
	}


	
}
