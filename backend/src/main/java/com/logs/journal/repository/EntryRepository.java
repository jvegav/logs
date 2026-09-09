package com.logs.journal.repository;

import com.logs.journal.entity.Entry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntryRepository extends JpaRepository<Entry, Long> {

    List<Entry> findAllByOrderByCreatedAtDesc();

    @Query("SELECT e FROM Entry e WHERE LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.content) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY e.createdAt DESC")
    List<Entry> searchByQuery(@Param("query") String query);
}
