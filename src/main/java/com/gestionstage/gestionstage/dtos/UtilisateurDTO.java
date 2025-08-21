package com.gestionstage.gestionstage.dtos;

import lombok.Data;

@Data
public class UtilisateurDTO {
    private Integer id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
}
