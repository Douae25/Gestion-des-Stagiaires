import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-encadrant-sidebar',
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule],
	templateUrl: './encadrant-sidebar.component.html',
	styleUrls: ['./encadrant-sidebar.component.scss']
})
export class EncadrantSidebarComponent {
	searchQuery: string = '';
	showProfileMenu: boolean = false;

	@Output() search = new EventEmitter<string>();

	menuItems = [
		{ label: 'Dashboard', icon: 'dashboard', route: '/encadrant/dashboard' },
		{ label: 'Stages en cours', icon: 'work', route: '/encadrant/stages-en-cours' },
		{ label: 'Évaluation', icon: 'grade', route: '/encadrant/evaluation' },
		{ label: 'Historique', icon: 'history', route: '/encadrant/historique' },
		{ label: 'Profil', icon: 'person', route: '/encadrant/profile' }
	];

	deconnexionItem = { label: 'Déconnexion', icon: 'logout', route: '/logout' };

	onSearch() {
		this.search.emit(this.searchQuery);
	}

	toggleProfileMenu() {
		this.showProfileMenu = !this.showProfileMenu;
	}

	closeProfileMenu() {
		this.showProfileMenu = false;
	}
}
