import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Layout principal de l'application -->
    <div class="app-container">
      <!-- Ici on peut ajouter des éléments communs à toutes les pages -->
      <!-- comme une navbar globale, footer, etc. -->
      
      <!-- Router outlet : c'est ici qu'Angular injecte les pages -->
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      width: 100%;
    }
  `]
})
export class AppComponent {
  title = 'gestion-stage-frontend';
}
