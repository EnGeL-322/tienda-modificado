package com.example.mscatalogo.Service;

import com.example.mscatalogo.Dto.CreateProductDto;
import com.example.mscatalogo.Dto.ProductDto;
import com.example.mscatalogo.Entity.Product;
import com.example.mscatalogo.Repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public ProductDto create(CreateProductDto dto) {
        Product product = new Product();

        String sku = dto.sku();
        if (sku == null || sku.isBlank()) {
            sku = generateSku();
        }

        product.setSku(sku);
        product.setName(dto.name());
        product.setUnit(dto.unit());
        product.setCategory(dto.category());
        product.setDescription(dto.description());

        // ✅ NUEVO
        product.setUnitsPerBox(dto.unitsPerBox());
        product.setUnitsPerPack(dto.unitsPerPack());

        product.setActive(true);

        return toDto(productRepository.save(product));
    }

    public ProductDto update(Long id, CreateProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        String sku = dto.sku();
        if (sku == null || sku.isBlank()) {
            sku = product.getSku();
        }

        product.setSku(sku);
        product.setName(dto.name());
        product.setUnit(dto.unit());
        product.setCategory(dto.category());
        product.setDescription(dto.description());

        // ✅ NUEVO
        product.setUnitsPerBox(dto.unitsPerBox());
        product.setUnitsPerPack(dto.unitsPerPack());

        return toDto(productRepository.save(product));
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getSku(),
                p.getName(),
                p.getUnit(),
                p.getCategory(),
                p.getDescription(),
                p.getActive(),
                p.getUnitsPerBox(),
                p.getUnitsPerPack()
        );
    }


    public ProductDto findById(Long id) {
        return productRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public ProductDto findBySku(String sku) {
        return productRepository.findBySku(sku)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<ProductDto> findAll() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }



    public ProductDto changeActive(Long id, boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setActive(active);
        return toDto(productRepository.save(product));
    }

    // ==== NUEVO MÉTODO PARA SKU ====
    private String generateSku() {
        long nextNumber = 1L;
        Optional<Product> last = productRepository.findTopByOrderByIdDesc();
        if (last.isPresent() && last.get().getId() != null) {
            nextNumber = last.get().getId() + 1;
        }
        // Ej: PRD-000001
        return String.format("PRD-%06d", nextNumber);
    }
}
