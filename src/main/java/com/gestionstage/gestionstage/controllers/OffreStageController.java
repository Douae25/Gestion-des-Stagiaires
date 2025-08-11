package com.gestionstage.gestionstage.controllers;

import com.gestionstage.gestionstage.dtos.OffreStageDTO;
import com.gestionstage.gestionstage.services.OffreStageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/offres")
public class OffreStageController {

    @Autowired
    private OffreStageService offreStageService;

    @GetMapping
    @PreAuthorize("hasAnyRole('rh', 'admin')")
    public List<OffreStageDTO> getAllOffres() {
        return offreStageService.getAll();
    }

    @GetMapping("/actives")
    @PreAuthorize("hasAnyRole('stagiaire', 'rh', 'encadrant', 'admin')")
    public List<OffreStageDTO> getActives() {
        return offreStageService.getActives();
    }

    @PostMapping
    @PreAuthorize("hasRole('rh')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<OffreStageDTO> create(@RequestBody OffreStageDTO dto) {
        OffreStageDTO offre = offreStageService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(offre);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('stagiaire', 'rh', 'encadrant', 'admin')")
    public ResponseEntity<OffreStageDTO> getOffreById(@PathVariable Integer id) {
        OffreStageDTO offre = offreStageService.getById(id);
        return ResponseEntity.ok(offre);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('rh')")
    public ResponseEntity<OffreStageDTO> updateOffre(@PathVariable Integer id, @RequestBody OffreStageDTO dto) {
        OffreStageDTO offre = offreStageService.update(id, dto);
        return ResponseEntity.ok(offre);
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasRole('rh')")
    public ResponseEntity<String> changerStatut(@PathVariable Integer id, @RequestParam String value) {
        offreStageService.changerStatutOffre(id, value);
        return ResponseEntity.ok("Statut mis à jour");
    }

}
