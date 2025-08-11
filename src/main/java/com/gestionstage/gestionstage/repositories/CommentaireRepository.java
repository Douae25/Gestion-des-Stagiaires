package com.gestionstage.gestionstage.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestionstage.gestionstage.entities.Commentaire;
import java.util.List;

    @Repository
public interface CommentaireRepository extends JpaRepository<Commentaire, Integer> {
    List<Commentaire> findByRapportId(Integer idRapport);
}


