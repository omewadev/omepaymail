<?php
/**
 * Đoạn mã mẫu để nhận Webhook từ PayMailHook và tự động duyệt đơn hàng WooCommerce.
 * Hướng dẫn: Dán đoạn mã này vào file functions.php của Theme hoặc dùng Plugin "Code Snippets".
 */

add_action('rest_api_init', function () {
    register_rest_route('paymail/v1', '/confirm', array(
        'methods' => 'POST',
        'callback' => 'paymailhook_handle_webhook',
        'permission_callback' => '__return_true', // Bạn nên thêm logic kiểm tra IP hoặc Secret Key ở đây
    ));
});

function paymailhook_handle_webhook($request) {
    $params = $request->get_json_params();
    
    // 1. Lấy dữ liệu từ PayMailHook gửi về
    $amount = $params['amount'] ?? 0;
    $referenceCode = $params['referenceCode'] ?? ''; // Có dạng TT123456
    $secretKeyReceived = $params['secretKey'] ?? '';
    
    // 2. Kiểm tra Secret Key (Thay 'YOUR_SECRET_KEY' bằng mã bạn lấy từ Dashboard PayMailHook)
    $mySecretKey = 'pmh_live_789xyz123abc'; 
    if ($secretKeyReceived !== $mySecretKey) {
        return new WP_Error('forbidden', 'Mã bí mật không khớp', array('status' => 403));
    }

    // 3. Xử lý mã tham chiếu TT123456
    // Giả sử mã là TT + ID Đơn hàng (Ví dụ: TT105 -> ID đơn hàng là 105)
    $order_id = str_replace('TT', '', $referenceCode);
    $order_id = intval($order_id);

    if (!$order_id) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Không tìm thấy mã đơn hàng'), 400);
    }

    // 4. Tìm đơn hàng WooCommerce
    $order = wc_get_order($order_id);
    if (!$order) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Đơn hàng không tồn tại trên hệ thống'), 404);
    }

    // 5. Kiểm tra số tiền (Tùy chọn) và cập nhật trạng thái
    // if ($order->get_total() == $amount) { ... }
    
    $order->update_status('completed', 'Thanh toán tự động qua PayMailHook.');
    
    return new WP_REST_Response(array(
        'success' => true, 
        'message' => 'Đã xác nhận thanh toán cho đơn hàng #' . $order_id
    ), 200);
}
