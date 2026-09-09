package com.logs.journal.repository;

import com.logs.journal.entity.EntryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EntryImageRepository extends JpaRepository<EntryImage, Long> {

    List<EntryImage> findByEntryId(Long entryId);

    Optional<EntryImage> findByIdAndEntryId(Long id, Long entryId);
}
