package com.gestionstage.gestionstage.services;


import com.gestionstage.gestionstage.dtos.CommentaireDTO;
import com.gestionstage.gestionstage.entities.Commentaire;
import com.gestionstage.gestionstage.entities.Rapport;
import com.gestionstage.gestionstage.repositories.CommentaireRepository;
import com.gestionstage.gestionstage.repositories.RapportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentaireService {

    @Autowired
    private CommentaireRepository commentaireRepository;

    @Autowired
    private RapportRepository rapportRepository;

    public CommentaireDTO ajouterCommentaire(CommentaireDTO dto) {
        Rapport rapport = rapportRepository.findById(dto.getIdRapport())
            .orElseThrow(() -> new IllegalArgumentException("Rapport non trouvé"));

        Commentaire commentaire = new Commentaire();
        commentaire.setContenu(dto.getContenu());
        commentaire.setRapport(rapport);

        commentaire = commentaireRepository.save(commentaire);
        dto.setId(commentaire.getId());
        return dto;
    }

    public List<CommentaireDTO> getCommentairesParRapport(Integer idRapport) {
    return commentaireRepository.findByRapport_Id(idRapport).stream().map(c -> {
            CommentaireDTO dto = new CommentaireDTO();
            dto.setId(c.getId());
            dto.setContenu(c.getContenu());
            dto.setIdRapport(c.getRapport().getId());
            return dto;
        }).collect(Collectors.toList());
    }
}