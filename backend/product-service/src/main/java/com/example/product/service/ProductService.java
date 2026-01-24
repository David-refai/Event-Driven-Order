package com.example.product.service;

import com.example.common.constants.KafkaConstants;
import com.example.common.event.BaseEvent;
import com.example.common.utils.CorrelationIdUtils;
import com.example.product.domain.Category;
import com.example.product.domain.Product;
import com.example.product.dto.ProductRequest;
import com.example.product.repository.CategoryRepository;
import com.example.product.repository.ProductRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {
    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final FileStorageService fileStorageService;

    public ProductService(ProductRepository productRepository,
            CategoryRepository categoryRepository,
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper,
            FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Transactional
    public Product createProduct(ProductRequest request, org.springframework.web.multipart.MultipartFile[] files) {
        Product product = new Product();
        mapRequestToProduct(request, product);

        if (files != null && files.length > 0) {
            for (org.springframework.web.multipart.MultipartFile file : files) {
                String fileName = fileStorageService.storeFile(file);
                product.getImages().add("/uploads/" + fileName);
            }
        }

        Product savedProduct = productRepository.save(product);
        publishProductCreatedEvent(savedProduct);
        return savedProduct;
    }

    @Transactional
    public Product updateProduct(String id, ProductRequest request,
            org.springframework.web.multipart.MultipartFile[] files) {
        Product product = getProductById(id);
        mapRequestToProduct(request, product);

        if (files != null && files.length > 0) {
            // Option: clear old images or append
            // For now, let's append as the user says "add multiple images"
            for (org.springframework.web.multipart.MultipartFile file : files) {
                String fileName = fileStorageService.storeFile(file);
                product.getImages().add("/uploads/" + fileName);
            }
        }

        Product savedProduct = productRepository.save(product);
        publishProductUpdatedEvent(savedProduct);
        return savedProduct;
    }

    @Transactional
    public void deleteProduct(String id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    private void publishProductUpdatedEvent(Product product) {
        try {
            String correlationId = CorrelationIdUtils.getCorrelationId();
            BaseEvent<ProductCreatedEventPayload> event = BaseEvent.create(
                    KafkaConstants.PRODUCT_UPDATED_V1,
                    new ProductCreatedEventPayload(product.getId(), product.getInitialInventory()),
                    correlationId);

            kafkaTemplate.send(KafkaConstants.PRODUCT_EVENTS_TOPIC, product.getId(),
                    objectMapper.writeValueAsString(event));

            log.info("Published ProductUpdatedEvent for product: {}", product.getId());
        } catch (JsonProcessingException e) {
            log.error("Failed to publish ProductUpdatedEvent", e);
        }
    }

    private void publishProductCreatedEvent(Product product) {
        try {
            String correlationId = CorrelationIdUtils.getCorrelationId();
            BaseEvent<ProductCreatedEventPayload> event = BaseEvent.create(
                    KafkaConstants.PRODUCT_CREATED_V1,
                    new ProductCreatedEventPayload(product.getId(), product.getInitialInventory()),
                    correlationId);

            kafkaTemplate.send(KafkaConstants.PRODUCT_EVENTS_TOPIC, product.getId(),
                    objectMapper.writeValueAsString(event));

            log.info("Published ProductCreatedEvent for product: {}", product.getId());
        } catch (JsonProcessingException e) {
            log.error("Failed to publish ProductCreatedEvent", e);
        }
    }

    private void mapRequestToProduct(ProductRequest request, Product product) {
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setInitialInventory(request.inventory());

        if (request.images() != null) {
            if (product.getImages() == null) {
                product.setImages(new java.util.ArrayList<>(request.images()));
            } else {
                product.getImages().clear();
                product.getImages().addAll(request.images());
            }
        } else if (product.getImages() == null) {
            product.setImages(new java.util.ArrayList<>());
        }

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.categoryId()));
            product.setCategory(category);
        }
    }

    public record ProductCreatedEventPayload(String productId, Integer initialQuantity) {
    }
}
