import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing/landing.component';
import { OffreStageService } from './services/offre-stage.service';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      HttpClientModule,
      BrowserAnimationsModule,
      MatProgressSpinnerModule,
      MatButtonModule,
      MatDialogModule,
      MatSnackBarModule,
      MatIconModule,
      MatFormFieldModule,
      MatInputModule,
      MatChipsModule
    ),
    OffreStageService,
    provideRouter([])
  ]
};

bootstrapApplication(AppComponent, {
  providers: [
    appConfig.providers,
    LandingComponent
  ]
}).catch(err => console.error(err));
