package com.atscheck.repository;

import com.atscheck.model.ScanHistory;
import com.atscheck.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScanHistoryRepository extends JpaRepository<ScanHistory, UUID> {
    List<ScanHistory> findByUserOrderByScannedAtDesc(User user);
    Optional<ScanHistory> findByIdAndUser(UUID id, User user);
    void deleteByIdAndUser(UUID id, User user);
    long countByUser(User user);
    List<ScanHistory> findAllByOrderByScannedAtDesc();
}
