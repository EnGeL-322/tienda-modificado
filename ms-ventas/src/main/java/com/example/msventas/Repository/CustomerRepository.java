package com.example.msventas.Repository;

import com.example.msventas.Entity.Customer;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByDni(String dni);

    interface TopCustomerProjection {
        Long getCustomerId();
        String getDni();
        String getName();
        Long getTotalSales();
    }

    @Query("""
           SELECT c.id as customerId,
                  c.dni as dni,
                  c.name as name,
                  COUNT(s.id) as totalSales
           FROM Customer c
           JOIN Sale s ON s.customer = c
           WHERE s.status = 'COMPLETED'
           GROUP BY c.id, c.dni, c.name
           ORDER BY COUNT(s.id) DESC
           """)
    List<TopCustomerProjection> findTopCustomers(Pageable pageable);
}
