package com.kgm.group.lugtrac.repository;

import com.kgm.group.lugtrac.model.SmartLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SmartLockRepository extends JpaRepository<SmartLock,Long> {
}
