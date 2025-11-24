package com.example.msinventory.Repository;

import com.example.msinventory.Entity.AccountingEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AccountingEntryRepository extends JpaRepository<AccountingEntry, Long> {

    List<AccountingEntry> findByReferenceTypeAndReferenceId(String referenceType, Long referenceId);

    List<AccountingEntry> findByDateBetween(LocalDateTime from, LocalDateTime to);

    List<AccountingEntry> findByTypeAndDateBetween(String type, LocalDateTime from, LocalDateTime to);

    // 👉 Totales por tipo (COMPRA / VENTA / AJUSTE) en rango de fechas
    @Query("""
           select coalesce(sum(a.amount), 0)
           from AccountingEntry a
           where a.type = :type
             and a.date between :from and :to
           """)
    Double sumAmountByTypeAndDateBetween(
            @Param("type") String type,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    // 👉 Suma de débitos para una cuenta en un rango
    @Query("""
           select coalesce(sum(a.amount), 0)
           from AccountingEntry a
           where a.debitAccount = :account
             and a.date between :from and :to
           """)
    Double sumDebitsForAccount(
            @Param("account") String account,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    // 👉 Suma de créditos para una cuenta en un rango
    @Query("""
           select coalesce(sum(a.amount), 0)
           from AccountingEntry a
           where a.creditAccount = :account
             and a.date between :from and :to
           """)
    Double sumCreditsForAccount(
            @Param("account") String account,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}
