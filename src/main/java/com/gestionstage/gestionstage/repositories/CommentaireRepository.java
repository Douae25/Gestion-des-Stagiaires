package com.gestionstage.gestionstage.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestionstage.gestionstage.entities.Commentaire;
import java.util.List;

    @Repository
public interface CommentaireRepository extends JpaRepository<Commentaire, Integer> {
    // Correction : il n'y a pas de champ candidature dans Commentaire, il faut passer par rapport.candidature.id
    List<Commentaire> findByRapport_Candidature_Id(Integer idCandidature);
    List<Commentaire> findByRapport_Id(Integer idRapport);
}


