package com.kgm.group.lugtrac.repository;

import com.kgm.group.lugtrac.model.Baggage;
import com.kgm.group.lugtrac.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BaggageRepository extends JpaRepository<Baggage, Long> {
    Optional<Baggage> findByRfidUid(String rfidUid);
    List<Baggage> findByPassenger(User passenger);
    Optional<Baggage> findByPnr(String pnr);
}
