-- ==========================================================
-- BISHWO SHAHITTO KENDRO (BSK) - DIRECTUS & CPANEL MYSQL SCHEMA
-- Database Engine: MySQL 8.0+ / MariaDB 10.5+
-- Database Name: bskbd_new
-- ==========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. Table: bsk_documents (JSON Document Engine for CMS & Firebase Bridge)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_documents` (
  `id` VARCHAR(191) NOT NULL,
  `collection` VARCHAR(100) NOT NULL,
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`collection`, `id`),
  KEY `idx_collection` (`collection`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Table: bsk_website_pages (Dynamic Website Pages & Sections)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_website_pages` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `sort_order` INT DEFAULT 0,
  `title_bn` VARCHAR(500) NOT NULL,
  `title_en` VARCHAR(500) NULL,
  `html_title` VARCHAR(500) NULL,
  `subtitle_bn` TEXT NULL,
  `subtitle_en` TEXT NULL,
  `badge_bn` VARCHAR(200) NULL,
  `hero_image` VARCHAR(500) NULL,
  `category` VARCHAR(100) DEFAULT 'general',
  `sections` LONGTEXT NULL,
  `extra_data` LONGTEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Table: bsk_hero_slides (Homepage Banners & Sliders)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_hero_slides` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `status` VARCHAR(20) DEFAULT 'published',
  `sort_order` INT DEFAULT 0,
  `badge_bn` VARCHAR(255) NULL,
  `badge_en` VARCHAR(255) NULL,
  `title_bn` VARCHAR(500) NOT NULL DEFAULT '',
  `title_en` VARCHAR(500) NULL,
  `desc_bn` TEXT NULL,
  `desc_en` TEXT NULL,
  `caption_bn` TEXT NULL,
  `caption_en` TEXT NULL,
  `bg_image` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Table: bsk_homepage_blocks (Blocks, History, Founder, Stats)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_homepage_blocks` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `block_type` VARCHAR(100) DEFAULT 'generic',
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. Table: bsk_notices (Notice Board & Circulars)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_notices` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `status` VARCHAR(20) DEFAULT 'published',
  `title_bn` VARCHAR(500) NOT NULL DEFAULT '',
  `title_en` VARCHAR(500) NULL,
  `desc_bn` TEXT NULL,
  `desc_en` TEXT NULL,
  `category` VARCHAR(100) DEFAULT 'general',
  `publish_date` DATE NULL,
  `pdf_file` VARCHAR(500) NULL,
  `is_urgent` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_bn` VARCHAR(200) NULL,
  `date_en` VARCHAR(200) NULL,
  `is_new` TINYINT(1) DEFAULT 0,
  `file_url` TEXT NULL,
  `file_type` VARCHAR(50) NULL,
  `file_name` VARCHAR(500) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. Table: bsk_events (Seminars & Programs)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_events` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `status` VARCHAR(20) DEFAULT 'published',
  `title_bn` VARCHAR(500) NOT NULL DEFAULT '',
  `title_en` VARCHAR(500) NULL,
  `desc_bn` TEXT NULL,
  `desc_en` TEXT NULL,
  `event_date` DATE NULL,
  `event_time` VARCHAR(100) NULL,
  `location_bn` VARCHAR(500) NULL,
  `location_en` VARCHAR(500) NULL,
  `image` VARCHAR(500) NULL,
  `link` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `day` VARCHAR(20) NULL,
  `day_en` VARCHAR(20) NULL,
  `month` VARCHAR(50) NULL,
  `month_en` VARCHAR(50) NULL,
  `chip_bn` VARCHAR(200) NULL,
  `chip_en` VARCHAR(200) NULL,
  `time_bn` VARCHAR(100) NULL,
  `time_en` VARCHAR(100) NULL,
  `file_url` TEXT NULL,
  `file_type` VARCHAR(50) NULL,
  `file_name` VARCHAR(500) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 7. Table: bsk_recent_activities (Recent BSK Activities)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_recent_activities` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `status` VARCHAR(20) DEFAULT 'published',
  `sort_order` INT DEFAULT 0,
  `title_bn` VARCHAR(500) NOT NULL DEFAULT '',
  `title_en` VARCHAR(500) NULL,
  `desc_bn` TEXT NULL,
  `desc_en` TEXT NULL,
  `date_bn` VARCHAR(100) NULL,
  `date_en` VARCHAR(100) NULL,
  `location_bn` VARCHAR(500) NULL,
  `location_en` VARCHAR(500) NULL,
  `category_bn` VARCHAR(200) NULL,
  `category_en` VARCHAR(200) NULL,
  `caption_bn` TEXT NULL,
  `caption_en` TEXT NULL,
  `image` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 8. Table: bsk_press (Press Releases & Media Coverage)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_press` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `status` VARCHAR(20) DEFAULT 'published',
  `title_bn` VARCHAR(500) NULL,
  `title_en` VARCHAR(500) NULL,
  `content_bn` LONGTEXT NULL,
  `content_en` LONGTEXT NULL,
  `source` VARCHAR(255) NULL,
  `publish_date` DATE NULL,
  `image` VARCHAR(500) NULL,
  `link` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 9. Table: bsk_photo_albums (Photo Gallery Albums)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_photo_albums` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `status` VARCHAR(20) DEFAULT 'published',
  `title_bn` VARCHAR(500) NOT NULL DEFAULT '',
  `title_en` VARCHAR(500) NULL,
  `cover_image` VARCHAR(500) NULL,
  `photos` LONGTEXT NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 10. Table: bsk_blog_reviews (Book Reviews & Blogs)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_blog_reviews` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `status` VARCHAR(20) DEFAULT 'pending',
  `title_bn` VARCHAR(500) NULL,
  `title_en` VARCHAR(500) NULL,
  `content_bn` LONGTEXT NULL,
  `content_en` LONGTEXT NULL,
  `author_name` VARCHAR(255) NULL,
  `author_image` VARCHAR(500) NULL,
  `image` VARCHAR(500) NULL,
  `rating` TINYINT NULL,
  `category` VARCHAR(100) DEFAULT 'review',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 11. Table: bsk_inquiries (Contact Us & Registration Messages)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_inquiries` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `type` VARCHAR(50) DEFAULT 'general',
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `institution` VARCHAR(500) NULL,
  `message` TEXT NULL,
  `status` VARCHAR(20) DEFAULT 'new',
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 12. Table: bsk_admin_users (CMS Administrative Users)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bsk_admin_users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(255) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(255) NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
