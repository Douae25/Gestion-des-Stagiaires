# Instructions pour gérer le changement d'email côté Frontend

## Problème identifié

Quand un utilisateur modifie son email, le token JWT contient encore l'ancien email, ce qui cause une erreur "Utilisateur non trouvé" car l'ancien email n'existe plus en base.

## Solution implémentée côté Backend

1. ✅ Détection automatique des changements d'email
2. ✅ Génération d'un nouveau token avec le nouvel email
3. ✅ Retour d'une réponse indiquant si un nouveau token est disponible

## Solution requise côté Frontend

### 1. Gérer la réponse de mise à jour du profil

```typescript
updateProfile(profileData: any) {
  return this.http.put<UtilisateurUpdateResponse>(`/api/utilisateurs/${userId}`, profileData)
    .pipe(
      tap(response => {
        if (response.emailChanged && response.newToken) {
          // IMPORTANT: Remplacer immédiatement le token
          this.authService.setToken(response.newToken);
          
          // Optionnel: Notifier l'utilisateur
          this.showMessage('Email modifié avec succès. Vous restez connecté.');
          
          // Optionnel: Recharger les données utilisateur
          this.authService.reloadUserData();
        }
      }),
      catchError(error => {
        if (error.status === 500 && error.message?.includes('Utilisateur non trouvé')) {
          // Si on arrive ici, c'est que l'utilisateur utilise un ancien token
          this.showMessage('Session expirée après modification d\'email. Veuillez vous reconnecter.');
          this.authService.logout();
        }
        return throwError(error);
      })
    );
}
```

### 2. Service d'authentification modifié

```typescript
@Injectable()
export class AuthService {
  private tokenKey = 'authToken';
  
  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    // Mettre à jour les headers HTTP immédiatement
    this.updateHttpHeaders(token);
  }
  
  private updateHttpHeaders(token: string) {
    // Mise à jour des intercepteurs ou headers par défaut
    // selon votre implémentation
  }
  
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }
  
  reloadUserData() {
    // Recharger les données utilisateur avec le nouveau token
    return this.getCurrentUser().subscribe();
  }
}
```

### 3. Intercepteur HTTP mis à jour

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Toujours récupérer le token le plus récent
    const token = localStorage.getItem('authToken');
    
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}
```

## Flux recommandé

1. **Utilisateur modifie son email** → Frontend envoie PUT /utilisateurs/{id}
2. **Backend détecte le changement** → Génère nouveau token
3. **Frontend reçoit la réponse** → Remplace immédiatement le token stocké
4. **Requêtes suivantes** → Utilisent automatiquement le nouveau token

## Test de validation

Pour tester que tout fonctionne :

1. Se connecter avec un compte
2. Modifier l'email dans le profil
3. Vérifier que la réponse contient `emailChanged: true` et `newToken`
4. Vérifier que les requêtes suivantes fonctionnent sans erreur
5. Vérifier qu'un refresh de la page ne cause pas de déconnexion

## Cas d'erreur à gérer

- **Si l'utilisateur ignore le nouveau token** → Déconnexion automatique
- **Si une erreur réseau survient** → Retry avec gestion d'erreur
- **Si le token est malformé** → Déconnexion et redirection login

Cette approche garantit une expérience utilisateur fluide sans déconnexion forcée lors du changement d'email.
