package com.paymentgateway.payment_gateway.service;

import com.paymentgateway.payment_gateway.entity.Merchant;
import com.paymentgateway.payment_gateway.repository.MerchantRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MerchantService {

    private final MerchantRepository merchantRepository;

    // Auto-seed test merchant on application startup
    @PostConstruct
    @Transactional
    public void seedTestMerchant() {
        String testEmail = "test@example.com";
        
        if (!merchantRepository.existsByEmail(testEmail)) {
            Merchant testMerchant = new Merchant();
            // Don't set ID - let it auto-generate
            // testMerchant.setId("55be8400-e29b-41d4-a716-446655440000");
            testMerchant.setName("Test Merchant");
            testMerchant.setEmail(testEmail);
            testMerchant.setApiKey("key_test_abc123");
            testMerchant.setApiSecret("secret_test_xyz789");
            testMerchant.setIsActive(true);
            
            merchantRepository.save(testMerchant);
            System.out.println("✅ Test merchant created: " + testEmail);
        } else {
            System.out.println("ℹ️  Test merchant already exists");
        }
    }

    public Optional<Merchant> findByApiKey(String apiKey) {
        return merchantRepository.findByApiKey(apiKey);
    }

    public Optional<Merchant> findById(String id) {
        return merchantRepository.findById(id);
    }

    public Merchant save(Merchant merchant) {
        return merchantRepository.save(merchant);
    }
}