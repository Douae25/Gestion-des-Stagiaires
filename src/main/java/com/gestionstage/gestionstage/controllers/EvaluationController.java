package com.gestionstage.gestionstage.controllers;

import com.gestionstage.gestionstage.dtos.EvaluationDTO;
import com.gestionstage.gestionstage.services.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/evaluations")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EvaluationDTO create(@RequestBody EvaluationDTO dto) {
        return evaluationService.createEvaluation(dto);
    }
}
