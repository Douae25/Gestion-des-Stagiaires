
import { Component, EventEmitter, Output } from '@angular/core';
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

	@Output() search = new EventEmitter<string>();

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
