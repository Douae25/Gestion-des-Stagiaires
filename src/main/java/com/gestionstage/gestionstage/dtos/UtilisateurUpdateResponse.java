package com.gestionstage.gestionstage.dtos;

import lombok.Data;

@Data
public class UtilisateurUpdateResponse {
    private UtilisateurCompletDTO utilisateur;
    private String newToken; // Nouveau token si l'email a changé
    private boolean emailChanged; // Indicateur si l'email a changé
    
    public UtilisateurUpdateResponse(UtilisateurCompletDTO utilisateur) {
        this.utilisateur = utilisateur;
        this.emailChanged = false;
        this.newToken = null;
    }
    
    public UtilisateurUpdateResponse(UtilisateurCompletDTO utilisateur, String newToken) {
        this.utilisateur = utilisateur;
        this.newToken = newToken;
        this.emailChanged = true;
    }
}
