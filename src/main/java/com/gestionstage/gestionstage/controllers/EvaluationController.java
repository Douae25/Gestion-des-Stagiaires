package com.gestionstage.gestionstage.controllers;

import com.gestionstage.gestionstage.dtos.EvaluationDTO;
import com.gestionstage.gestionstage.services.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/evaluations")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @PostMapping
    @PreAuthorize("hasRole('encadrant')")
    @ResponseStatus(HttpStatus.CREATED)
        public EvaluationDTO create(@RequestBody EvaluationDTO dto) {
            // On suppose que le front envoie id_utilisateur_encadrant et id_utilisateur_stagiaire
            Integer idEncadrantTechnique = evaluationService.getEncadrantIdByUtilisateurId(dto.getId_utilisateur_encadrant());
            Integer idStagiaireTechnique = evaluationService.getStagiaireIdByUtilisateurId(dto.getId_utilisateur_stagiaire());
            dto.setId_encadrant_fk(idEncadrantTechnique);
            dto.setId_stagiaire(idStagiaireTechnique);
            return evaluationService.createEvaluation(dto);
        }
}
