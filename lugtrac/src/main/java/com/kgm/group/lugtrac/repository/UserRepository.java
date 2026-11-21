package com.kgm.group.lugtrac.repository;

import com.kgm.group.lugtrac.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {

   //Optional<Object> findByEmail(String email);
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
}
