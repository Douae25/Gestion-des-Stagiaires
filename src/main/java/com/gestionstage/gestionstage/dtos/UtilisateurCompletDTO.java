package com.gestionstage.gestionstage.dtos;

import lombok.Data;

import jakarta.validation.constraints.*;

@Data
public class UtilisateurCompletDTO {

    private Integer id_utilisateur;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @Email(message = "L'email doit être valide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String mot_de_passe;

    @Pattern(regexp = "\\d{10,15}", message = "Le numéro de téléphone doit contenir entre 10 et 15 chiffres")
    private String numero_telephone;

    @NotBlank(message = "Le type est obligatoire (stagiaire, encadrant, rh, admin)")
    private String type;

    private String statut;

    private StagiaireDTO stagiaire_info;
    private EncadrantDTO encadrant_info;
}

