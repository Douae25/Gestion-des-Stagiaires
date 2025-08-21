package com.gestionstage.gestionstage.repositories;

import com.gestionstage.gestionstage.entities.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EvaluationRepository extends JpaRepository<Evaluation, Integer> {
    // Recherche par id_stagiaire (clé métier) et id_encadrant
    @Query("SELECT e FROM Evaluation e WHERE e.stagiaire.id_stagiaire = :idStagiaire AND e.encadrant.id = :idEncadrant")
    Optional<Evaluation> findByStagiaireIdAndEncadrantId(@Param("idStagiaire") Integer idStagiaire, @Param("idEncadrant") Integer idEncadrant);
}
