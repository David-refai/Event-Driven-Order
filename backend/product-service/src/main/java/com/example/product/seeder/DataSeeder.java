package com.example.product.seeder;

import com.example.product.domain.Category;
import com.example.product.domain.Product;
import com.example.product.repository.CategoryRepository;
import com.example.product.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {
    
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public DataSeeder(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() > 0) {
            System.out.println("Database already seeded. Skipping...");
            return;
        }

        System.out.println("Seeding database with initial data...");

        // Create Categories
        Category electronics = new Category("Electronics", "Electronic devices and gadgets");
        Category fashion = new Category("Fashion", "Clothing and accessories");
        Category home = new Category("Home & Garden", "Home decoration and garden tools");
        
        categoryRepository.saveAll(Arrays.asList(electronics, fashion, home));

        // Create Products
        Product phone = new Product();
        phone.setName("Premium Smartphone X");
        phone.setDescription("Latest flagship smartphone with advanced AI features and 5G connectivity");
        phone.setPrice(new BigDecimal("999.99"));
        phone.setInitialInventory(50);
        phone.setCategory(electronics);
        phone.setImages(Arrays.asList(
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"
        ));

        Product laptop = new Product();
        laptop.setName("Ultra Laptop Pro");
        laptop.setDescription("High-performance laptop for professionals and creators");
        laptop.setPrice(new BigDecimal("1499.99"));
        laptop.setInitialInventory(30);
        laptop.setCategory(electronics);
        laptop.setImages(Arrays.asList(
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"
        ));

        Product watch = new Product();
        watch.setName("Luxury Mechanical Watch");
        watch.setDescription("Elegant timepiece with Swiss movement");
        watch.setPrice(new BigDecimal("2499.99"));
        watch.setInitialInventory(15);
        watch.setCategory(fashion);
        watch.setImages(Arrays.asList(
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
        ));

        Product headphones = new Product();
        headphones.setName("Premium Wireless Headphones");
        headphones.setDescription("Noise-cancelling over-ear headphones with 30-hour battery");
        headphones.setPrice(new BigDecimal("349.99"));
        headphones.setInitialInventory(75);
        headphones.setCategory(electronics);
        headphones.setImages(Arrays.asList(
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"
        ));

        Product sofa = new Product();
        sofa.setName("Modern Scandinavian Sofa");
        sofa.setDescription("Comfortable 3-seater sofa with minimalist design");
        sofa.setPrice(new BigDecimal("899.99"));
        sofa.setInitialInventory(12);
        sofa.setCategory(home);
        sofa.setImages(Arrays.asList(
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
        ));

        productRepository.saveAll(Arrays.asList(phone, laptop, watch, headphones, sofa));

        System.out.println("Database seeded successfully with 3 categories and 5 products!");
    }
}
