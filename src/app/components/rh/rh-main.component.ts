import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RhSidebarComponent } from './rh-sidebar.component';
import { RhNavbarComponent } from './rh-navbar.component';
import { RhSearchService } from '../../services/rh-search.service';

@Component({
  selector: 'app-rh-main',
  standalone: true,
  imports: [CommonModule, RouterModule, RhSidebarComponent, RhNavbarComponent],
  templateUrl: './rh-main.component.html',
  styleUrls: ['./rh-main.component.scss']
})
export class RhMainComponent {
  searchQuery: string = '';

  constructor(private rhSearchService: RhSearchService) {}

  onSearchQueryChange(query: string): void {
    console.log('🔍 Recherche globale RH reçue dans le composant principal:', query);
    this.searchQuery = query;
    this.rhSearchService.updateSearchQuery(query);
  }
}
