import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id?: number;
  email: string;
  nom?: string;
  prenom?: string;
  role: 'stagiaire' | 'rh' | 'admin' | 'encadrant';
  token?: string;
}

export interface LoginCredentials {
  email: string;
  mot_de_passe: string; // Correspond au backend
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  numero_telephone: string;
  mot_de_passe: string;
  type: string; // Obligatoire : "stagiaire", "encadrant", "rh", "admin"
  stagiaire_info: {
    niveau_etude: string;
    etablissement: string;
  };
}

export interface AuthResponse {
  token: string; // Votre backend retourne juste le token
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/api/auth'; 
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_info';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getUserFromStorage();
    
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  // Connexion utilisateur - Adapté à votre backend
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          // Extraire les informations utilisateur du token JWT
          const userInfo = this.decodeJwtToken(response.token);
          if (userInfo) {
            this.handleLoginSuccess(response.token, userInfo);
          }
        }),
        catchError(error => {
          console.error('Erreur de connexion:', error);
          return throwError(() => this.handleLoginError(error));
        })
      );
  }

  // Décode le token JWT pour extraire les informations utilisateur
  private decodeJwtToken(token: string): any {
    try {
      // Vérifier que le token existe et est une chaîne de caractères
      if (!token || typeof token !== 'string') {
        console.error('Token invalide ou manquant:', token);
        return null;
      }

      // Vérifier que le token a le bon format JWT (3 parties séparées par des points)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Format de token JWT invalide. Le token doit avoir 3 parties:', token);
        return null;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const rawRole = payload.role || payload.authorities?.[0] || 'stagiaire';
      // Nettoyer le rôle en supprimant le préfixe ROLE_ s'il existe
      const cleanRole = rawRole.startsWith('ROLE_') ? rawRole.substring(5) : rawRole;
      
      return {
        id: payload.userId, // Utiliser userId depuis le JWT
        email: payload.sub, // Le subject contient l'email (username)
        role: cleanRole
      };
    } catch (error) {
      console.error('Erreur lors du décodage du token JWT:', error);
      console.error('Token reçu:', token);
      return null;
    }
  }

  // Déconnexion utilisateur
  logout(): void {
    // Votre backend n'a pas d'endpoint logout, on nettoie juste côté client
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Redirection vers la page de connexion
    this.router.navigate(['/login']);
  }

  // Méthode pour gérer les erreurs 403 liées aux utilisateurs non trouvés
  handleUserNotFoundError(): void {
    console.warn('🚨 === GESTION ERREUR UTILISATEUR NON TROUVÉ ===');
    console.warn('Problème détecté: L\'utilisateur dans le token n\'existe pas en base de données');
    
    const currentUser = this.getCurrentUser();
    const token = this.getToken();
    
    console.warn('Informations de débogage:');
    console.warn('- Utilisateur actuel:', currentUser);
    console.warn('- Token présent:', !!token);
    console.warn('- Email dans le token:', currentUser?.email);
    console.warn('- ID utilisateur:', currentUser?.id);
    
    console.warn('🔄 Nettoyage des données d\'authentification et redirection...');
    this.logout();
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Obtenir le token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Mettre à jour l'utilisateur actuel et le token
  updateCurrentUser(user: User, newToken: string): void {
    console.log('🔄 Mise à jour des informations utilisateur avec nouveau token');
    
    // Mettre à jour le token
    localStorage.setItem(this.TOKEN_KEY, newToken);
    
    // Mettre à jour les informations utilisateur
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Émettre le nouvel utilisateur
    this.currentUserSubject.next(user);
    
    console.log('✅ Utilisateur et token mis à jour');
  }

  // Vérifier le rôle de l'utilisateur
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  // Vérifier si l'utilisateur a au moins un des rôles
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  // Vérifier la validité du token
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return true;
    }
  }

  // Gérer le succès de connexion
  private handleLoginSuccess(token: string, userInfo: any): void {
    // Créer l'objet utilisateur
    const user: User = {
      id: userInfo.id,
      email: userInfo.email,
      role: userInfo.role,
      token: token
    };

    // Stocker le token et les informations utilisateur
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // Mettre à jour les observables
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);

    // Redirection automatique pour RH
    if (userInfo.role && userInfo.role.toLowerCase() === 'rh') {
      this.router.navigate(['/rh']);
    }
  }

  // Gérer l'erreur de connexion
  private handleLoginError(error: any): string {
    if (error.status === 401) {
      return 'Email ou mot de passe incorrect';
    } else if (error.status === 400) {
      return error.error || 'Données de connexion invalides';
    } else if (error.status === 0) {
      return 'Impossible de se connecter au serveur';
    } else if (error.error) {
      return error.error;
    } else {
      return 'Une erreur est survenue lors de la connexion';
    }
  }

  // Nettoyer les données d'authentification
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Obtenir l'utilisateur depuis le stockage
  private getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Erreur lors de la lecture des données utilisateur:', error);
      return null;
    }
  }

  // Créer les headers avec le token
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    
    if (!token) {
      console.error('No token available for authentication');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Vérifier la validité de la session
  checkSessionValidity(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return new Observable(subscriber => {
        subscriber.next(false);
        subscriber.complete();
      });
    }

    // Votre backend n'a pas d'endpoint de vérification, on vérifie côté client
    const isValid = !this.isTokenExpired(token);
    return new Observable(subscriber => {
      subscriber.next(isValid);
      subscriber.complete();
    });
  }

  // Récupérer le profil complet de l'utilisateur
  getUserProfile(): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    // Appel API pour récupérer les informations complètes de l'utilisateur
    const url = `/api/utilisateur/${currentUser.id}`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          // Mapper la réponse vers l'interface User
          const userWithProfile: User = {
            ...currentUser,
            nom: response.nom || currentUser.nom,
            prenom: response.prenom || currentUser.prenom
          };
          
          // Mettre à jour les informations stockées
          localStorage.setItem(this.USER_KEY, JSON.stringify(userWithProfile));
          this.currentUserSubject.next(userWithProfile);
          
          console.log('✅ Profil utilisateur mis à jour:', userWithProfile);
          return userWithProfile;
        }),
        catchError(error => {
          console.error('Erreur lors de la récupération du profil:', error);
          return throwError(() => error);
        })
      );
  }

  // Récupération de mot de passe - À implémenter si votre backend le supporte
  forgotPassword(email: string): Observable<any> {
    // TODO: Implémenter quand votre backend le supporte
    return new Observable(subscriber => {
      subscriber.next({ success: true, message: 'Fonctionnalité à venir' });
      subscriber.complete();
    });
  }

  // Inscription utilisateur - Adapté au backend (pas de token retourné)
  register(userData: RegisterData): Observable<any> {
    return this.http.post<any>('/api/utilisateurs', userData)
      .pipe(
        tap(response => {
          console.log('Inscription réussie:', response);
          // Pas de token retourné lors de l'inscription
          // L'utilisateur devra se connecter après inscription
        }),
        catchError(error => {
          console.error('Erreur d\'inscription:', error);
          return throwError(() => this.handleRegisterError(error));
        })
      );
  }

  // Gérer l'erreur d'inscription
  private handleRegisterError(error: any): string {
    if (error.status === 400) {
      if (error.error?.message?.includes('email')) {
        return 'Cette adresse email est déjà utilisée';
      }
      return error.error?.message || 'Données d\'inscription invalides';
    } else if (error.status === 409) {
      return 'Un compte avec cette adresse email existe déjà';
    } else if (error.status === 0) {
      return 'Impossible de se connecter au serveur';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Une erreur est survenue lors de l\'inscription';
    }
  }

  // Réinitialisation de mot de passe - À implémenter si votre backend le supporte
  resetPassword(token: string, newPassword: string): Observable<any> {
    // TODO: Implémenter quand votre backend le supporte
    return new Observable(subscriber => {
      subscriber.next({ success: true, message: 'Fonctionnalité à venir' });
      subscriber.complete();
    });
  }

  // Mise à jour du profil utilisateur - À implémenter si votre backend le supporte
  updateProfile(userData: Partial<User>): Observable<User> {
    // TODO: Implémenter quand votre backend le supporte
    return new Observable(subscriber => {
      subscriber.error(new Error('Fonctionnalité non implémentée'));
      subscriber.complete();
    });
  }

  // Changement de mot de passe - À implémenter si votre backend le supporte
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    // TODO: Implémenter quand votre backend le supporte
    return new Observable(subscriber => {
      subscriber.error(new Error('Fonctionnalité non implémentée'));
      subscriber.complete();
    });
  }
}
