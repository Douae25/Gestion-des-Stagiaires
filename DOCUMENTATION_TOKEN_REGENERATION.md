# Documentation - Mise à jour du profil avec régénération de token

## Problème résolu

Quand un utilisateur modifie son email dans son profil, l'ancien token JWT contient toujours l'ancien email, ce qui peut créer des incohérences d'authentification. 

## Solution implémentée

La méthode `updateUtilisateur` détecte maintenant les changements d'email et génère automatiquement un nouveau token JWT avec le nouvel email.

## Structure de la réponse

### Quand l'email N'A PAS changé :
```json
{
  "utilisateur": {
    "id_utilisateur": 24,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "type": "stagiaire",
    // ... autres champs
  },
  "emailChanged": false,
  "newToken": null
}
```

### Quand l'email A changé :
```json
{
  "utilisateur": {
    "id_utilisateur": 24,
    "nom": "Dupont", 
    "prenom": "Jean",
    "email": "nouveau.email@example.com",
    "type": "stagiaire",
    // ... autres champs
  },
  "emailChanged": true,
  "newToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Utilisation côté Frontend (Angular)

```typescript
// Dans votre service ou composant
updateProfile(userId: number, profileData: any) {
  return this.http.put<UtilisateurUpdateResponse>(`/api/utilisateurs/${userId}`, profileData)
    .pipe(
      tap(response => {
        // Vérifier si un nouveau token a été généré
        if (response.emailChanged && response.newToken) {
          // Mettre à jour le token stocké
          localStorage.setItem('authToken', response.newToken);
          
          // Optionnel : rediriger ou recharger pour appliquer le nouveau token
          console.log('Email modifié - nouveau token généré');
          
          // Vous pouvez aussi émettre un événement pour notifier l'app
          this.authService.updateToken(response.newToken);
        }
      })
    );
}
```

## Interface TypeScript

```typescript
export interface UtilisateurUpdateResponse {
  utilisateur: UtilisateurCompletDTO;
  emailChanged: boolean;
  newToken?: string;
}
```

## Avantages

1. **Sécurité** : Le token est toujours synchronisé avec les données utilisateur
2. **Transparence** : Le frontend sait quand un nouveau token est disponible
3. **Automatique** : Pas besoin de déconnexion/reconnexion manuelle
4. **Rétrocompatibilité** : Si l'email ne change pas, le comportement reste identique

## Tests

Pour tester la fonctionnalité :

1. **Test sans changement d'email** :
   - Modifier le nom/prénom seulement
   - Vérifier que `emailChanged = false` et `newToken = null`

2. **Test avec changement d'email** :
   - Modifier l'email
   - Vérifier que `emailChanged = true` et `newToken` contient le nouveau JWT
   - Décoder le token pour vérifier qu'il contient le nouvel email
