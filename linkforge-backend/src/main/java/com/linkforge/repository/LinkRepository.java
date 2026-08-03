package com.linkforge.repository;

import com.linkforge.entity.Link;
import com.linkforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LinkRepository extends JpaRepository<Link, UUID> {

    Optional<Link> findByShortCode(String shortCode);

    Optional<Link> findByShortCodeAndActiveTrue(String shortCode);

    List<Link> findByUser(User user);
}