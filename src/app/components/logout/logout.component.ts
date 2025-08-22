import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  template: '',
})
export class LogoutComponent {
  constructor(private authService: AuthService) {
    this.authService.logout();
  }
}
