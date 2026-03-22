<?php
/**
 * Plugin Name: PayMailHook WooCommerce Auto-Confirm
 * Plugin URI: https://paymailhook.com
 * Description: Tự động xác nhận đơn hàng WooCommerce khi nhận được Webhook từ PayMailHook.
 * Version: 1.0.0
 * Author: PayMailHook
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// 1. Thêm menu cài đặt vào Admin WordPress
add_action('admin_menu', 'paymailhook_add_admin_menu');
function paymailhook_add_admin_menu() {
    add_options_page('PayMailHook Settings', 'PayMailHook', 'manage_options', 'paymailhook', 'paymailhook_options_page');
}

// 2. Đăng ký các trường cài đặt (Settings)
add_action('admin_init', 'paymailhook_settings_init');
function paymailhook_settings_init() {
    register_setting('pluginPage', 'paymailhook_settings');
    add_settings_section('paymailhook_pluginPage_section', 'Cấu hình kết nối PayMailHook', 'paymailhook_settings_section_callback', 'pluginPage');
    add_settings_field('paymailhook_secret_key', 'Secret Key', 'paymailhook_secret_key_render', 'pluginPage', 'paymailhook_pluginPage_section');
    add_settings_field('paymailhook_prefix', 'Tiền tố (Prefix)', 'paymailhook_prefix_render', 'pluginPage', 'paymailhook_pluginPage_section');
}

function paymailhook_secret_key_render() {
    $options = get_option('paymailhook_settings');
    ?>
    <input type='text' name='paymailhook_settings[paymailhook_secret_key]' value='<?php echo isset($options['paymailhook_secret_key']) ? esc_attr($options['paymailhook_secret_key']) : ''; ?>' style="width: 350px;">
    <p class="description">Copy Secret Key từ trang Cài đặt của PayMailHook dán vào đây.</p>
    <?php
}

function paymailhook_prefix_render() {
    $options = get_option('paymailhook_settings');
    ?>
    <input type='text' name='paymailhook_settings[paymailhook_prefix]' value='<?php echo isset($options['paymailhook_prefix']) ? esc_attr($options['paymailhook_prefix']) : 'TT'; ?>' style="width: 100px; text-transform: uppercase;">
    <p class="description">Ví dụ: TT, DH, CG... (Phải khớp với cấu hình trên PayMailHook).</p>
    <?php
}

function paymailhook_settings_section_callback() {
    echo 'Vui lòng nhập thông tin bảo mật để kết nối website này với PayMailHook.';
}

// 3. Giao diện trang Cài đặt
function paymailhook_options_page() {
    ?>
    <div class="wrap">
        <h2>Cài đặt PayMailHook WooCommerce</h2>
        <form action='options.php' method='post'>
            <?php
            settings_fields('pluginPage');
            do_settings_sections('pluginPage');
            submit_button();
            ?>
        </form>
        <hr>
        <h3>URL Webhook của bạn:</h3>
        <p style="color: #d63638; font-weight: bold; font-size: 16px; background: #fff; padding: 10px; border: 1px solid #ccc; display: inline-block;">
            <?php echo get_rest_url(null, 'paymail/v1/confirm'); ?>
        </p>
        <p><strong>Hướng dẫn:</strong> Hãy copy URL màu đỏ ở trên và dán vào ô "URL Webhook" trên hệ thống PayMailHook.</p>
    </div>
    <?php
}

// 4. Đăng ký API Endpoint nhận Webhook
add_action('rest_api_init', function () {
    register_rest_route('paymail/v1', '/confirm', array(
        'methods' => 'POST',
        'callback' => 'paymailhook_handle_webhook',
        'permission_callback' => '__return_true',
    ));
});

// 5. Xử lý logic khi nhận được Webhook
function paymailhook_handle_webhook($request) {
    $params = $request->get_json_params();
    $options = get_option('paymailhook_settings');
    
    // Kiểm tra Secret Key
    $secretKeyReceived = isset($params['secretKey']) ? $params['secretKey'] : '';
    $mySecretKey = isset($options['paymailhook_secret_key']) ? $options['paymailhook_secret_key'] : '';
    
    if (empty($mySecretKey) || $secretKeyReceived !== $mySecretKey) {
        return new WP_Error('forbidden', 'Mã bí mật không khớp hoặc chưa được cấu hình', array('status' => 403));
    }

    // Tách ID đơn hàng dựa trên Prefix
    $referenceCode = isset($params['referenceCode']) ? $params['referenceCode'] : '';
    $prefix = isset($options['paymailhook_prefix']) ? $options['paymailhook_prefix'] : 'TT';
    
    // Xóa prefix (không phân biệt hoa thường) để lấy ID số
    $order_id = str_ireplace($prefix, '', $referenceCode);
    $order_id = intval($order_id);

    if (!$order_id) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Không tìm thấy mã đơn hàng hợp lệ'), 400);
    }

    // Kiểm tra WooCommerce đã kích hoạt chưa
    if (!function_exists('wc_get_order')) {
        return new WP_REST_Response(array('success' => false, 'message' => 'WooCommerce chưa được cài đặt hoặc kích hoạt'), 500);
    }

    // Tìm và cập nhật đơn hàng
    $order = wc_get_order($order_id);
    if (!$order) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Đơn hàng #'.$order_id.' không tồn tại trên hệ thống'), 404);
    }

    // Đổi trạng thái sang Đã hoàn thành (Completed) hoặc Đang xử lý (Processing)
    $order->update_status('completed', 'Thanh toán tự động qua PayMailHook. Số tiền nhận: ' . (isset($params['amount']) ? $params['amount'] : 0));
    
    return new WP_REST_Response(array(
        'success' => true, 
        'message' => 'Đã xác nhận thanh toán thành công cho đơn hàng #' . $order_id
    ), 200);
}