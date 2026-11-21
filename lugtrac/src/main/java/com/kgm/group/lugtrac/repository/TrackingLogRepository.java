package com.kgm.group.lugtrac.repository;

import com.kgm.group.lugtrac.model.Baggage;
import com.kgm.group.lugtrac.model.TrackingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackingLogRepository extends JpaRepository<TrackingLog, Long> {
    List<TrackingLog> findByBaggageOrderByTimestampDesc(Baggage baggage);
}