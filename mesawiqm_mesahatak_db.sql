-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- مضيف: localhost:3306
-- وقت الجيل: 13 مارس 2026 الساعة 09:38
-- إصدار الخادم: 11.4.10-MariaDB-cll-lve
-- نسخة PHP: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- قاعدة بيانات: `mesawiqm_mesahatak_db`
--

-- --------------------------------------------------------

--
-- بنية الجدول `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `total_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `space_id`, `start_time`, `end_time`, `total_price`, `status`, `created_at`, `updated_at`) VALUES
(7, 4, 16, '2026-01-31 21:00:00', '2027-01-31 20:59:00', 52000.00, 'confirmed', '2026-01-19 03:05:57', '2026-01-19 03:06:12'),
(8, 4, 17, '2026-01-19 07:00:00', '2026-01-19 09:00:00', 150.00, 'confirmed', '2026-01-19 03:07:06', '2026-01-19 03:07:23'),
(9, 4, 15, '2026-01-21 05:00:00', '2026-02-21 04:59:00', 2500.00, 'pending', '2026-01-27 10:53:54', '2026-01-27 10:53:54');

-- --------------------------------------------------------

--
-- بنية الجدول `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(40) NOT NULL,
  `name_en` varchar(150) NOT NULL,
  `name_ar` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `categories`
--

INSERT INTO `categories` (`id`, `code`, `name_en`, `name_ar`, `created_at`, `updated_at`) VALUES
(28, 'residential', 'Residential', 'سكني', '2026-01-17 15:24:32', '2026-01-17 15:24:32'),
(29, 'commercial', 'Commercial', 'تجاري', '2026-01-17 15:24:32', '2026-01-17 15:24:32'),
(30, 'sports', 'Sports & Leisure', 'رياضي وترفيهي', '2026-01-17 15:24:32', '2026-01-17 15:24:32'),
(31, 'storage', 'Storage & Logistics', 'مستودعات ولوجستيات', '2026-01-17 15:24:32', '2026-01-17 15:24:32'),
(32, 'events', 'Events', 'مناسبات وفعاليات', '2026-01-17 15:24:32', '2026-01-17 15:24:32'),
(33, 'parking', 'Parking', 'مواقف ومركبات', '2026-01-17 15:24:32', '2026-01-17 15:24:32'),
(34, 'industrial', 'Industrial', 'صناعي', '2026-01-17 15:24:32', '2026-01-17 15:24:32'),
(35, 'outdoor', 'Outdoor', 'خارجي / مفتوح', '2026-01-17 15:24:32', '2026-01-17 15:24:32'),
(36, 'other', 'Other', 'أخرى', '2026-01-17 15:24:32', '2026-01-17 15:24:32');

-- --------------------------------------------------------

--
-- بنية الجدول `cities`
--

CREATE TABLE `cities` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `cities`
--

INSERT INTO `cities` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'الرياض', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(2, 'جدة', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(3, 'مكة المكرمة', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(4, 'المدينة المنورة', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(5, 'الدمام', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(6, 'الخبر', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(7, 'الظهران', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(8, 'الطائف', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(9, 'تبوك', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(10, 'حائل', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(11, 'أبها', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(12, 'خميس مشيط', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(13, 'جازان', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(14, 'نجران', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(15, 'الباحة', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(16, 'عرعر', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(17, 'سكاكا', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(18, 'بيشة', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(19, 'ينبع', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(20, 'القريات', '2026-01-17 04:13:34', '2026-01-17 04:13:34'),
(21, 'الأحساء', '2026-01-17 04:13:34', '2026-01-17 04:13:34');

-- --------------------------------------------------------

--
-- بنية الجدول `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(120) DEFAULT NULL,
  `status` enum('paid','failed') NOT NULL DEFAULT 'failed',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `amount`, `payment_method`, `transaction_id`, `status`, `created_at`, `updated_at`) VALUES
(3, 7, 52000.00, 'card', 'TX-1768791972524-1866', 'paid', '2026-01-19 03:06:12', '2026-01-19 03:06:12'),
(4, 8, 150.00, 'card', 'TX-1768792043343-8576', 'paid', '2026-01-19 03:07:23', '2026-01-19 03:07:23');

-- --------------------------------------------------------

--
-- بنية الجدول `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `reviews`
--

INSERT INTO `reviews` (`id`, `booking_id`, `space_id`, `user_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
(1, 7, 16, 4, 4, 'رائع', '2026-01-19 03:06:24', '2026-01-19 03:06:24');

-- --------------------------------------------------------

--
-- بنية الجدول `spaces`
--

CREATE TABLE `spaces` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(180) NOT NULL,
  `city_id` int(11) NOT NULL,
  `category` varchar(40) NOT NULL,
  `subcategory` varchar(80) NOT NULL,
  `category_other` varchar(120) DEFAULT NULL,
  `google_maps_url` varchar(255) DEFAULT NULL,
  `rental_type` enum('daily','hourly','monthly','yearly') NOT NULL DEFAULT 'daily',
  `price_per_day` decimal(10,2) DEFAULT NULL,
  `price_per_block` decimal(10,2) DEFAULT NULL,
  `price_per_month` decimal(10,2) DEFAULT NULL,
  `price_per_year` decimal(10,2) DEFAULT NULL,
  `min_months` int(11) DEFAULT 1,
  `min_years` int(11) DEFAULT 1,
  `block_hours` int(11) DEFAULT NULL,
  `work_start` time DEFAULT NULL,
  `work_end` time DEFAULT NULL,
  `availability_start` date DEFAULT NULL,
  `availability_end` date DEFAULT NULL,
  `description` mediumtext NOT NULL,
  `content` mediumtext NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `spaces`
--

INSERT INTO `spaces` (`id`, `user_id`, `name`, `city_id`, `category`, `subcategory`, `category_other`, `google_maps_url`, `rental_type`, `price_per_day`, `price_per_block`, `price_per_month`, `price_per_year`, `min_months`, `min_years`, `block_hours`, `work_start`, `work_end`, `availability_start`, `availability_end`, `description`, `content`, `created_at`, `updated_at`) VALUES
(14, 5, 'شاليه فاخر بإطلالة بحرية', 6, 'residential', 'شاليه', NULL, 'https://maps.google.com/?q=25.3405347,49.59991100000001', 'daily', 900.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-19', '2026-05-19', 'شاليه مميز للعائلات، قريب من البحر، مناسب للإجازات والويكند.', 'مسبح\r\nمكيف\r\nمطبخ مجهز\r\nجلسة خارجية\r\nموقف سيارة', '2026-01-19 02:56:50', '2026-01-19 04:32:33'),
(15, 5, 'مكتب إداري مجهز بالكامل', 1, 'commercial', 'مكتب', NULL, 'https://maps.google.com/?q=25.3405347,49.59991100000001', 'monthly', NULL, NULL, 2500.00, NULL, 1, NULL, NULL, NULL, NULL, '2026-01-19', NULL, 'مكتب إداري مناسب للشركات الناشئة، يحتوي على أثاث مكتبي كامل، إضاءة جيدة، وموقع قريب من الخدمات.', 'مكيف\r\nإنترنت عالي السرعة\r\nمكتب + كراسي\r\nدورة مياه\r\nموقف سيارات', '2026-01-19 02:58:58', '2026-01-19 04:33:36'),
(16, 5, 'مستودع تخزين صناعي', 2, 'storage', 'مستودع مغلق', NULL, 'https://maps.google.com/?q=25.3405347,49.59991100000001', 'yearly', NULL, NULL, NULL, 52000.00, NULL, 1, NULL, NULL, NULL, '2026-02-01', NULL, 'مستودع واسع مناسب للتخزين طويل المدى، مع بوابة تحميل وأمان عالي.', 'بوابة تحميل\r\nنظام أمان\r\nكهرباء صناعية\r\nأرضية خرسانية\r\nمواقف شاحنات', '2026-01-19 03:01:48', '2026-01-19 04:34:21'),
(17, 5, 'غرفة اجتماعات تنفيذية\r\n', 21, 'events', 'قاعة اجتماعات', NULL, 'https://maps.google.com/?q=25.3405347,49.59991100000001', 'hourly', NULL, 150.00, NULL, NULL, NULL, NULL, 2, '06:00:00', '22:00:00', '2026-01-19', '2027-01-19', 'غرفة اجتماعات مجهزة للاجتماعات الرسمية والعروض التقديمية، مناسبة حتى 10 أشخاص.', 'شاشة عرض\r\nطاولة اجتماعات\r\nكراسي\r\nإنترنت\r\nمكيف', '2026-01-19 03:04:55', '2026-01-19 04:35:05');

-- --------------------------------------------------------

--
-- بنية الجدول `space_images`
--

CREATE TABLE `space_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `space_images`
--

INSERT INTO `space_images` (`id`, `space_id`, `file_path`, `sort_order`, `created_at`) VALUES
(33, 14, '/uploads/spaces/1768791410826-619006094.jpg', 0, '2026-01-19 02:56:50'),
(34, 14, '/uploads/spaces/1768791410830-412073421.jpg', 1, '2026-01-19 02:56:50'),
(35, 15, '/uploads/spaces/1768791538777-63767899.avif', 0, '2026-01-19 02:58:58'),
(36, 15, '/uploads/spaces/1768791538780-913881369.jpg', 1, '2026-01-19 02:58:58'),
(37, 15, '/uploads/spaces/1768791538780-365284400.jpg', 2, '2026-01-19 02:58:58'),
(38, 16, '/uploads/spaces/1768791708385-738851909.jpg', 0, '2026-01-19 03:01:48'),
(39, 16, '/uploads/spaces/1768791708387-312483035.jpg', 1, '2026-01-19 03:01:48'),
(40, 16, '/uploads/spaces/1768791708388-544819173.jpg', 2, '2026-01-19 03:01:48'),
(41, 17, '/uploads/spaces/1768791895234-658036521.jpg', 0, '2026-01-19 03:04:55'),
(42, 17, '/uploads/spaces/1768791895235-579226222.jpg', 1, '2026-01-19 03:04:55');

-- --------------------------------------------------------

--
-- بنية الجدول `subcategories`
--

CREATE TABLE `subcategories` (
  `id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `value` varchar(150) NOT NULL,
  `name_en` varchar(150) NOT NULL,
  `name_ar` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `subcategories`
--

INSERT INTO `subcategories` (`id`, `category_id`, `value`, `name_en`, `name_ar`, `created_at`, `updated_at`) VALUES
(1, 28, 'شقة', 'Apartment', 'شقة', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(2, 28, 'فيلا', 'Villa', 'فيلا', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(3, 28, 'غرفة', 'Room', 'غرفة', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(4, 28, 'استديو', 'Studio', 'استديو', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(5, 28, 'سكن عمال', 'Labor Housing', 'سكن عمال', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(6, 28, 'شاليه', 'Chalet', 'شاليه', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(7, 28, 'مزرعة سكنية', 'Residential Farm', 'مزرعة سكنية', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(8, 29, 'مكتب', 'Office', 'مكتب', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(9, 29, 'محل', 'Shop', 'محل', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(10, 29, 'معرض', 'Showroom', 'معرض', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(11, 29, 'كشك', 'Kiosk', 'كشك', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(12, 29, 'مركز أعمال', 'Business Center', 'مركز أعمال', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(13, 29, 'مساحة عمل مشتركة', 'Coworking Space', 'مساحة عمل مشتركة', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(14, 30, 'ملعب كرة قدم', 'Football Field', 'ملعب كرة قدم', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(15, 30, 'ملعب كرة سلة', 'Basketball Court', 'ملعب كرة سلة', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(16, 30, 'ملعب تنس', 'Tennis Court', 'ملعب تنس', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(17, 30, 'صالة رياضية', 'Gym', 'صالة رياضية', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(18, 30, 'مسبح', 'Pool', 'مسبح', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(19, 30, 'صالة ألعاب', 'Arcade', 'صالة ألعاب', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(20, 30, 'استراحة', 'Rest Area', 'استراحة', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(21, 31, 'مستودع مغلق', 'Closed Warehouse', 'مستودع مغلق', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(22, 31, 'مستودع مفتوح', 'Open Warehouse', 'مستودع مفتوح', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(23, 31, 'مخزن تبريد', 'Cold Storage', 'مخزن تبريد', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(24, 31, 'هنقر', 'Hangar', 'هنقر', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(25, 31, 'ساحة تخزين', 'Storage Yard', 'ساحة تخزين', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(26, 32, 'قاعة أفراح', 'Wedding Hall', 'قاعة أفراح', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(27, 32, 'قاعة اجتماعات', 'Meeting Room', 'قاعة اجتماعات', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(28, 32, 'قاعة مؤتمرات', 'Conference Hall', 'قاعة مؤتمرات', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(29, 32, 'مسرح', 'Theater', 'مسرح', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(30, 32, 'مساحة تصوير', 'Studio', 'مساحة تصوير', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(31, 32, 'قاعة تدريب', 'Training Room', 'قاعة تدريب', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(32, 33, 'موقف سيارة', 'Car Parking', 'موقف سيارة', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(33, 33, 'موقف دراجات', 'Bike Parking', 'موقف دراجات', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(34, 33, 'كراج خاص', 'Private Garage', 'كراج خاص', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(35, 33, 'موقف شاحنات', 'Truck Parking', 'موقف شاحنات', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(36, 34, 'مصنع صغير', 'Small Factory', 'مصنع صغير', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(37, 34, 'ورشة', 'Workshop', 'ورشة', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(38, 34, 'ورشة سيارات', 'Auto Workshop', 'ورشة سيارات', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(39, 34, 'خط إنتاج', 'Production Line', 'خط إنتاج', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(40, 35, 'أرض فضاء', 'Vacant Land', 'أرض فضاء', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(41, 35, 'حديقة', 'Garden', 'حديقة', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(42, 35, 'مخيم', 'Camp', 'مخيم', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(43, 35, 'ساحة مفتوحة', 'Open Yard', 'ساحة مفتوحة', '2026-01-17 15:26:52', '2026-01-17 15:26:52'),
(44, 35, 'أرض زراعية', 'Farmland', 'أرض زراعية', '2026-01-17 15:26:52', '2026-01-17 15:26:52');

-- --------------------------------------------------------

--
-- بنية الجدول `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `birth_date` date NOT NULL,
  `phone` varchar(20) NOT NULL,
  `iban` varchar(34) DEFAULT NULL,
  `city_id` int(10) UNSIGNED NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `birth_date`, `phone`, `iban`, `city_id`, `role`, `created_at`, `updated_at`) VALUES
(3, 'Admin Superuser', 'admin@ksa.sa', '$2a$10$NwkTikHI/0wxYevI4RdbxukX0BICo2zy2TX.yK.cSlhOQ.I6FCX/S', '1990-01-01', '0500000000', NULL, 11, 'admin', '2026-01-18 17:03:23', '2026-01-18 17:03:23'),
(4, 'مستخدم تجريبي', 'user@example.com', '$2a$10$osnveVrYt.q6cjCq3jdIZem/dEr4ZHwLZuMmfkFH/DktC/gMVILRO', '2000-01-01', '0500000001', 'SA0000000000000000000000', 6, 'user', '2026-01-18 17:31:59', '2026-01-23 00:25:27'),
(5, 'موسسة السلام ', 'demo@demo.com', '$2a$10$WuED8NlARBXZzHR6zZwOY.4E.7mxbdwe3JHNJkIkdHkTo6rvdsxtC', '2002-04-18', '0555555555', 'SA2080000261608040001000', 1, 'user', '2026-01-18 17:34:28', '2026-01-18 17:34:28');

--
-- Indexes for dumped tables
--

--
-- فهارس للجدول `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_space` (`space_id`),
  ADD KEY `idx_booking_user` (`user_id`);

--
-- فهارس للجدول `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_categories_code` (`code`);

--
-- فهارس للجدول `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cities_name` (`name`);

--
-- فهارس للجدول `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_payment_booking` (`booking_id`);

--
-- فهارس للجدول `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_review_booking` (`booking_id`),
  ADD KEY `fk_review_space` (`space_id`),
  ADD KEY `fk_review_user` (`user_id`);

--
-- فهارس للجدول `spaces`
--
ALTER TABLE `spaces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city` (`city_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_rental_type` (`rental_type`);

--
-- فهارس للجدول `space_images`
--
ALTER TABLE `space_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `space_id` (`space_id`);

--
-- فهارس للجدول `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subcategories_category` (`category_id`);

--
-- فهارس للجدول `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `fk_users_city` (`city_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `spaces`
--
ALTER TABLE `spaces`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `space_images`
--
ALTER TABLE `space_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- القيود المفروضة على الجداول الملقاة
--

--
-- قيود الجداول `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_booking_space` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `space_images`
--
ALTER TABLE `space_images`
  ADD CONSTRAINT `space_images_ibfk_1` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `fk_subcategories_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_city` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
