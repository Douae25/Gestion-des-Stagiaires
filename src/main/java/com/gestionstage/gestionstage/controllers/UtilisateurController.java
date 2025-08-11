package com.gestionstage.gestionstage.controllers;

import com.gestionstage.gestionstage.dtos.UtilisateurCompletDTO;
import com.gestionstage.gestionstage.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    public List<UtilisateurCompletDTO> getAll() {
        return utilisateurService.getAllUtilisateurs();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UtilisateurCompletDTO create(@Valid @RequestBody UtilisateurCompletDTO dto) {
        return utilisateurService.createUtilisateur(dto);
    }

    @PutMapping("/{id}")
    public UtilisateurCompletDTO update(@PathVariable Integer id, @Valid @RequestBody UtilisateurCompletDTO dto) {
        return utilisateurService.updateUtilisateur(id, dto);
    }

    @PatchMapping("/{id}/statut")
    public UtilisateurCompletDTO updateStatut(@PathVariable Integer id, @RequestBody StatutRequest request) {
        return utilisateurService.changerStatut(id, request.getStatut());
    }

    @Data
    public static class StatutRequest {
        private String statut; // activer ou archiver
    }
}
