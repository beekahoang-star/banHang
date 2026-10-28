package com.ecommerce.platform.modules.integration.service;

import com.ecommerce.platform.common.exception.AppException;
import com.ecommerce.platform.common.exception.ErrorCode;
import com.ecommerce.platform.modules.integration.dto.IntegrationDto;
import com.ecommerce.platform.modules.ordering.entity.Order;
import com.ecommerce.platform.modules.ordering.entity.OrderTimeline;
import com.ecommerce.platform.modules.ordering.repository.OrderRepository;
import com.ecommerce.platform.modules.ordering.repository.OrderTimelineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentIntegrationService {

    private final OrderRepository orderRepository;
    private final OrderTimelineRepository orderTimelineRepository;

    @Value("${app.payment.vietqr.account-no:0987654321}")
    private String vietQrAccountNo;

    @Value("${app.payment.vietqr.account-name:CTY CO PHAN ECOMMERCE VN}")
    private String vietQrAccountName;

    @Value("${app.payment.vietqr.bank-id:970422}")
    private String vietQrBankId;

    @Value("${app.payment.vietqr.template:compact}")
    private String vietQrTemplate;

    /**
     * Tạo mã QR chuyển khoản VietQR chuẩn Napas 247
     */
    public IntegrationDto.VietQrResponse generateVietQr(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        String encodedName = URLEncoder.encode(vietQrAccountName, StandardCharsets.UTF_8);
        String encodedContent = URLEncoder.encode(order.getOrderCode(), StandardCharsets.UTF_8);
        long amountLong = order.getFinalAmount().longValue();

        String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-%s.png?amount=%d&addInfo=%s&accountName=%s",
                vietQrBankId, vietQrAccountNo, vietQrTemplate, amountLong, encodedContent, encodedName);

        return IntegrationDto.VietQrResponse.builder()
                .qrImageUrl(qrUrl)
                .bankId(vietQrBankId)
                .accountNo(vietQrAccountNo)
                .accountName(vietQrAccountName)
                .amount(order.getFinalAmount())
                .transferContent(order.getOrderCode())
                .build();
    }

    /**
     * Nhận webhook từ VietQR / Ngân hàng để tự động xác nhận đơn hàng đã thanh toán
     */
    @Transactional
    public void processPaymentWebhook(IntegrationDto.PaymentWebhookRequest request) {
        log.info("Received Payment Webhook for order: {}, amount: {}, txId: {}",
                request.getOrderCode(), request.getAmount(), request.getTransactionId());

        Order order = orderRepository.findByOrderCode(request.getOrderCode())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        order.setPaymentStatus("PAID");
        order.setPaymentTransactionId(request.getTransactionId());
        orderRepository.save(order);

        OrderTimeline timeline = OrderTimeline.builder()
                .order(order)
                .fromStatus(order.getStatus())
                .toStatus(order.getStatus())
                .note("Đã nhận thanh toán chuyển khoản VietQR: " + request.getAmount().toPlainString() + "đ. Mã GD: " + request.getTransactionId())
                .build();
        orderTimelineRepository.save(timeline);
    }
}
