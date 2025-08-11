package com.gestionstage.gestionstage.dtos;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class RapportDTO {
    private Integer id;
    private String titre;
    private byte[] document;
    private Integer idCandidature;
}
 

