package com.gestionstage.gestionstage.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestionstage.gestionstage.entities.Rapport;
import java.util.List;

    @Repository
public interface RapportRepository extends JpaRepository<Rapport, Integer> {
    List<Rapport> findByCandidatureId(Integer idCandidature);
}


