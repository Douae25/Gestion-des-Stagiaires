package com.gestionstage.gestionstage.repositories;


import com.gestionstage.gestionstage.entities.OffreStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OffreStageRepository extends JpaRepository<OffreStage, Integer> {
    List<OffreStage> findByStatut(OffreStage.StatutOffre statut);
}
