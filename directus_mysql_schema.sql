-- ==========================================================
-- BISHWO SHAHITTO KENDRO (BSK) - DIRECTUS MYSQL SCHEMA & SEED
-- Database Engine: MySQL 8.0+ / MariaDB 10.5+
-- ==========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. Table: website_pages (All site pages & dynamic sections)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `website_pages` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `sort_order` INT DEFAULT 0,
  `title_bn` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `subtitle_bn` TEXT NULL,
  `subtitle_en` TEXT NULL,
  `badge_bn` VARCHAR(100) NULL,
  `badge_en` VARCHAR(100) NULL,
  `hero_image` VARCHAR(255) NULL,
  `hero_desc_bn` TEXT NULL,
  `hero_desc_en` TEXT NULL,
  `sections` JSON NULL COMMENT 'Array of {title, content, image, etc.}',
  `extra_sections` JSON NULL COMMENT 'Custom user added sections with rich layouts',
  `key_facts` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Table: hero_slides (Homepage Interactive Sliders)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `sort_order` INT DEFAULT 0,
  `badge_bn` VARCHAR(100) NULL,
  `badge_en` VARCHAR(100) NULL,
  `title_bn` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `subtitle_bn` TEXT NULL,
  `subtitle_en` TEXT NULL,
  `image` VARCHAR(255) NOT NULL,
  `button_text_bn` VARCHAR(100) NULL,
  `button_text_en` VARCHAR(100) NULL,
  `button_link` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Table: notices (Circulars, Notice Board, Downloads)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `title_bn` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'general',
  `publish_date` DATE NOT NULL,
  `pdf_file` VARCHAR(255) NULL,
  `is_urgent` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Table: publications (BSK Books, Catalogs, Sales)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `publications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_bn` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `author_bn` VARCHAR(255) NOT NULL,
  `author_en` VARCHAR(255) NULL,
  `category` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount_price` DECIMAL(10,2) NULL,
  `cover_image` VARCHAR(255) NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. Table: inquiries (Visitor forms, Membership & Contact)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(50) NOT NULL DEFAULT 'general',
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NULL,
  `institution` VARCHAR(255) NULL,
  `message` TEXT NOT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
