package com.example.mscatalogo.Service;

import com.example.mscatalogo.Dto.CreateProductDto;
import com.example.mscatalogo.Dto.ProductDto;
import com.example.mscatalogo.Entity.Product;
import com.example.mscatalogo.Repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public ProductDto create(CreateProductDto dto) {
        Product product = new Product();
        product.setSku(dto.sku());
        product.setName(dto.name());
        product.setUnit(dto.unit());
        product.setCategory(dto.category());
        product.setWeight(dto.weight());
        product.setDescription(dto.description());
        return toDto(productRepository.save(product));
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

    private ProductDto toDto(Product p) {
        return new ProductDto(p.getId(), p.getSku(), p.getName(), 
            p.getUnit(), p.getCategory(), p.getWeight(), 
            p.getDescription(), p.getActive());
    }

    public ProductDto update(Long id, CreateProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setSku(dto.sku());
        product.setName(dto.name());
        product.setUnit(dto.unit());
        product.setCategory(dto.category());
        product.setWeight(dto.weight());
        product.setDescription(dto.description());

        return toDto(productRepository.save(product));
    }

    public ProductDto changeActive(Long id, boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setActive(active);
        return toDto(productRepository.save(product));
    }

}