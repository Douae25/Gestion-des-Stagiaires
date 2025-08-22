package com.gestionstage.gestionstage.dtos;

import lombok.Data;
import java.util.List;
import java.time.LocalDate;

@Data
public class CandidatureAvecRapportFinalEtEvaluationDTO {
    private CandidatureDTO candidature;
    private StagiaireDTO stagiaire;
    private OffreStageDTO offre;
    private RapportDTO rapportFinal;
    private EvaluationDTO evaluation;
}
