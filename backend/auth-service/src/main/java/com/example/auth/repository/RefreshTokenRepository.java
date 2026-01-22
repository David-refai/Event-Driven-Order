package com.example.auth.repository;

import com.example.auth.entity.RefreshToken;
import com.example.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUser(User user);

    @Modifying
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM refreshtoken WHERE user_id = :userId", nativeQuery = true)
    void deleteByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @Modifying
    int deleteByUser(User user);
}
