# 🔐 Configuration de l'Authentification

## 📋 Vue d'ensemble

Cette application Angular est maintenant configurée pour fonctionner avec votre backend Spring Boot. Le système d'authentification utilise JWT (JSON Web Tokens) et gère les rôles utilisateur.

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend Spring Boot
```bash
# Assurez-vous que votre backend Spring Boot fonctionne sur le port 8080
# L'endpoint d'authentification doit être accessible sur : http://localhost:8080/api/auth/login
```

### 2. Démarrer l'Application Angular
```bash
npm run dev
```

### 3. Tester l'Authentification
- Allez sur : `http://localhost:4200/login`
- Ou testez directement : `http://localhost:4200/test-auth`

## 🔧 Configuration du Backend

### Endpoint d'Authentification
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request)
```

**URL :** `POST /api/auth/login`

**Corps de la requête :**
```json
{
  "email": "user@example.com",
  "mot_de_passe": "password123"
}
```

**Réponse attendue :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Structure du Token JWT
Le token JWT doit contenir :
- `sub` ou `email` : L'email de l'utilisateur
- `role` ou `authorities[0]` : Le rôle de l'utilisateur
- `exp` : Date d'expiration

**Exemple de payload :**
```json
{
  "sub": "user@example.com",
  "role": "stagiaire",
  "exp": 1735689600
}
```

## 🎯 Rôles Supportés

L'application gère automatiquement la redirection selon le rôle :

| Rôle | Route de Redirection |
|------|---------------------|
| `stagiaire` | `/stagiaire/dashboard` |
| `rh` | `/rh/dashboard` |
| `admin` | `/admin/dashboard` |
| `encadrant` | `/encadrant/dashboard` |

## 🔒 Sécurité

### Guards de Protection
- **`AuthGuard`** : Protège les routes nécessitant une authentification
- **`RoleGuard`** : Protège les routes selon le rôle spécifique
- **`GuestGuard`** : Empêche l'accès aux pages de connexion si déjà connecté

### Stockage Sécurisé
- Token JWT stocké dans `localStorage`
- Informations utilisateur chiffrées
- Vérification automatique de l'expiration du token

## 🧪 Test et Débogage

### Composant de Test
Accédez à `/test-auth` pour :
- Vérifier le statut de connexion
- Afficher les informations utilisateur
- Tester la validité du token
- Effectuer une déconnexion

### Console du Navigateur
Les logs d'authentification sont affichés dans la console :
- Tentatives de connexion
- Erreurs d'API
- Décodage des tokens JWT

## 🚨 Dépannage

### Erreur "Impossible de se connecter au serveur"
- Vérifiez que votre backend Spring Boot fonctionne
- Contrôlez la configuration du proxy dans `src/proxy.conf.json`
- Vérifiez que l'endpoint `/api/auth/login` est accessible

### Erreur "Token invalide"
- Vérifiez la structure du token JWT
- Contrôlez que le token contient `sub`/`email` et `role`
- Vérifiez la date d'expiration

### Redirection incorrecte
- Vérifiez que le rôle dans le token correspond aux valeurs attendues
- Contrôlez la configuration des routes dans `app.routes.ts`

## 📁 Structure des Fichiers

```
src/app/
├── components/
│   ├── auth/
│   │   └── login/           # Page de connexion
│   └── test-auth/           # Composant de test
├── services/
│   └── auth.service.ts      # Service d'authentification
├── guards/
│   └── auth.guard.ts        # Guards de protection
└── app.routes.ts            # Configuration des routes
```

## 🔄 Prochaines Étapes

1. **Créer les composants de dashboard** pour chaque rôle
2. **Implémenter la page d'inscription** (`/register`)
3. **Ajouter la gestion des mots de passe oubliés**
4. **Créer les composants de profil utilisateur**
5. **Implémenter la gestion des sessions**

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs de la console du navigateur
2. Contrôlez les logs de votre backend Spring Boot
3. Testez l'endpoint d'API directement avec Postman ou cURL
4. Vérifiez la configuration du proxy Angular

