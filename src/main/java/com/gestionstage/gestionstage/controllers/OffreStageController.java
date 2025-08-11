package com.gestionstage.gestionstage.controllers;

import com.gestionstage.gestionstage.dtos.OffreStageDTO;
import com.gestionstage.gestionstage.services.OffreStageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/offres")
public class OffreStageController {

    @Autowired
    private OffreStageService offreStageService;

    @GetMapping
    public List<OffreStageDTO> getAllOffres() {
        return offreStageService.getAll();
    }

    @GetMapping("/actives")
    public List<OffreStageDTO> getActives() {
        return offreStageService.getActives();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OffreStageDTO create(@RequestBody OffreStageDTO dto) {
        return offreStageService.create(dto);
    }

    @GetMapping("/{id}")
public OffreStageDTO getOffreById(@PathVariable Integer id) {
    return offreStageService.getById(id);
}

@PutMapping("/{id}")
public OffreStageDTO updateOffre(@PathVariable Integer id, @RequestBody OffreStageDTO dto) {
    return offreStageService.update(id, dto);
}

@PatchMapping("/{id}/statut")
public ResponseEntity<Void> changerStatut(
        @PathVariable Integer id,
        @RequestParam String value
) {
    offreStageService.changerStatutOffre(id, value);
    return ResponseEntity.ok().build();
}

}
