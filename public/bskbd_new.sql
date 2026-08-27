-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 22, 2026 at 08:13 PM
-- Server version: 10.6.27-MariaDB
-- PHP Version: 8.4.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bskbd_new`
--

-- --------------------------------------------------------

--
-- Table structure for table `bsk_admin_users`
--

CREATE TABLE IF NOT EXISTS `bsk_admin_users` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'admin',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bsk_blog_reviews`
--

CREATE TABLE IF NOT EXISTS `bsk_blog_reviews` (
  `id` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `title_bn` varchar(500) DEFAULT NULL,
  `title_en` varchar(500) DEFAULT NULL,
  `content_bn` longtext DEFAULT NULL,
  `content_en` longtext DEFAULT NULL,
  `author_name` varchar(255) DEFAULT NULL,
  `author_image` varchar(500) DEFAULT NULL,
  `image` mediumtext DEFAULT NULL,
  `rating` tinyint(4) DEFAULT NULL,
  `category` varchar(100) DEFAULT 'review',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bsk_blog_reviews`
--

INSERT INTO `bsk_blog_reviews` (`id`, `status`, `title_bn`, `title_en`, `content_bn`, `content_en`, `author_name`, `author_image`, `image`, `rating`, `category`, `created_at`, `updated_at`) VALUES
('tb0rswy565d', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 'বই সমালোচনা', '2026-08-19 04:20:40', '2026-08-19 04:20:40')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- --------------------------------------------------------

--
-- Table structure for table `bsk_documents`
--

CREATE TABLE IF NOT EXISTS `bsk_documents` (
  `id` varchar(191) NOT NULL,
  `collection` varchar(100) NOT NULL,
  `data` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`collection`,`id`),
  KEY `idx_collection` (`collection`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bsk_documents`
--

INSERT INTO `bsk_documents` (`id`, `collection`, `data`, `created_at`, `updated_at`) VALUES
('blog-1787113202928', 'blog_posts', '{\"id\":\"blog-1787113202928\",\"title_bn\":\"ads\",\"title_en\":\"\",\"author_bn\":\"আব্দুল্লাহ আবু সায়ীদ\",\"author_role_bn\":\"বিশ্বসাহিত্য কেন্দ্র\",\"category_bn\":\"সাহিত্য ও চিন্তা\",\"category_en\":\"Literature\",\"excerpt_bn\":\"asd\",\"excerpt_en\":\"\",\"content_bn\":\"ad\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80\",\"read_time_bn\":\"৫ মিনিট পাঠ\",\"date_bn\":\"১৯ আগস্ট, ২০২৬\",\"updatedAt\":\"2026-08-19T04:20:07+00:00\",\"createdAt\":\"2026-08-19T04:20:07.768Z\"}', '2026-08-19 04:20:07', '2026-08-19 04:20:07'),
('tb0rswy565d', 'blog_reviews', '{\"id\":\"tb0rswy565d\",\"reviewerName\":\"asd\",\"reviewerRole\":\"ads\",\"bookTitle\":\"asd\",\"rating\":2,\"category\":\"বই সমালোচনা\",\"content\":\"asd\",\"date\":\"১৯ আগস্ট, ২০২৬\",\"status\":\"approved\",\"createdAt\":\"2026-08-19T04:20:40.705Z\",\"updatedAt\":\"2026-08-19T04:20:40+00:00\"}', '2026-08-19 04:20:40', '2026-08-19 04:20:40'),
('slide-1787035744749', 'hero_slides', '{\"id\":\"slide-1787035744749\",\"badge_bn\":\"নতুন আপডেট\",\"badge_en\":\"New Announcement\",\"title_bn\":\"নতুন ব্যানার শিরোনাম\",\"title_en\":\"New Slide Title\",\"desc_bn\":\"দেশব্যাপী বড় বইপড়া আন্দোলন\",\"desc_en\":\"National reading circles program development\",\"bgImage\":\".\\/uploads\\/img_1787035777_21033465.jpg\",\"order\":2,\"createdAt\":\"2026-08-18T06:49:44.973Z\",\"updatedAt\":\"2026-08-18T06:49:44+00:00\"}', '2026-08-18 06:49:44', '2026-08-18 06:49:44'),
('slide-1787052233735', 'hero_slides', '{\"id\":\"slide-1787052233735\",\"status\":\"published\",\"order\":2,\"sort_order\":2,\"badge_bn\":\"নতুন আপডেট\",\"badge_en\":\"New Announcement\",\"title_bn\":\"নতুন ব্যানার শিরোনাম\",\"title_en\":\"New Slide Title\",\"desc_bn\":\"দেশব্যাপী বড় বইপড়া আন্দোলন\",\"desc_en\":\"National reading circles program development\",\"caption_bn\":null,\"caption_en\":null,\"bgImage\":\".\\/uploads\\/img_1787052465_c37184b1.jpeg\",\"bg_image\":\".\\/uploads\\/img_1787052421_496d10cb.jpeg\",\"created_at\":\"2026-08-18 17:27:04\",\"updated_at\":\"2026-08-18 17:27:04\",\"createdAt\":\"2026-08-18T11:27:45.888Z\",\"updatedAt\":\"2026-08-18T11:27:45+00:00\"}', '2026-08-18 11:24:19', '2026-08-18 11:27:45'),
('slide-1787052266919', 'hero_slides', '{\"id\":\"slide-1787052266919\",\"badge_bn\":\"নতুন আপডেট\",\"badge_en\":\"New Announcement\",\"title_bn\":\"নতুন ব্যানার শিরোনাম\",\"title_en\":\"New Slide Title\",\"desc_bn\":\"দেশব্যাপী বড় বইপড়া আন্দোলন\",\"desc_en\":\"National reading circles program development\",\"bgImage\":\".\\/uploads\\/img_1787052311_1bbe9fe8.jpg\",\"order\":2,\"createdAt\":\"2026-08-18T11:25:15.288Z\",\"updatedAt\":\"2026-08-18T11:25:15+00:00\"}', '2026-08-18 11:25:15', '2026-08-18 11:25:15'),
('slide-1787132265428', 'hero_slides', '{\"id\":\"slide-1787132265428\",\"badge_bn\":\"নতুন আপডেট\",\"badge_en\":\"New Announcement\",\"title_bn\":\"নতুন ব্যানার শিরোনাম\",\"title_en\":\"New Slide Title\",\"desc_bn\":\"দেশব্যাপী বড় বইপড়া আন্দোলন\",\"desc_en\":\"National reading circles program development\",\"bgImage\":\".\\/uploads\\/img_1787132285_9e1d227b.jpg\",\"order\":3,\"createdAt\":\"2026-08-19T09:38:07.629Z\",\"updatedAt\":\"2026-08-19T09:38:08+00:00\"}', '2026-08-19 09:38:08', '2026-08-19 09:38:08'),
('central_belief', 'homepage_blocks', '{\"title_bn\":\"বিশ্বসাহিত্য কেন্দ্র — একটি দেশব্যাপী আন্দোলন\",\"title_en\":\"Bishwo Shahitto Kendro — A National Awakening\",\"desc_bn\":\"বিশ্বসাহিত্য কেন্দ্র আজ আর শুধুমাত্র একটি সাধারণ লাইব্রেরি বা সভার কামরা নয়। এটি বাংলা ভাষাভাষী মানুষের চিত্তের সামগ্রিক ইতিবাচক পরিবর্তনের জন্য দেশব্যাপী জাতীয় ক্যারেক্টার ও চরিত্র তৈরি করার বিনীত প্রয়াস।\",\"desc_en\":\"Our movement stretches to accommodate every village school and local municipal body through continuous book reading assessments and high intellectual assemblies.\",\"btnText_bn\":\"আমাদের অর্জন ও ইতিহাস →\",\"btnText_en\":\"Core History & Milestones →\",\"btnRoute\":\"bsk-history\",\"stat1_val\":\"TEST\",\"stat1_lbl_bn\":\"বছরের গৌরবময় সংগ্রাম\",\"stat1_lbl_en\":\"Years of Legacy\",\"stat2_val\":\"৫০+\",\"stat2_lbl_bn\":\"দাতা ও সহযোগী\",\"stat2_lbl_en\":\"Global Donors\",\"stat3_val\":\"TEST\",\"stat3_lbl_bn\":\"বিতরণকৃত গ্রন্থসমূহ\",\"stat3_lbl_en\":\"Circulated Books\",\"stat4_val\":\"১২টি\",\"stat4_lbl_bn\":\"সক্রিয় বুদ্ধিজীবী ধারা\",\"stat4_lbl_en\":\"Core Programs\",\"id\":\"central_belief\",\"createdAt\":\"2026-08-18T11:29:12.719Z\",\"updatedAt\":\"2026-08-18T11:29:12+00:00\"}', '2026-08-18 11:29:12', '2026-08-18 11:29:12'),
('founder', 'homepage_blocks', '{\"name_bn\":\"TEST\",\"id\":\"founder\",\"createdAt\":\"2026-08-18T11:26:23.799Z\",\"updatedAt\":\"2026-08-19T09:39:01+00:00\",\"image\":\".\\/uploads\\/img_1787132339_43710a3a.jpeg\"}', '2026-08-18 11:26:24', '2026-08-19 09:39:01'),
('gallery_ml', 'homepage_blocks', '{\"slides\":[{\"image\":\"\\/assets\\/IMGS\\/LIBARY\\/484036140_1054485683369579_2651909291206012899_n.jpg\",\"category_bn\":\"ভ্রাম্যমাণ লাইব্রেরি\",\"category_en\":\"Mobile Library Network\",\"caption_bn\":\"বিশ্বসাহিত্য কেন্দ্র লাইব্রেরি কক্ষের মনোরম বইয়ের সারি\",\"caption_en\":\"A serene aisle of curated global books inside BSK Library\",\"route\":\"mobile-library\"},{\"image\":\".\\/uploads\\/img_1787132387_cdd4c2e8.jpg\",\"category_bn\":\"ভ্রাম্যমাণ লাইব্রেরি\",\"category_en\":\"Central Reading space\",\"caption_bn\":\"লাইব্রেরিতে নিবিড় অধ্যয়নরত পাঠক ও সভ্যবৃন্দ\",\"caption_en\":\"Avid members engrossed in deep study at BSK HQ\",\"route\":\"mobile-library\"}],\"id\":\"gallery_ml\",\"createdAt\":\"2026-08-18T08:41:37.474Z\",\"updatedAt\":\"2026-08-19T09:39:49+00:00\"}', '2026-08-18 08:41:38', '2026-08-19 09:39:49'),
('gallery_rh', 'homepage_blocks', '{\"slides\":[{\"image\":\"\\/assets\\/IMGS\\/482211665_1052017196949761_6208359942702643653_n.jpg\",\"category_bn\":\"দেশভিত্তিক উৎকর্ষ\",\"category_en\":\"Elite Book Assessment\",\"caption_bn\":\"দেশভিত্তিক উৎকর্ষ কার্যক্রমে বই মূল্যায়ন পরীক্ষা ও পুরস্কার\",\"caption_en\":\"Elite book evaluation assessments and creative reading rewards\",\"route\":\"reading-habit\"}],\"id\":\"gallery_rh\",\"createdAt\":\"2026-08-18T11:28:40.263Z\",\"updatedAt\":\"2026-08-18T11:28:42+00:00\"}', '2026-08-18 11:28:42', '2026-08-18 11:28:42'),
('portals', 'homepage_blocks', '{\"bcrs\":{\"bgImage\":\".\\/uploads\\/img_1787052634_545ea039.jpeg\"},\"id\":\"portals\",\"createdAt\":\"2026-08-18T11:30:45.359Z\",\"updatedAt\":\"2026-08-19T04:13:43+00:00\",\"alor\":{\"bgImage\":\".\\/uploads\\/img_1787112821_44eda6be.jpeg\"}}', '2026-08-18 11:30:46', '2026-08-19 04:13:43'),
('statistics', 'homepage_blocks', '{\"card1_title_bn\":\"test\",\"card1_value_bn\":\"test\",\"card1_desc_bn\":\"test\",\"card1_desc_en\":\"test\",\"card1_bgImage\":\".\\/uploads\\/img_1787112874_a0484aa0.jpeg\",\"card2_title_bn\":\"test\",\"card2_value_bn\":\"test\",\"card2_desc_bn\":\"test\",\"card2_title_en\":\"test\",\"card2_bgImage\":\".\\/uploads\\/img_1787112885_b402945c.jpeg\",\"card3_title_bn\":\"test\",\"card3_value_bn\":\"test\",\"card3_desc_bn\":\"test\",\"card3_bgImage\":\".\\/uploads\\/img_1787112893_b1b2c667.jpeg\",\"card4_title_bn\":\"test\",\"card4_value_bn\":\"testtest\",\"card4_desc_bn\":\"test\",\"card4_bgImage\":\".\\/uploads\\/img_1787112901_c235d85c.jpeg\",\"id\":\"statistics\",\"createdAt\":\"2026-08-19T04:15:02.888Z\",\"updatedAt\":\"2026-08-19T04:15:02+00:00\"}', '2026-08-18 08:42:53', '2026-08-19 04:15:02'),
('nationwide-excellence', 'homepage_programs', '{\"id\":\"nationwide-excellence\",\"title_bn\":\"দেশভিত্তিক উৎকর্ষ কার্যক্রম\",\"title_en\":\"Nationwide Excellence Program\",\"desc_bn\":\"৬৪ জেলায় দেশভিত্তিক সাহিত্য মূল্যায়ন ও বইপড়া আন্দোলন।\",\"desc_en\":\"Countrywide elite reading evaluation & movement.\",\"tag_bn\":\"৬৪ জেলা\",\"tag_en\":\"64 Districts\",\"colorClass\":\"bg-[#8B3A1E] text-orange-100\",\"icon\":\"Award\",\"bgImage\":\".\\/uploads\\/img_1787046748_69778cf4.jpeg\",\"order\":1,\"createdAt\":\"2026-08-18T09:52:36.908Z\",\"updatedAt\":\"2026-08-18T09:52:37+00:00\"}', '2026-08-18 09:50:10', '2026-08-18 09:52:37'),
('album_1787113174352', 'photo_albums', '{\"id\":\"album_1787113174352\",\"name_bn\":\"asd\",\"name_en\":\"asd\",\"cover\":\".\\/uploads\\/img_1787113177_4585901d.jpeg\",\"photos\":[],\"updatedAt\":\"2026-08-19T04:19:40+00:00\",\"createdAt\":\"2026-08-19T04:19:41.096Z\"}', '2026-08-19 04:19:40', '2026-08-19 04:19:40'),
('press_1787113125640', 'press', '{\"id\":\"press_1787113125640\",\"title_bn\":\"dvs\",\"title_en\":\"wsf\",\"category\":\"Press Release\",\"summary\":\"asdf\",\"content\":\"asdf\",\"publishedDate\":\"2026-08-19\",\"author\":\"মিডিয়া সেল, বিএসকে\",\"status\":\"published\",\"coverImage\":\".\\/uploads\\/img_1787113135_1c768c2d.jpeg\",\"pdf\":\"\",\"updatedAt\":\"2026-08-19T04:19:05+00:00\",\"createdAt\":\"2026-08-19T04:19:05.320Z\"}', '2026-08-19 04:19:05', '2026-08-19 04:19:05'),
('act-1787035817845', 'recent_activities', '{\"id\":\"act-1787035817845\",\"title_bn\":\"নতুন কার্যক্রমের নাম\",\"title_en\":\"New Activity Title\",\"desc_bn\":\"সংক্ষিপ্ত বিবরণী এখানে লিখুন।\",\"desc_en\":\"Brief description goes here.\",\"date_bn\":\"১১ জুন ২০২৬\",\"date_en\":\"June 11, 2526\",\"loc_bn\":\"বিশ্বসাহিত্য কেন্দ্র লবি, ঢাকা\",\"loc_en\":\"BSK Premises, Dhaka\",\"category_bn\":\"কার্যক্রম\",\"category_en\":\"Program\",\"caption_bn\":\"\",\"caption_en\":\"\",\"image\":\".\\/uploads\\/img_1787035853_5ecdb027.jpg\",\"order\":1,\"createdAt\":\"2026-08-18T06:51:01.301Z\",\"updatedAt\":\"2026-08-18T06:51:00+00:00\"}', '2026-08-18 06:51:00', '2026-08-18 06:51:00'),
('act-1787052326359', 'recent_activities', '{\"id\":\"act-1787052326359\",\"status\":\"published\",\"order\":1,\"sort_order\":2,\"title_bn\":\"নতুন কার্যক্রমের নাম\",\"title_en\":\"New Activity Title\",\"desc_bn\":\"সংক্ষিপ্ত বিবরণী এখানে লিখুন।\",\"desc_en\":\"Brief description goes here.\",\"date_bn\":\"১১ জুন ২০২৬\",\"date_en\":\"June 11, 2526\",\"loc_bn\":\"বিশ্বসাহিত্য কেন্দ্র লবি, ঢাকা\",\"location_bn\":\"বিশ্বসাহিত্য কেন্দ্র লবি, ঢাকা\",\"loc_en\":\"BSK Premises, Dhaka\",\"location_en\":\"BSK Premises, Dhaka\",\"category_bn\":\"কার্যক্রম\",\"category_en\":\"Program\",\"caption_bn\":\"\",\"caption_en\":\"\",\"image\":\".\\/uploads\\/img_1787052337_feceefb3.jpg\",\"created_at\":\"2026-08-18 17:25:41\",\"updated_at\":\"2026-08-18 17:25:41\",\"createdAt\":\"2026-08-18T11:25:54.056Z\",\"updatedAt\":\"2026-08-18T11:25:53+00:00\"}', '2026-08-18 11:25:41', '2026-08-18 11:25:53'),
('act-1787052356199', 'recent_activities', '{\"id\":\"act-1787052356199\",\"title_bn\":\"নতুন কার্যক্রমের নাম\",\"title_en\":\"New Activity Title\",\"desc_bn\":\"সংক্ষিপ্ত বিবরণী এখানে লিখুন।\",\"desc_en\":\"Brief description goes here.\",\"date_bn\":\"১১ জুন ২০২৬\",\"date_en\":\"June 11, 2526\",\"loc_bn\":\"বিশ্বসাহিত্য কেন্দ্র লবি, ঢাকা\",\"loc_en\":\"BSK Premises, Dhaka\",\"category_bn\":\"কার্যক্রম\",\"category_en\":\"Program\",\"caption_bn\":\"\",\"caption_en\":\"\",\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80\",\"order\":2,\"createdAt\":\"2026-08-18T11:26:01.544Z\",\"updatedAt\":\"2026-08-18T11:26:02+00:00\"}', '2026-08-18 11:26:02', '2026-08-18 11:26:02')
ON DUPLICATE KEY UPDATE `data` = VALUES(`data`);

-- --------------------------------------------------------

--
-- Table structure for table `bsk_events`
--

CREATE TABLE IF NOT EXISTS `bsk_events` (
  `id` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'published',
  `title_bn` varchar(500) NOT NULL DEFAULT '',
  `title_en` varchar(500) DEFAULT NULL,
  `desc_bn` text DEFAULT NULL,
  `desc_en` text DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `event_time` varchar(100) DEFAULT NULL,
  `location_bn` varchar(500) DEFAULT NULL,
  `location_en` varchar(500) DEFAULT NULL,
  `image` mediumtext DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `day` varchar(20) DEFAULT NULL,
  `day_en` varchar(20) DEFAULT NULL,
  `month` varchar(50) DEFAULT NULL,
  `month_en` varchar(50) DEFAULT NULL,
  `chip_bn` varchar(200) DEFAULT NULL,
  `chip_en` varchar(200) DEFAULT NULL,
  `time_bn` varchar(100) DEFAULT NULL,
  `time_en` varchar(100) DEFAULT NULL,
  `file_url` text DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_name` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bsk_hero_slides`
--

CREATE TABLE IF NOT EXISTS `bsk_hero_slides` (
  `id` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'published',
  `sort_order` int(11) DEFAULT 0,
  `badge_bn` varchar(255) DEFAULT NULL,
  `badge_en` varchar(255) DEFAULT NULL,
  `title_bn` varchar(500) NOT NULL DEFAULT '',
  `title_en` varchar(500) DEFAULT NULL,
  `desc_bn` text DEFAULT NULL,
  `desc_en` text DEFAULT NULL,
  `caption_bn` text DEFAULT NULL,
  `caption_en` text DEFAULT NULL,
  `bg_image` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bsk_hero_slides`
--

INSERT INTO `bsk_hero_slides` (`id`, `status`, `sort_order`, `badge_bn`, `badge_en`, `title_bn`, `title_en`, `desc_bn`, `desc_en`, `caption_bn`, `caption_en`, `bg_image`, `created_at`, `updated_at`) VALUES
('slide-1787052233735', 'published', 2, 'নতুন আপডেট', 'New Announcement', 'নতুন ব্যানার শিরোনাম', 'New Slide Title', 'দেশব্যাপী বড় বইপড়া আন্দোলন', 'National reading circles program development', NULL, NULL, './uploads/img_1787052465_c37184b1.jpeg', '2026-08-18 11:27:45', '2026-08-18 11:27:45'),
('slide-1787052266919', 'published', 2, 'নতুন আপডেট', 'New Announcement', 'নতুন ব্যানার শিরোনাম', 'New Slide Title', 'দেশব্যাপী বড় বইপড়া আন্দোলন', 'National reading circles program development', NULL, NULL, './uploads/img_1787052311_1bbe9fe8.jpg', '2026-08-18 11:25:15', '2026-08-18 11:25:15'),
('slide-1787132265428', 'published', 3, 'নতুন আপডেট', 'New Announcement', 'নতুন ব্যানার শিরোনাম', 'New Slide Title', 'দেশব্যাপী বড় বইপড়া আন্দোলন', 'National reading circles program development', NULL, NULL, './uploads/img_1787132285_9e1d227b.jpg', '2026-08-19 09:38:08', '2026-08-19 09:38:08')
ON DUPLICATE KEY UPDATE `title_bn` = VALUES(`title_bn`);

-- --------------------------------------------------------

--
-- Table structure for table `bsk_homepage_blocks`
--

CREATE TABLE IF NOT EXISTS `bsk_homepage_blocks` (
  `id` varchar(100) NOT NULL,
  `block_type` varchar(100) DEFAULT 'generic',
  `data` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bsk_homepage_blocks`
--

INSERT INTO `bsk_homepage_blocks` (`id`, `block_type`, `data`, `created_at`, `updated_at`) VALUES
('central_belief', 'homepage_blocks', '{\"title_bn\":\"বিশ্বসাহিত্য কেন্দ্র — একটি দেশব্যাপী আন্দোলন\",\"title_en\":\"Bishwo Shahitto Kendro — A National Awakening\",\"desc_bn\":\"বিশ্বসাহিত্য কেন্দ্র আজ আর শুধুমাত্র একটি সাধারণ লাইব্রেরি বা সভার কামরা নয়। এটি বাংলা ভাষাভাষী মানুষের চিত্তের সামগ্রিক ইতিবাচক পরিবর্তনের জন্য দেশব্যাপী জাতীয় ক্যারেক্টার ও চরিত্র তৈরি করার বিনীত প্রয়াস।\",\"desc_en\":\"Our movement stretches to accommodate every village school and local municipal body through continuous book reading assessments and high intellectual assemblies.\",\"btnText_bn\":\"আমাদের অর্জন ও ইতিহাস →\",\"btnText_en\":\"Core History & Milestones →\",\"btnRoute\":\"bsk-history\",\"stat1_val\":\"TEST\",\"stat1_lbl_bn\":\"বছরের গৌরবময় সংগ্রাম\",\"stat1_lbl_en\":\"Years of Legacy\",\"stat2_val\":\"৫০+\",\"stat2_lbl_bn\":\"দাতা ও সহযোগী\",\"stat2_lbl_en\":\"Global Donors\",\"stat3_val\":\"TEST\",\"stat3_lbl_bn\":\"বিতরণকৃত গ্রন্থসমূহ\",\"stat3_lbl_en\":\"Circulated Books\",\"stat4_val\":\"১২টি\",\"stat4_lbl_bn\":\"সক্রিয় বুদ্ধিজীবী ধারা\",\"stat4_lbl_en\":\"Core Programs\",\"id\":\"central_belief\",\"createdAt\":\"2026-08-18T11:29:12.719Z\",\"updatedAt\":\"2026-08-18T11:29:12+00:00\"}', '2026-08-18 11:29:12', '2026-08-18 11:29:12'),
('founder', 'homepage_blocks', '{\"name_bn\":\"TEST\",\"id\":\"founder\",\"createdAt\":\"2026-08-18T11:26:23.799Z\",\"updatedAt\":\"2026-08-19T09:39:01+00:00\",\"image\":\".\\/uploads\\/img_1787132339_43710a3a.jpeg\"}', '2026-08-19 09:39:01', '2026-08-19 09:39:01'),
('gallery_ml', 'homepage_blocks', '{\"slides\":[{\"image\":\"\\/assets\\/IMGS\\/LIBARY\\/484036140_1054485683369579_2651909291206012899_n.jpg\",\"category_bn\":\"ভ্রাম্যমাণ লাইব্রেরি\",\"category_en\":\"Mobile Library Network\",\"caption_bn\":\"বিশ্বসাহিত্য কেন্দ্র লাইব্রেরি কক্ষের মনোরম বইয়ের সারি\",\"caption_en\":\"A serene aisle of curated global books inside BSK Library\",\"route\":\"mobile-library\"},{\"image\":\".\\/uploads\\/img_1787132387_cdd4c2e8.jpg\",\"category_bn\":\"ভ্রাম্যমাণ লাইব্রেরি\",\"category_en\":\"Central Reading space\",\"caption_bn\":\"লাইব্রেরিতে নিবিড় অধ্যয়নরত পাঠক ও সভ্যবৃন্দ\",\"caption_en\":\"Avid members engrossed in deep study at BSK HQ\",\"route\":\"mobile-library\"}],\"id\":\"gallery_ml\",\"createdAt\":\"2026-08-18T08:41:37.474Z\",\"updatedAt\":\"2026-08-19T09:39:49+00:00\"}', '2026-08-19 09:39:49', '2026-08-19 09:39:49'),
('gallery_rh', 'homepage_blocks', '{\"slides\":[{\"image\":\"\\/assets\\/IMGS\\/482211665_1052017196949761_6208359942702643653_n.jpg\",\"category_bn\":\"দেশভিত্তিক উৎকর্ষ\",\"category_en\":\"Elite Book Assessment\",\"caption_bn\":\"দেশভিত্তিক উৎকর্ষ কার্যক্রমে বই মূল্যায়ন পরীক্ষা ও পুরস্কার\",\"caption_en\":\"Elite book evaluation assessments and creative reading rewards\",\"route\":\"reading-habit\"}],\"id\":\"gallery_rh\",\"createdAt\":\"2026-08-18T11:28:40.263Z\",\"updatedAt\":\"2026-08-18T11:28:42+00:00\"}', '2026-08-18 11:28:42', '2026-08-18 11:28:42'),
('portals', 'homepage_blocks', '{\"bcrs\":{\"bgImage\":\".\\/uploads\\/img_1787052634_545ea039.jpeg\"},\"id\":\"portals\",\"createdAt\":\"2026-08-18T11:30:45.359Z\",\"updatedAt\":\"2026-08-19T04:13:43+00:00\",\"alor\":{\"bgImage\":\".\\/uploads\\/img_1787112821_44eda6be.jpeg\"}}', '2026-08-19 04:13:43', '2026-08-19 04:13:43'),
('statistics', 'homepage_blocks', '{\"card1_title_bn\":\"test\",\"card1_value_bn\":\"test\",\"card1_desc_bn\":\"test\",\"card1_desc_en\":\"test\",\"card1_bgImage\":\".\\/uploads\\/img_1787112874_a0484aa0.jpeg\",\"card2_title_bn\":\"test\",\"card2_value_bn\":\"test\",\"card2_desc_bn\":\"test\",\"card2_title_en\":\"test\",\"card2_bgImage\":\".\\/uploads\\/img_1787112885_b402945c.jpeg\",\"card3_title_bn\":\"test\",\"card3_value_bn\":\"test\",\"card3_desc_bn\":\"test\",\"card3_bgImage\":\".\\/uploads\\/img_1787112893_b1b2c667.jpeg\",\"card4_title_bn\":\"test\",\"card4_value_bn\":\"testtest\",\"card4_desc_bn\":\"test\",\"card4_bgImage\":\".\\/uploads\\/img_1787112901_c235d85c.jpeg\",\"id\":\"statistics\",\"createdAt\":\"2026-08-19T04:15:02.888Z\",\"updatedAt\":\"2026-08-19T04:15:02+00:00\"}', '2026-08-19 04:15:02', '2026-08-19 04:15:02')
ON DUPLICATE KEY UPDATE `data` = VALUES(`data`);

-- --------------------------------------------------------

--
-- Table structure for table `bsk_inquiries`
--

CREATE TABLE IF NOT EXISTS `bsk_inquiries` (
  `id` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT 'general',
  `name` varchar(255) NOT NULL DEFAULT '',
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `institution` varchar(500) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'new',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bsk_job_applications`
--

CREATE TABLE IF NOT EXISTS `bsk_job_applications` (
  `id` varchar(100) NOT NULL,
  `circular_id` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `cv_file` varchar(500) DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'new',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bsk_media_files`
--

CREATE TABLE IF NOT EXISTS `bsk_media_files` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(500) DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_size` int(10) UNSIGNED DEFAULT NULL,
  `uploaded_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bsk_news`
--

CREATE TABLE IF NOT EXISTS `bsk_news` (
  `id` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'published',
  `title_bn` varchar(500) NOT NULL DEFAULT '',
  `title_en` varchar(500) DEFAULT NULL,
  `content_bn` longtext DEFAULT NULL,
  `content_en` longtext DEFAULT NULL,
  `summary_bn` text DEFAULT NULL,
  `summary_en` text DEFAULT NULL,
  `image` mediumtext DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `category` varchar(100) DEFAULT 'general',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bsk_notices`
--

CREATE TABLE IF NOT EXISTS `bsk_notices` (
  `id` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'published',
  `title_bn` varchar(500) NOT NULL DEFAULT '',
  `title_en` varchar(500) DEFAULT NULL,
  `desc_bn` text DEFAULT NULL,
  `desc_en` text DEFAULT NULL,
  `category` varchar(100) DEFAULT 'general',
  `publish_date` date DEFAULT NULL,
  `pdf_file` varchar(500) DEFAULT NULL,
  `is_urgent` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `date_bn` varchar(200) DEFAULT NULL,
  `date_en` varchar(200) DEFAULT NULL,
  `is_new` tinyint(1) DEFAULT 0,
  `file_url` text DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_name` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bsk_photo_albums`
--

CREATE TABLE IF NOT EXISTS `bsk_photo_albums` (
  `id` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'published',
  `title_bn` varchar(500) NOT NULL DEFAULT '',
  `title_en` varchar(500) DEFAULT NULL,
  `cover_image` mediumtext DEFAULT NULL,
  `photos` longtext DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bsk_photo_albums`
--

INSERT INTO `bsk_photo_albums` (`id`, `status`, `title_bn`, `title_en`, `cover_image`, `photos`, `sort_order`, `created_at`, `updated_at`) VALUES
('album_1787113174352', 'published', '', NULL, NULL, '[]', 0, '2026-08-19 04:19:40', '2026-08-19 04:19:40')
ON DUPLICATE KEY UPDATE `updated_at` = VALUES(`updated_at`);

-- --------------------------------------------------------

--
-- Table structure for table `bsk_press`
--

CREATE TABLE IF NOT EXISTS `bsk_press` (
  `id` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'published',
  `title_bn` varchar(500) DEFAULT NULL,
  `title_en` varchar(500) DEFAULT NULL,
  `content_bn` longtext DEFAULT NULL,
  `content_en` longtext DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `image` mediumtext DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bsk_press`
--

INSERT INTO `bsk_press` (`id`, `status`, `title_bn`, `title_en`, `content_bn`, `content_en`, `source`, `publish_date`, `image`, `link`, `created_at`, `updated_at`) VALUES
('press_1787113125640', 'published', 'dvs', 'wsf', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-19 04:19:05', '2026-08-19 04:19:05')
ON DUPLICATE KEY UPDATE `title_bn` = VALUES(`title_bn`);

-- --------------------------------------------------------

--
-- Table structure for table `bsk_programs`
--

CREATE TABLE IF NOT EXISTS `bsk_programs` (
  `id` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'published',
  `sort_order` int(11) DEFAULT 0,
  `title_bn` varchar(500) NOT NULL DEFAULT '',
  `title_en` varchar(500) DEFAULT NULL,
  `desc_bn` text DEFAULT NULL,
  `desc_en` text DEFAULT NULL,
  `tag_bn` varchar(200) DEFAULT NULL,
  `tag_en` varchar(200) DEFAULT NULL,
  `color_class` varchar(200) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `bg_image` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bsk_recent_activities`
--

CREATE TABLE IF NOT EXISTS `bsk_recent_activities` (
  `id` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'published',
  `sort_order` int(11) DEFAULT 0,
  `title_bn` varchar(500) NOT NULL DEFAULT '',
  `title_en` varchar(500) DEFAULT NULL,
  `desc_bn` text DEFAULT NULL,
  `desc_en` text DEFAULT NULL,
  `date_bn` varchar(100) DEFAULT NULL,
  `date_en` varchar(100) DEFAULT NULL,
  `location_bn` varchar(500) DEFAULT NULL,
  `location_en` varchar(500) DEFAULT NULL,
  `category_bn` varchar(200) DEFAULT NULL,
  `category_en` varchar(200) DEFAULT NULL,
  `caption_bn` text DEFAULT NULL,
  `caption_en` text DEFAULT NULL,
  `image` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bsk_recent_activities`
--

INSERT INTO `bsk_recent_activities` (`id`, `status`, `sort_order`, `title_bn`, `title_en`, `desc_bn`, `desc_en`, `date_bn`, `date_en`, `location_bn`, `location_en`, `category_bn`, `category_en`, `caption_bn`, `caption_en`, `image`, `created_at`, `updated_at`) VALUES
('act-1787052326359', 'published', 1, 'নতুন কার্যক্রমের নাম', 'New Activity Title', 'সংক্ষিপ্ত বিবরণী এখানে লিখুন।', 'Brief description goes here.', '১১ জুন ২০২৬', 'June 11, 2526', 'বিশ্বসাহিত্য কেন্দ্র লবি, ঢাকা', 'BSK Premises, Dhaka', 'কার্যক্রম', 'Program', '', '', './uploads/img_1787052337_feceefb3.jpg', '2026-08-18 11:25:53', '2026-08-18 11:25:53'),
('act-1787052356199', 'published', 2, 'নতুন কার্যক্রমের নাম', 'New Activity Title', 'সংক্ষিপ্ত বিবরণী এখানে লিখুন।', 'Brief description goes here.', '১১ জুন ২০২৬', 'June 11, 2526', 'বিশ্বসাহিত্য কেন্দ্র লবি, ঢাকা', 'BSK Premises, Dhaka', 'কার্যক্রম', 'Program', '', '', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80', '2026-08-18 11:26:02', '2026-08-18 11:26:02')
ON DUPLICATE KEY UPDATE `title_bn` = VALUES(`title_bn`);

-- --------------------------------------------------------

--
-- Table structure for table `bsk_recruitment_circulars`
--

CREATE TABLE IF NOT EXISTS `bsk_recruitment_circulars` (
  `id` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'published',
  `title_bn` varchar(500) NOT NULL DEFAULT '',
  `title_en` varchar(500) DEFAULT NULL,
  `desc_bn` text DEFAULT NULL,
  `desc_en` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `pdf_file` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `position_bn` varchar(500) DEFAULT NULL,
  `position_en` varchar(500) DEFAULT NULL,
  `dept_bn` varchar(500) DEFAULT NULL,
  `dept_en` varchar(500) DEFAULT NULL,
  `deadline_bn` varchar(200) DEFAULT NULL,
  `deadline_en` varchar(200) DEFAULT NULL,
  `file_url` text DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_name` varchar(500) DEFAULT NULL,
  `apply_url` varchar(500) DEFAULT NULL,
  `apply_file_url` text DEFAULT NULL,
  `apply_file_name` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bsk_settings`
--

CREATE TABLE IF NOT EXISTS `bsk_settings` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `site_name` varchar(500) DEFAULT 'বিশ্বসাহিত্য কেন্দ্র',
  `site_name_en` varchar(500) DEFAULT 'Bishwo Shahitto Kendro',
  `site_link` varchar(500) DEFAULT 'https://bskbd.org/',
  `site_address` text DEFAULT NULL,
  `site_contact_1` varchar(50) DEFAULT NULL,
  `site_contact_2` varchar(50) DEFAULT NULL,
  `site_email` varchar(255) DEFAULT NULL,
  `site_logo` varchar(500) DEFAULT NULL,
  `facebook_link` varchar(500) DEFAULT NULL,
  `youtube_link` varchar(500) DEFAULT NULL,
  `maintenance_mode` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bsk_website_pages`
--

CREATE TABLE IF NOT EXISTS `bsk_website_pages` (
  `id` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'published',
  `sort_order` int(11) DEFAULT 0,
  `title_bn` varchar(500) NOT NULL DEFAULT '',
  `title_en` varchar(500) DEFAULT NULL,
  `html_title` varchar(500) DEFAULT NULL,
  `subtitle_bn` text DEFAULT NULL,
  `subtitle_en` text DEFAULT NULL,
  `badge_bn` varchar(200) DEFAULT NULL,
  `hero_image` varchar(500) DEFAULT NULL,
  `category` varchar(100) DEFAULT 'general',
  `sections` longtext DEFAULT NULL,
  `extra_data` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bsk_website_pages`
--

INSERT INTO `bsk_website_pages` (`id`, `status`, `sort_order`, `title_bn`, `title_en`, `html_title`, `subtitle_bn`, `subtitle_en`, `badge_bn`, `hero_image`, `category`, `sections`, `extra_data`, `created_at`, `updated_at`) VALUES
('home', 'published', 0, 'বিশ্বসাহিত্য কেন্দ্র পরিচিতি', 'About BSK', 'বিশ্বসাহিত্য কেন্দ্র', NULL, NULL, NULL, NULL, 'general', '[{\"title\":\"ব্রত ও লক্ষ্য test\",\"content\":[\"অনেক ত্যাগ-তিতিক্ষা ও আত্মদানের ভিতর দিয়ে জন্ম নিয়েছে বাংলাদেশ। আজ তার নির্মাণের পর্ব। এই নির্মাণকে অর্থময় করার জন্যে আজ দেশে চাই অনেক সম্পন্ন মানুষ; সেইসব মানুষ যারা উচ্চ-মূল্যবোধসম্পন্ন, আলোকিত, উদার, শক্তিমান ও কার্যকর- যারা জাতীয়-জীবনের বিভিন্ন অঙ্গনে নেতৃত্ব দিয়ে এই জাতিকে সমৃদ্ধির পথে এগিয়ে নিতে পারবে। তাদের আজ পেতে হবে আমাদের বিপুল সংখ্যায়- সারা দেশে, সবখানে। এককে-দশকে নয়; সহস্রে, লক্ষে।\",\"“সারা দেশের সবখানে পর্যাপ্ত সংখ্যায় এইসব আলোকিত, কার্যকর ও উচ্চমূল্যবোধ সম্পন্ন মানুষ গড়ে তোলার সুযোগ সৃষ্টি করা, জাতীয় শক্তি হিশেবে তাদের সংঘবদ্ধ ও সমুন্নত করা এবং এরই পাশাপাশি দেশের মানুষের চিত্তের সামগ্রিক আলোকায়ন ঘটানো বিশ্বসাহিত্য কেন্দ্রের মূল লক্ষ্য।”\"]},{\"title\":\"ইতিহাস ও যাত্রা\",\"content\":[\"১৭ ডিসেম্বর ১৯৭৮। ঢাকা কলেজের পেছনে শিক্ষা সম্প্রসারণ কেন্দ্রের ছোট্ট মিলনায়তনটিতে শুরু হল একটি ছোট্ট পাঠচক্র। সভ্যসংখ্যা মাত্র পনেরো। ঠিক হল প্রতি সপ্তাহে তারা প্রত্যেকে একটি নির্ধারিত বই পড়ে পরের সপ্তাহের এই দিনে এখানে এসে মিলিত হবে এক তপ্ত মুখর অন্তরঙ্গ আলোচনায়। বইগুলোর ভেতর লেখকদের যে আত্মার আলো জ্বলছে তার সঙ্গে নিজেদের বহুমুখী বোধের আলো মিশিয়ে তারা জেগে উঠবে উচ্চতর মানবিক সমৃদ্ধির দিকে।\",\"পাঁচ বছর পর এই পাঠচক্রের আশাতীত সাফল্য দেখে দেশব্যাপী পরিব্যপ্ত করার চিন্তা আসে। আজ এটি কোনো গৎ-বাঁধা, ছক-কাটা, প্রাণহীন শিক্ষাপ্রতিষ্ঠান নয়, বরং একটি সপ্রাণ সজীব পরিবেশ- জ্ঞান ও জীবনসংগ্রামের ভেতর দিয়ে পূর্ণতর মনুষ্যত্বে ও উন্নততর আনন্দে জেগে ওঠার এক দেশব্যাপী মহতী আন্দোলন।\"]},{\"title\":\"অর্জিত সম্মান ও পুরস্কার\",\"content\":[\"গত ৪ দশকের অধিক সময় ধরে বিশ্বসাহিত্য কেন্দ্র স্কুল ও কলেজের প্রায় ৯০,০০,০০০ (নব্বই লক্ষ) ছাত্রছাত্রী ও সাধারণ পাঠককে সমৃদ্ধ এবং আলোকিত মননশীল কর্মকাণ্ডে সম্পৃক্ত করেছে। বিশ্বসাহিত্য কেন্দ্র ও এর প্রতিষ্ঠাতা অধ্যাপক আবদুল্লাহ আবু সায়ীদ বিভিন্ন মহৎ কর্মের স্বীকৃতিস্বরূপ জাতীয় ও আন্তর্জাতিক পর্যায়ে একাধিক বিরল সম্মানে ভূষিত হয়েছেন।\"]},{\"title\":\"উক্তি\",\"content\":[\"“বিশ্বসাহিত্য কেন্দ্র আজ আর শুধুমাত্র একটি প্রতিষ্ঠান নয়। এটি আজ একটি দেশব্যাপী আন্দোলন। আলোকিত জাতীয় চিত্তের একটি বিনীত নিশ্চয়তা। মানবজ্ঞানের সামগ্রিক চর্চা এবং অনুশীলনের পাশাপাশি হৃদয়ের উৎকর্ষ ও জীবনের বহুবিচিত্র কর্মকাণ্ডের মধ্য দিয়ে উচ্চতর শক্তি ও মনুষ্যত্বে বিকশিত হবার একটি সপ্রাণ পৃথিবী।”\"]}]', NULL, '2026-08-19 09:42:41', '2026-08-19 09:42:41')
ON DUPLICATE KEY UPDATE `title_bn` = VALUES(`title_bn`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
