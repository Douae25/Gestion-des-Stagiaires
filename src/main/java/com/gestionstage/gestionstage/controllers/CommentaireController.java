package com.gestionstage.gestionstage.controllers;


import com.gestionstage.gestionstage.dtos.CommentaireDTO;
import com.gestionstage.gestionstage.services.CommentaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/commentaires")
public class CommentaireController {

    @Autowired
    private CommentaireService commentaireService;

    @PostMapping
    @PreAuthorize("hasRole('encadrant')")
    public CommentaireDTO ajouterCommentaire(@RequestBody CommentaireDTO dto) {
        return commentaireService.ajouterCommentaire(dto);
    }

    @GetMapping("/rapport/{idRapport}")
    @PreAuthorize("hasAnyRole('stagiaire', 'rh', 'encadrant', 'admin')")
    public List<CommentaireDTO> getParRapport(@PathVariable Integer idRapport) {
        return commentaireService.getCommentairesParRapport(idRapport);
    }
}
