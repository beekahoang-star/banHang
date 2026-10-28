package com.ecommerce.platform.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION("ERR_500", "Lỗi máy chủ nội bộ", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHENTICATED("ERR_401", "Chưa xác thực hoặc token hết hạn", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED("ERR_403", "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN),
    INVALID_KEY("ERR_400", "Khóa dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED("ERR_USER_001", "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    USER_EXISTED("ERR_USER_002", "Email đã được đăng ký", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS("ERR_AUTH_001", "Tài khoản hoặc mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND("ERR_CAT_001", "Danh mục không tồn tại", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND("ERR_PROD_001", "Sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    VARIANT_NOT_FOUND("ERR_VAR_001", "Biến thể sản phẩm (SKU) không tồn tại", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK("ERR_INV_001", "Tồn kho không đủ để đáp ứng yêu cầu", HttpStatus.CONFLICT),
    OPTIMISTIC_LOCK_CONFLICT("ERR_INV_002", "Dữ liệu tồn kho vừa được cập nhật bởi phiên khác, vui lòng thử lại", HttpStatus.CONFLICT),
    INVALID_ORDER_STATE_TRANSITION("ERR_ORD_001", "Không thể chuyển trạng thái đơn hàng theo yêu cầu", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND("ERR_ORD_002", "Đơn hàng không tồn tại", HttpStatus.NOT_FOUND),
    VOUCHER_NOT_FOUND("ERR_MKT_001", "Mã giảm giá không tồn tại hoặc đã hết hạn", HttpStatus.NOT_FOUND),
    VOUCHER_MIN_ORDER_NOT_MET("ERR_MKT_002", "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng voucher", HttpStatus.BAD_REQUEST),
    VOUCHER_USAGE_EXCEEDED("ERR_MKT_003", "Voucher đã hết lượt sử dụng", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
