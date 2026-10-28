-- ============================================================================
-- DATABASE SCHEMA: LOMBOK NUSANTARA TRAVEL (MySQL / MariaDB)
-- File: database.sql
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `lombok_nusantara_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `lombok_nusantara_db`;

-- ----------------------------------------------------------------------------
-- 1. Tabel Paket Wisata (packages)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `packages` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `title_id` VARCHAR(160) NOT NULL,
  `title_en` VARCHAR(160) NOT NULL,
  `region` ENUM('gili', 'mandalika', 'rinjani', 'pink-beach', 'culture', 'mice') NOT NULL,
  `segment` ENUM('domestik', 'honeymoon', 'internasional', 'korporat') NOT NULL,
  `duration_days` INT UNSIGNED NOT NULL DEFAULT 1,
  `min_pax` INT UNSIGNED NOT NULL DEFAULT 2,
  `max_pax` INT UNSIGNED NOT NULL DEFAULT 20,
  `price_idr` BIGINT UNSIGNED NOT NULL,
  `ota_price_idr` BIGINT UNSIGNED NOT NULL,
  `price_usd` INT UNSIGNED NOT NULL,
  `ota_price_usd` INT UNSIGNED NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_packages_slug` (`slug`),
  KEY `idx_packages_region_segment` (`region`, `segment`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed 6 Paket Unggulan Lombok Nusantara Travel
INSERT INTO `packages` (
  `id`, `slug`, `title_id`, `title_en`, `region`, `segment`,
  `duration_days`, `min_pax`, `max_pax`, `price_idr`, `ota_price_idr`, `price_usd`, `ota_price_usd`
) VALUES
  ('pkg-3gili-private', 'snorkeling-3-gili-trawangan-meno-air', 'Eksplorasi 3 Gili & Konservasi Penyu (Glass Bottom Boat)', '3 Gili Islands Private Snorkeling & Turtle Sanctuary Charter', 'gili', 'domestik', 1, 2, 12, 650000, 820000, 45, 58),
  ('pkg-mandalika-3d2n', 'paket-wisata-lombok-mandalika-sade-3h2m', 'Pesona Mandalika, Bukit Merese & Warisan Sasak 3 Hari 2 Malam', 'Mandalika Coastline, Merese Hill & Sasak Heritage 3D2N Escape', 'mandalika', 'honeymoon', 3, 2, 20, 2450000, 3100000, 165, 210),
  ('pkg-rinjani-3d2n', 'paket-pendakian-gunung-rinjani-sembalun-3h2m', 'Ekspedisi Puncak Gunung Rinjani (3.726 mdpl) & Danau Segara Anak 3H2M', 'Mount Rinjani Summit (3,726m) & Segara Anak Crater Lake Trek 3D2N', 'rinjani', 'internasional', 3, 2, 10, 3450000, 4350000, 225, 290),
  ('pkg-pink-beach-private', 'tur-privat-pink-beach-pulau-pasir-gili-petelu', 'Private Boat Tour Pink Beach, Pulau Pasir & Gili Petelu Lombok Timur', 'East Lombok Pink Beach, Sandbar Island & Gili Petelu Private Boat Tour', 'pink-beach', 'honeymoon', 1, 2, 10, 780000, 980000, 52, 68),
  ('pkg-sade-benang-kelambu', 'tur-budaya-desa-sade-air-terjun-benang-kelambu', 'Jejak Budaya Sasak Desa Sade & Air Terjun Tirai Benang Kelambu', 'Sasak Cultural Heritage & Benang Kelambu Curtain Waterfall Day Tour', 'culture', 'domestik', 1, 2, 14, 590000, 750000, 40, 52),
  ('pkg-corporate-mice-4d3n', 'paket-gathering-kantor-mice-lombok-4h3m', 'Paket Gathering Korporat, Outbound & MICE Lombok Eksklusif 4H3M', 'Corporate Retreat, Team Outbound & MICE Mandalika Package 4D3N', 'mice', 'korporat', 4, 20, 150, 3650000, 4500000, 240, 295)
ON DUPLICATE KEY UPDATE
  `price_idr` = VALUES(`price_idr`),
  `price_usd` = VALUES(`price_usd`);

-- ----------------------------------------------------------------------------
-- 2. Tabel Reservasi Paket Wisata (bookings)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_ref` VARCHAR(32) NOT NULL,
  `owner_uid` VARCHAR(128) DEFAULT NULL,
  `package_id` VARCHAR(64) NOT NULL,
  `package_title` VARCHAR(160) NOT NULL,
  `travel_date` DATE NOT NULL,
  `pax` INT UNSIGNED NOT NULL DEFAULT 2,
  `total_price_idr` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `total_price_usd` INT UNSIGNED NOT NULL DEFAULT 0,
  `add_ons` VARCHAR(200) DEFAULT '',
  `guest_name` VARCHAR(100) NOT NULL,
  `guest_contact` VARCHAR(120) NOT NULL,
  `pickup_notes` VARCHAR(300) DEFAULT '',
  `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bookings_ref` (`booking_ref`),
  KEY `idx_bookings_travel_date` (`travel_date`),
  KEY `idx_bookings_status` (`status`),
  CONSTRAINT `fk_bookings_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Tabel Reservasi Transfer Bandara LOP & Sewa Mobil (transfers)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transfers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_uid` VARCHAR(128) DEFAULT NULL,
  `route_id` VARCHAR(64) NOT NULL,
  `route_name` VARCHAR(160) NOT NULL,
  `vehicle_type` ENUM('avanza', 'innova', 'hiace') NOT NULL DEFAULT 'innova',
  `pickup_date` DATE NOT NULL,
  `flight_code` VARCHAR(60) DEFAULT '',
  `price_idr` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `price_usd` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transfers_pickup_date` (`pickup_date`),
  KEY `idx_transfers_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Tabel Inkuiri Itinerary Custom & MICE (inquiries)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_uid` VARCHAR(128) DEFAULT NULL,
  `guest_name` VARCHAR(100) NOT NULL,
  `contact_info` VARCHAR(120) NOT NULL,
  `segment` VARCHAR(80) NOT NULL,
  `pax_count` INT UNSIGNED NOT NULL DEFAULT 2,
  `notes` VARCHAR(500) DEFAULT '',
  `status` ENUM('new', 'replied', 'closed') NOT NULL DEFAULT 'new',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inquiries_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Tabel Administrator (admins)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(120) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('superadmin', 'staff') NOT NULL DEFAULT 'superadmin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admins` (`email`, `password_hash`, `full_name`, `role`)
VALUES ('muhammadhuasin9011@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Lombok Nusantara Travel', 'superadmin')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);
