package com.gestionstage.gestionstage.controllers;

import com.gestionstage.gestionstage.dtos.UtilisateurCompletDTO;
import com.gestionstage.gestionstage.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;
import lombok.Data;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/utilisateurs")
public class UtilisateurController {

    @Autowired
    private UtilisateurService utilisateurService;

    @GetMapping
    @PreAuthorize("hasRole('admin')")
    public List<UtilisateurCompletDTO> getAll() {
        return utilisateurService.getAllUtilisateurs();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('admin', 'rh')")
    @ResponseStatus(HttpStatus.CREATED)
    public UtilisateurCompletDTO create(@Valid @RequestBody UtilisateurCompletDTO dto) {
        return utilisateurService.createUtilisateur(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('stagiaire', 'rh', 'encadrant', 'admin')")
    public UtilisateurCompletDTO update(@PathVariable Integer id, @Valid @RequestBody UtilisateurCompletDTO dto) {
        return utilisateurService.updateUtilisateur(id, dto);
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasRole('admin')")
    public UtilisateurCompletDTO updateStatut(@PathVariable Integer id, @RequestBody StatutRequest request) {
        return utilisateurService.changerStatut(id, request.getStatut());
    }

    @Data
    public static class StatutRequest {
        private String statut; // activer ou archiver
    }
}
