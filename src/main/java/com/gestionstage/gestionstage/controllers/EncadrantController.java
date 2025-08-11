package com.gestionstage.gestionstage.controllers;

import com.gestionstage.gestionstage.entities.Encadrant;
import com.gestionstage.gestionstage.services.EncadrantService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/encadrants")
public class EncadrantController {

    private final EncadrantService encadrantService;

    public EncadrantController(EncadrantService encadrantService) {
        this.encadrantService = encadrantService;
    }

    @GetMapping
    @PreAuthorize("hasRole('rh')")
    public List<Encadrant> getAllEncadrants() {
        return encadrantService.getAllEncadrants();
    }
}
