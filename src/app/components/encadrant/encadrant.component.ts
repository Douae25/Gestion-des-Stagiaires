import { Component } from '@angular/core';
import { EncadrantSidebarComponent } from './encadrant-sidebar.component';
import { EncadrantNavbarComponent } from './encadrant-navbar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-encadrant',
  standalone: true,
  imports: [EncadrantSidebarComponent, EncadrantNavbarComponent, RouterModule],
  templateUrl: './encadrant.component.html',
  styleUrls: ['./encadrant.component.scss']
})
export class EncadrantComponent {}
