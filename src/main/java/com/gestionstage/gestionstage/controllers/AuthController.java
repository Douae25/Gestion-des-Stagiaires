package com.gestionstage.gestionstage.controllers;

import com.gestionstage.gestionstage.services.JwtService;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            if (request.getEmail() == null || request.getMot_de_passe() == null || request.getEmail().trim().isEmpty() || request.getMot_de_passe().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email et mot de passe sont obligatoires");
            }

            System.out.println("Tentative de login avec email: " + request.getEmail());
            System.out.println("Mot de passe fourni: " + request.getMot_de_passe());

            // Authentifier l'utilisateur
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().trim(),
                            request.getMot_de_passe().trim()
                    )
            );

            // Générer le token JWT
            String token = jwtService.generateToken(request.getEmail());
            // Retourner le token au client
            return ResponseEntity.ok(new JwtResponse(token));

        } catch (AuthenticationException e) {
            System.out.println("Erreur d'authentification: " + e.getMessage());
            return ResponseEntity.status(401).body("Email ou mot de passe incorrect");
        }
    }

    // DTO pour la requête
    @Data
    public static class LoginRequest {
        private String email;
        private String mot_de_passe;
    }

    // DTO pour la réponse
    @Data
    public static class JwtResponse {
        private final String token;
    }
}
