package com.gestionstage.gestionstage.services;

import com.gestionstage.gestionstage.entities.Encadrant;
import com.gestionstage.gestionstage.repositories.EncadrantRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EncadrantService {

    private final EncadrantRepository encadrantRepository;

    public EncadrantService(EncadrantRepository encadrantRepository) {
        this.encadrantRepository = encadrantRepository;
    }

    public List<Encadrant> getAllEncadrants() {
        return encadrantRepository.findAll();
    }
}
