package com.gestionstage.gestionstage.dtos;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentaireDTO {
    private Integer id;
    private String contenu;
    private Integer idRapport;
}
