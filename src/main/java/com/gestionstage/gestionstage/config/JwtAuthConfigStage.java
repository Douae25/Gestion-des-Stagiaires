package com.gestionstage.gestionstage.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.gestionstage.gestionstage.services.JwtService;
import com.gestionstage.gestionstage.services.CustomUserDetailsService;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class JwtAuthConfigStage {

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/offres/actives").permitAll()
                        
                        // Stagiaire
                        .requestMatchers("/api/candidatures").hasAnyRole("STAGIAIRE", "RH")
                        .requestMatchers("/api/candidatures/conventions").hasRole("STAGIAIRE")
                        .requestMatchers("/api/candidatures/attestations").hasRole("STAGIAIRE")
                        
                        // RH
                        .requestMatchers("/api/candidatures/accepter/*").hasRole("RH")
                        .requestMatchers("/api/candidatures/refuser/*").hasRole("RH")
                        .requestMatchers("/api/candidatures/affecter-encadrant/*").hasRole("RH")
                        .requestMatchers("/api/candidatures/convention-signee/*").hasRole("RH")
                        
                        // Encadrant
                        .requestMatchers("/api/candidatures/par-rapport/*").hasRole("ENCADRANT")
                        
                        // Admin
                        .requestMatchers("/api/utilisateurs/**").hasRole("ADMIN")
                        .requestMatchers("/api/offres/**").hasAnyRole("STAGIAIRE", "RH", "ADMIN")
                        
                        // Tous les rôles
                        .requestMatchers("/api/candidatures/par-candidature/*").hasAnyRole("STAGIAIRE", "ENCADRANT", "RH", "ADMIN")
                        .requestMatchers("/api/rapports/getParRapport").hasAnyRole("STAGIAIRE", "ENCADRANT", "RH", "ADMIN")
                        
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(userDetailsService, jwtService);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
