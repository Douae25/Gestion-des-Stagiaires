export interface UtilisateurUpdateResponse {
  utilisateur: any; // Ou votre interface utilisateur existante
  emailChanged: boolean;
  newToken?: string;
}
