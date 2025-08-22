import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-encadrant-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './encadrant-navbar.component.html',
  styleUrls: ['./encadrant-navbar.component.scss']
})
export class EncadrantNavbarComponent {
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
