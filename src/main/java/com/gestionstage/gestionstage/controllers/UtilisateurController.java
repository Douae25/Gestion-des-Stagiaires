package com.gestionstage.gestionstage.controllers;

import com.gestionstage.gestionstage.dtos.UtilisateurCompletDTO;
import com.gestionstage.gestionstage.dtos.UtilisateurUpdateResponse;
import com.gestionstage.gestionstage.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('stagiaire', 'rh', 'encadrant', 'admin')")
    public UtilisateurCompletDTO getById(@PathVariable Integer id) {
        return utilisateurService.getUtilisateurById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UtilisateurCompletDTO create(@Valid @RequestBody UtilisateurCompletDTO dto) {
        return utilisateurService.createUtilisateur(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('stagiaire', 'rh', 'encadrant', 'admin')")
    public UtilisateurUpdateResponse update(@PathVariable Integer id, @Valid @RequestBody UtilisateurCompletDTO dto, 
                                       Authentication authentication) {
        // Vérifier que l'utilisateur peut modifier ce profil
        String currentUserEmail = authentication.getName();
        UtilisateurCompletDTO currentUser = utilisateurService.getUtilisateurByEmail(currentUserEmail);
        
        // Un utilisateur peut modifier son propre profil, ou un admin/rh peut modifier n'importe quel profil
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_admin") || 
                                 auth.getAuthority().equals("ROLE_rh"));
        
        if (!currentUser.getId_utilisateur().equals(id) && !isAdmin) {
            throw new IllegalArgumentException("Vous ne pouvez modifier que votre propre profil");
        }
        
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
