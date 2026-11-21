package com.kgm.group.lugtrac.repository;

import com.kgm.group.lugtrac.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByBaggageId(Long baggageId);
}