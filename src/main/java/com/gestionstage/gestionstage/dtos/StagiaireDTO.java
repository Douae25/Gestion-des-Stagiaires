package com.gestionstage.gestionstage.dtos;

import lombok.Data;

@Data
public class StagiaireDTO {
    private Integer id;
    private String nom;
    private String prenom;
    private String email;
    private Integer id_stagiaire;
    private String niveau_etude;
    private String etablissement;
    private String numero_telephone;
}
