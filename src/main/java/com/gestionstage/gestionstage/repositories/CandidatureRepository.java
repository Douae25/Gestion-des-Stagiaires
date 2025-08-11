package com.gestionstage.gestionstage.repositories;

import com.gestionstage.gestionstage.entities.Candidature;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CandidatureRepository extends JpaRepository<Candidature, Integer> {
    Optional<Candidature> findByStagiaireId(Integer idStagiaire);
}
