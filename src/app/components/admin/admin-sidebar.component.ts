import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Gestion des utilisateurs', icon: 'group', route: '/admin/users' },
    { label: 'Gestion des stages', icon: 'work', route: '/admin/stages' },
    { label: 'Mon Profil', icon: 'person', route: '/admin/profile' }
  ];

  deconnexionItem = { label: 'Se déconnecter', icon: 'logout', route: '/logout' };
}

