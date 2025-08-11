package com.gestionstage.gestionstage.repositories;

import com.gestionstage.gestionstage.entities.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EvaluationRepository extends JpaRepository<Evaluation, Integer> {
}
