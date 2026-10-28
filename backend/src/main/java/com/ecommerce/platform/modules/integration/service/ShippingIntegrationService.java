package com.ecommerce.platform.modules.integration.service;

import com.ecommerce.platform.modules.integration.dto.IntegrationDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ShippingIntegrationService {

    public List<IntegrationDto.ShippingRateResponse> calculateShippingRates(String province, int totalWeightGrams) {
        // GHN rate calculation logic
        BigDecimal ghnFee = new BigDecimal("32000");
        if (province != null && (province.contains("Hà Nội") || province.contains("Hồ Chí Minh"))) {
            ghnFee = new BigDecimal("22000");
        }
        if (totalWeightGrams > 2000) {
            ghnFee = ghnFee.add(new BigDecimal("15000"));
        }

        // GHTK rate calculation logic
        BigDecimal ghtkFee = ghnFee.subtract(new BigDecimal("2000"));

        return List.of(
                IntegrationDto.ShippingRateResponse.builder()
                        .carrier("GHN")
                        .fee(ghnFee)
                        .estimatedDelivery("1-2 ngày")
                        .build(),
                IntegrationDto.ShippingRateResponse.builder()
                        .carrier("GHTK")
                        .fee(ghtkFee)
                        .estimatedDelivery("2-3 ngày")
                        .build()
        );
    }
}
